import ChatLog from '../models/chatLog.model.js';

const MAX_STORED_CHARS = Number(process.env.CHAT_LOG_MAX_CHARS || 8000);

function isLoggingEnabled() {
  return process.env.CHAT_LOG_ENABLED !== 'false';
}

function truncate(text, max = MAX_STORED_CHARS) {
  const s = String(text ?? '');
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

function sanitizeMessages(messages) {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: truncate(m.content, MAX_STORED_CHARS),
  }));
}

function getLastUserMessage(messages) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === 'user' && messages[i].content?.trim()) {
      return truncate(messages[i].content.trim(), 2000);
    }
  }
  return '';
}

/**
 * Persist chat Q&A for prompt/response analysis (non-blocking; never throws to caller).
 */
export function logChatExchange({
  messages,
  lang,
  assistantReply = '',
  model = '',
  success = false,
  errorCode = null,
  stream = true,
  latencyMs = null,
  clientIp = '',
  sessionId = '',
  modelsAttempted = [],
}) {
  if (!isLoggingEnabled()) return;

  const safeMessages = sanitizeMessages(messages);
  const lastUserMessage = getLastUserMessage(safeMessages);
  const payload = {
    lang,
    messages: safeMessages,
    lastUserMessage,
    assistantReply: truncate(assistantReply),
    model: model || undefined,
    success: Boolean(success),
    errorCode: errorCode || undefined,
    stream: Boolean(stream),
    latencyMs: Number.isFinite(latencyMs) ? latencyMs : undefined,
    clientIp: clientIp || undefined,
    sessionId: sessionId || undefined,
    modelsAttempted: modelsAttempted.length > 0 ? modelsAttempted : undefined,
  };

  const consoleLine = {
    success: payload.success,
    lang: payload.lang,
    model: payload.model,
    latencyMs: payload.latencyMs,
    stream: payload.stream,
    question: payload.lastUserMessage?.slice(0, 120),
    reply: payload.assistantReply?.slice(0, 120),
    errorCode: payload.errorCode,
    modelsAttempted: payload.modelsAttempted,
  };

  setImmediate(async () => {
    try {
      await ChatLog.create(payload);

      if (!payload.success) {
        console.error('[chat][error]', consoleLine);
      } else if (process.env.CHAT_LOG_TO_CONSOLE === 'true') {
        console.log('[chat][ok]', consoleLine);
      }
    } catch (err) {
      console.error('[chat][log] failed to save:', err.message, consoleLine);
    }
  });
}
