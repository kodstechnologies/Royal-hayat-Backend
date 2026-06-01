function maskKey(key) {
  const s = String(key || '').trim();
  if (!s) return '(not set)';
  if (s.length <= 8) return '***';
  return `${s.slice(0, 4)}…${s.slice(-4)} (${s.length} chars)`;
}

function looksLikeAiStudioKey(key) {
  return /^AIza[\w-]+$/i.test(String(key || '').trim());
}

/**
 * Log chat/Gemini config at process start (no secrets in full).
 */
export function logChatBootConfig() {
  const key = process.env.GEMINI_API_KEY?.trim();
  const primary = (process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash').trim();
  const fallbacks = (process.env.GEMINI_CHAT_MODEL_FALLBACKS || '')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);

  console.log('[chat][boot] GEMINI_API_KEY=', maskKey(key));
  if (key && !looksLikeAiStudioKey(key)) {
    console.warn(
      '[chat][boot] API key format is unusual (Google AI Studio keys usually start with AIza).',
      'Create or verify at https://aistudio.google.com/apikey',
    );
  }
  if (!key) {
    console.error(
      '[chat][boot] Chat AI is DISABLED until GEMINI_API_KEY is set in .env / ENV_FILE secret.',
    );
  }

  console.log('[chat][boot] models=', [primary, ...fallbacks].filter(Boolean).join(' → ') || primary);
  console.log(
    '[chat][boot] logging=',
    `enabled=${process.env.CHAT_LOG_ENABLED !== 'false'}`,
    `console=${process.env.CHAT_LOG_TO_CONSOLE === 'true'}`,
    'errorsAlways=true',
  );
  console.log('[chat][boot] routes= POST /api/v1/chat | POST /api/v1/chat/stream');
}
