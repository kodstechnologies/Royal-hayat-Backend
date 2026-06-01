import httpStatus from 'http-status';
import ApiError from '../../../utils/ApiError.js';
import { buildGroundingContext } from './chatGrounding.service.js';

const MAX_HISTORY_TURNS = Number(process.env.CHAT_MAX_HISTORY_TURNS || 16);

/** Valid for generativelanguage.googleapis.com v1beta (AI Studio keys). */
const DEFAULT_FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
];

const BASE_GUIDELINES = `
Primary role: Help visitors understand and use the Royale Hayat website — where to click, which page to open, and what each section is for. Answer "how do I…?" with clear numbered steps and exact internal links from the reference.

Guidelines:
- Ground every answer in the REFERENCE below (site map, tasks, FAQs, departments). Do not invent pages, doctors, prices, or availability.
- Prefer step-by-step navigation: "Go to [Page name](/path)" using only paths listed in the reference.
- For departments, use only the exact /medical-services/{slug} paths from the reference (never add ID suffixes or invent slugs).
- Markdown links MUST be complete on one line with a closing parenthesis, e.g. [Doctors](/doctors) — never leave a link unfinished.
- The floating chat already has quick buttons (Book Appointment, Al Safwa, Jobs, Home Health) and WhatsApp — you may mention them alongside your steps; do not tell users those options were removed.
- For emergencies or urgent symptoms: call +965 2536 0000 or go to the emergency department immediately.
- You are NOT a doctor: no diagnosis, prescriptions, or treatment advice.
- Keep answers concise (under ~150 words) unless the user asks for more detail.
- If the reference does not cover something: suggest [Contact Us](/contact-us) or +965 2536 0000.`;

export const CHAT_ERROR_CODES = {
  MODEL_OVERLOADED: 'MODEL_OVERLOADED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  GENERIC: 'GENERIC',
};

