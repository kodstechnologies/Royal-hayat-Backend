const PREFIX = '[identity]';

const ts = () => new Date().toISOString();

export const identityLog = (tag, message, data = undefined) => {
  if (data !== undefined) {
    console.log(`${PREFIX}[${tag}] ${ts()} ${message}`, data);
    return;
  }
  console.log(`${PREFIX}[${tag}] ${ts()} ${message}`);
};

export const identityLogJson = (tag, message, obj) => {
  console.log(`${PREFIX}[${tag}] ${ts()} ${message}`);
  try {
    console.log(JSON.stringify(obj, null, 2));
  } catch {
    console.log(obj);
  }
};

export const logIdentityHttp = (routeLabel) => (req, res, next) => {
  identityLog('http', `→ ${routeLabel} ${req.method} ${req.originalUrl}`);
  identityLog('http', `ip=${req.ip} forwarded-for=${req.headers['x-forwarded-for'] || '-'}`);
  identityLogJson('http', 'headers', {
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent'],
    origin: req.headers.origin
  });
  identityLogJson('http', 'body', req.body ?? {});
  next();
};
