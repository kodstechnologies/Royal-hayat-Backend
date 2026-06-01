import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import ApiError from '../../../utils/ApiError.js';
import { postChatSchema } from '../validators/chat.validator.js';
import { generateChatReply, streamChatReply } from '../service/chat.service.js';
import { logChatExchange } from '../service/chatLog.service.js';

function validateChatBody(body) {
  const { error, value } = postChatSchema.validate(body, { abortEarly: false });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(', '),
    );
  }
  return value;
}

function writeSse(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function requestMeta(req, value) {
  return {
    clientIp: req.ip || req.socket?.remoteAddress || '',
    sessionId: value.sessionId?.trim() || undefined,
  };
}

export const postChat = asyncHandler(async (req, res) => {
  const value = validateChatBody(req.body);
  const startedAt = Date.now();
  const meta = requestMeta(req, value);

  try {
    const { reply, model, modelsAttempted } = await generateChatReply(value);

    logChatExchange({
      messages: value.messages,
      lang: value.lang,
      assistantReply: reply,
      model,
      success: true,
      stream: false,
      latencyMs: Date.now() - startedAt,
      modelsAttempted,
      ...meta,
    });

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Chat reply generated successfully',
      data: { reply },
    });
  } catch (err) {
    const code =
      err instanceof ApiError && err.meta?.code ? String(err.meta.code) : 'GENERIC';
    logChatExchange({
      messages: value.messages,
      lang: value.lang,
      success: false,
      errorCode: code,
      stream: false,
      latencyMs: Date.now() - startedAt,
      modelsAttempted: err instanceof ApiError ? err.meta?.modelsAttempted : undefined,
      ...meta,
    });
    throw err;
  }
});

export const postChatStream = asyncHandler(async (req, res) => {
  const value = validateChatBody(req.body);
  const startedAt = Date.now();
  const meta = requestMeta(req, value);

  const lastUser = [...value.messages].reverse().find((m) => m.role === 'user');
  console.log(
    `[chat][stream] start lang=${value.lang} ip=${meta.clientIp || '-'} session=${meta.sessionId ? 'yes' : 'no'} q="${String(lastUser?.content || '').slice(0, 80)}"`,
  );

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  writeSse(res, { type: 'start' });

  try {
    const { reply, model, modelsAttempted } = await streamChatReply(value, (text) => {
      writeSse(res, { type: 'chunk', text });
    });
    writeSse(res, { type: 'done', reply });

    logChatExchange({
      messages: value.messages,
      lang: value.lang,
      assistantReply: reply,
      model,
      success: true,
      stream: true,
      latencyMs: Date.now() - startedAt,
      modelsAttempted,
      ...meta,
    });
  } catch (err) {
    const code =
      err instanceof ApiError && err.meta?.code ? String(err.meta.code) : 'GENERIC';
    const message =
      err instanceof ApiError
        ? err.message
        : 'The assistant could not respond. Please try again or call +965 2536 0000.';

    logChatExchange({
      messages: value.messages,
      lang: value.lang,
      success: false,
      errorCode: code,
      stream: true,
      latencyMs: Date.now() - startedAt,
      modelsAttempted: err instanceof ApiError ? err.meta?.modelsAttempted : undefined,
      ...meta,
    });

    console.error(
      `[chat][stream] failed code=${code} status=${err?.statusCode || '-'} msg=${message}`,
      err instanceof Error && err.meta ? { meta: err.meta } : '',
    );
    writeSse(res, { type: 'error', code, message });
  }

  res.end();
});
