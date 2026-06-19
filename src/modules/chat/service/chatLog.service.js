import httpStatus from 'http-status';
import ApiError from '../../../utils/ApiError.js';
import ChatLog, { buildChatReferenceId } from '../models/chatLog.model.js';

const OID = /^[0-9a-fA-F]{24}$/;

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
  source = '',
  topicId = '',
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
    referenceId: buildChatReferenceId(sessionId),
    source: source || undefined,
    topicId: topicId || undefined,
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

function parsePagination(query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function buildChatLogFilter(query = {}) {
  const filter = {};

  const sessionId = String(query.sessionId ?? '').trim();
  if (sessionId) filter.sessionId = sessionId;

  const referenceId = String(query.referenceId ?? '').trim();
  if (referenceId) filter.referenceId = referenceId;

  const topicId = String(query.topicId ?? '').trim();
  if (topicId) filter.topicId = topicId;

  if (query.source === 'ai' || query.source === 'guided_topic') {
    filter.source = query.source;
  }

  if (query.lang === 'en' || query.lang === 'ar') {
    filter.lang = query.lang;
  }

  if (query.success === 'true') filter.success = true;
  if (query.success === 'false') filter.success = false;

  if (query.isViewed === 'true') filter.isViewed = true;
  if (query.isViewed === 'false') {
    filter.isViewed = { $ne: true };
  }

  const search = String(query.search ?? '').trim();
  if (search) {
    filter.$or = [
      { lastUserMessage: { $regex: search, $options: 'i' } },
      { assistantReply: { $regex: search, $options: 'i' } },
      { referenceId: { $regex: search, $options: 'i' } },
    ];
  }

  return filter;
}

export async function countUnviewedChatLogs() {
  return ChatLog.countDocuments({ isViewed: { $ne: true } });
}

export async function fetchAllChatLogs(query = {}) {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildChatLogFilter(query);

  const [rows, total, unviewedCount] = await Promise.all([
    ChatLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ChatLog.countDocuments(filter),
    countUnviewedChatLogs(),
  ]);

  return {
    rows,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 0,
      unviewedCount,
    },
  };
}

export async function fetchChatLogsBySessionId(sessionId) {
  const id = String(sessionId ?? '').trim();
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'sessionId is required');
  }

  const rows = await ChatLog.find({ sessionId: id }).sort({ createdAt: 1 }).lean();
  if (!rows.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No chat logs found for this session');
  }

  return rows;
}

function normalizeReferenceId(referenceId) {
  const raw = decodeURIComponent(String(referenceId ?? '').trim());
  if (!raw) return '';
  const upper = raw.toUpperCase();
  if (upper.startsWith('REF#')) return upper;
  if (upper.startsWith('REF-')) return `REF#${upper.slice(4)}`;
  return `REF#${upper}`;
}

export async function fetchChatLogsByReferenceId(referenceId) {
  const normalized = normalizeReferenceId(referenceId);
  if (!normalized) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'referenceId is required');
  }

  const rows = await ChatLog.find({ referenceId: normalized }).sort({ createdAt: 1 }).lean();
  if (!rows.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No chat logs found for this reference');
  }

  return rows;
}

export async function fetchChatLogById(id) {
  if (!OID.test(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid chat log id');
  }

  const row = await ChatLog.findByIdAndUpdate(
    id,
    { isViewed: true },
    { new: true, runValidators: true },
  ).lean();

  if (!row) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Chat log not found');
  }

  return row;
}