function getRetryDelayMs() {
  const ms = Number(process.env.CHAT_MODEL_RETRY_DELAY_MS || 400);
  return Number.isFinite(ms) && ms >= 0 ? ms : 400;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getChatModels() {
  const primary = (process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash').trim();
  const fromEnv = (process.env.GEMINI_CHAT_MODEL_FALLBACKS || '')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
  const fallbacks = fromEnv.length > 0 ? fromEnv : DEFAULT_FALLBACK_MODELS;
  return [...new Set([primary, ...fallbacks])];
}

function geminiGenerateUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

function geminiStreamUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`;
}

/** HTTP statuses where trying the next model may succeed. */
function isRetryableModelError(status) {
  return status === 503 || status === 429 || status === 500 || status === 502 || status === 504 || status === 404;
}

function throwGeminiHttpError(status, errBody, logLabel = 'Gemini API error') {
  console.error(`[chat] ${logLabel}`, status, String(errBody).slice(0, 500));

  if (status === 503 || status === 429) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Assistant is busy.', {
      code: CHAT_ERROR_CODES.MODEL_OVERLOADED,
    });
  }

  if (status === 401 || status === 403) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Assistant is not configured.', {
      code: CHAT_ERROR_CODES.SERVICE_UNAVAILABLE,
    });
  }

  throw new ApiError(httpStatus.BAD_GATEWAY, 'Assistant request failed.', {
    code: CHAT_ERROR_CODES.GENERIC,
  });
}

function throwAfterAllModelsFailed(attempts) {
  const last = attempts[attempts.length - 1];
  const sawRateLimit = attempts.some((a) => a.status === 503 || a.status === 429);

  const modelsAttempted = attempts.map((a) => a.model).filter(Boolean);

  if (sawRateLimit) {
    console.warn(
      `[chat] all ${attempts.length} model(s) rate-limited or unavailable: ${attempts.map((a) => `${a.model}(${a.status})`).join(', ')}`,
    );
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Assistant is busy.', {
      code: CHAT_ERROR_CODES.MODEL_OVERLOADED,
      modelsAttempted,
    });
  }

  if (last) {
    const status = last.status || httpStatus.BAD_GATEWAY;
    console.error(`[chat] All models failed (last: ${last.model})`, status, String(last.body).slice(0, 500));
    if (status === 401 || status === 403) {
      throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Assistant is not configured.', {
        code: CHAT_ERROR_CODES.SERVICE_UNAVAILABLE,
        modelsAttempted,
      });
    }
    throw new ApiError(httpStatus.BAD_GATEWAY, 'Assistant request failed.', {
      code: CHAT_ERROR_CODES.GENERIC,
      modelsAttempted,
    });
  }

  throw new ApiError(httpStatus.BAD_GATEWAY, 'Assistant request failed.', {
    code: CHAT_ERROR_CODES.GENERIC,
    modelsAttempted,
  });
}

function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.error('[chat] GEMINI_API_KEY is missing — set it in .env or the ENV_FILE deploy secret');
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Chat assistant is temporarily unavailable. Please call +965 2536 0000.',
      { code: CHAT_ERROR_CODES.SERVICE_UNAVAILABLE, reason: 'missing_api_key' },
    );
  }
  return apiKey;
}

function toGeminiContents(messages) {
  const trimmed = messages.slice(-MAX_HISTORY_TURNS);
  return trimmed.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
}

function getGenerationConfig() {
  const temperature = Number(process.env.GEMINI_CHAT_TEMPERATURE || 0.6);
  const maxOutputTokens = Number(process.env.GEMINI_CHAT_MAX_OUTPUT_TOKENS || 1024);
  return {
    temperature: Number.isFinite(temperature) ? temperature : 0.6,
    maxOutputTokens: Number.isFinite(maxOutputTokens) ? maxOutputTokens : 1024,
  };
}

async function buildSystemInstruction(lang) {
  const languageRule =
    lang === 'ar'
      ? 'Reply entirely in Modern Standard Arabic (فصحى), polite and professional.'
      : 'Reply entirely in English, polite and professional.';

  const grounding = await buildGroundingContext(lang);

  return `You are the Royale Hayat AI Health Assistant on the hospital's official website. You help users navigate the site and complete tasks (booking, finding departments/doctors, forms, patient info, careers, hospitality). You are NOT a doctor and must NOT diagnose, prescribe, or give specific medical treatment advice.

${languageRule}
${BASE_GUIDELINES}

--- REFERENCE (authoritative hospital information) ---
${grounding}
--- END REFERENCE ---`;
}

async function buildGeminiRequestBody({ messages, lang }) {
  const contents = toGeminiContents(messages);
  const last = contents[contents.length - 1];
  if (!last || last.role !== 'user') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'The last message must be from the user.');
  }

  return {
    systemInstruction: {
      parts: [{ text: await buildSystemInstruction(lang) }],
    },
    contents,
    generationConfig: getGenerationConfig(),
  };
}

function extractReplyText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts
    .map((p) => (typeof p?.text === 'string' ? p.text : ''))
    .join('');
}

function parseGeminiSseBuffer(buffer) {
  const chunks = [];
  const lines = buffer.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) continue;
    const payload = trimmed.slice(5).trim();
    if (!payload || payload === '[DONE]') continue;
    try {
      const parsed = JSON.parse(payload);
      const text = extractReplyText(parsed);
      if (text) chunks.push(text);
    } catch {
      // ignore malformed SSE lines
    }
  }
  return chunks;
}

async function readGeminiStreamBody(body, onChunk) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullReply = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      for (const text of parseGeminiSseBuffer(part)) {
        fullReply += text;
        if (onChunk) onChunk(text);
      }
    }
  }

  if (buffer.trim()) {
    for (const text of parseGeminiSseBuffer(buffer)) {
      fullReply += text;
      if (onChunk) onChunk(text);
    }
  }

  return fullReply.trim();
}

async function callGeminiGenerate(apiKey, model, body) {
  const response = await fetch(geminiGenerateUrl(model), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    return { ok: false, status: response.status, body: errBody, reply: '' };
  }

  const data = await response.json();
  return { ok: true, status: 200, body: '', reply: extractReplyText(data).trim() };
}

async function callGeminiStream(apiKey, model, body, onChunk) {
  const response = await fetch(geminiStreamUrl(model), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    return { ok: false, status: response.status, body: errBody, reply: '' };
  }

  if (!response.body) {
    return { ok: false, status: 502, body: 'No stream body', reply: '' };
  }

  const reply = await readGeminiStreamBody(response.body, onChunk);
  return { ok: true, status: 200, body: '', reply };
}

export async function generateChatReply({ messages, lang }) {
  const apiKey = getApiKey();
  const body = await buildGeminiRequestBody({ messages, lang });
  const models = getChatModels();
  const failedAttempts = [];

  for (let i = 0; i < models.length; i += 1) {
    const model = models[i];

    let result;
    try {
      result = await callGeminiGenerate(apiKey, model, body);
    } catch {
      failedAttempts.push({ model, status: 0, body: 'network error' });
      continue;
    }

    if (result.ok && result.reply) {
      if (i > 0) {
        console.log(`[chat] generateContent succeeded with fallback model: ${model}`);
      }
      return { reply: result.reply, model, modelsAttempted: models.slice(0, i + 1) };
    }

    failedAttempts.push({ model, status: result.status, body: result.body });

    if (!isRetryableModelError(result.status)) {
      throwGeminiHttpError(result.status, result.body, `Gemini error (${model})`);
    }

    console.warn(`[chat] model ${model} failed (${result.status}), trying next model…`);
    if (isRetryableModelError(result.status)) {
      await sleep(getRetryDelayMs());
    }
  }

  throwAfterAllModelsFailed(failedAttempts);
}

/**
 * Streams Gemini reply chunks. Tries primary model then fallbacks on overload/unavailable.
 */
export async function streamChatReply({ messages, lang }, onChunk) {
  const apiKey = getApiKey();
  const body = await buildGeminiRequestBody({ messages, lang });
  const models = getChatModels();
  const failedAttempts = [];

  for (let i = 0; i < models.length; i += 1) {
    const model = models[i];

    let result;
    try {
      result = await callGeminiStream(apiKey, model, body, i === 0 ? onChunk : undefined);
    } catch {
      failedAttempts.push({ model, status: 0, body: 'stream read error' });
      continue;
    }

    if (result.ok && result.reply) {
      if (i > 0) {
        console.log(`[chat] streamGenerateContent succeeded with fallback model: ${model}`);
        if (onChunk) onChunk(result.reply);
      }
      return {
        reply: result.reply,
        model,
        modelsAttempted: models.slice(0, i + 1),
      };
    }

    failedAttempts.push({ model, status: result.status, body: result.body });

    if (!isRetryableModelError(result.status)) {
      throwGeminiHttpError(result.status, result.body, `Gemini stream error (${model})`);
    }

    console.warn(`[chat] model ${model} stream failed (${result.status}), trying next model…`);
    if (isRetryableModelError(result.status)) {
      await sleep(getRetryDelayMs());
    }
  }

  throwAfterAllModelsFailed(failedAttempts);
}
