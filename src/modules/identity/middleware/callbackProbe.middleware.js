/**
 * Logs every request that reaches the Sharper callback URL (any HTTP method).
 * If you never see [CALLBACK URL HIT] in pm2 logs after PACI approval, Sharper is not calling this URL.
 */
export const callbackProbe = (req, res, next) => {
  const ts = new Date().toISOString();
  console.log('');
  console.log('============================================================');
  console.log('[CALLBACK URL HIT] YES — request reached /api/callback');
  console.log(`[CALLBACK URL HIT] time=${ts} method=${req.method} url=${req.originalUrl}`);
  console.log(`[CALLBACK URL HIT] ip=${req.ip} x-forwarded-for=${req.headers['x-forwarded-for'] || '-'}`);
  console.log(`[CALLBACK URL HIT] content-type=${req.headers['content-type'] || '-'}`);
  console.log(`[CALLBACK URL HIT] user-agent=${req.headers['user-agent'] || '-'}`);
  try {
    console.log(`[CALLBACK URL HIT] body=${JSON.stringify(req.body ?? {})}`);
  } catch {
    console.log('[CALLBACK URL HIT] body=(unserializable)');
  }
  console.log('============================================================');
  console.log('');

  if (req.method !== 'POST') {
    console.log(`[CALLBACK URL HIT] REJECTED — expected POST, got ${req.method}`);
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Sharper callback must use POST.',
      data: null
    });
  }

  next();
};
