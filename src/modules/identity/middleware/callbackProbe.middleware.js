export const callbackProbe = (req, res, next) => {
  const ts = new Date().toISOString();
  console.log('');
  console.log('============================================================');
  console.log('[identity][callback] POST /api/callback received');
  console.log(`[identity][callback] time=${ts} url=${req.originalUrl}`);
  console.log(`[identity][callback] ip=${req.ip} x-forwarded-for=${req.headers['x-forwarded-for'] || '-'}`);
  console.log(`[identity][callback] content-type=${req.headers['content-type'] || '-'}`);
  console.log(`[identity][callback] user-agent=${req.headers['user-agent'] || '-'}`);
  try {
    console.log('[identity][callback] body (data sent by Sharper):');
    console.log(JSON.stringify(req.body ?? {}, null, 2));
  } catch {
    console.log('[identity][callback] body=(unserializable)');
  }
  console.log('============================================================');
  console.log('');

  if (req.method !== 'POST') {
    console.log(`[identity][callback] REJECTED — expected POST, got ${req.method}`);
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Sharper callback must use POST.',
      data: null
    });
  }

  next();
};
