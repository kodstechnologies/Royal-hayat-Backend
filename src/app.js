import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import ApiError from './utils/ApiError.js';
import routes from './routes/index.js';

dotenv.config();

const app = express();

const trustProxy = process.env.TRUST_PROXY;
if (trustProxy === 'false' || trustProxy === '0') {
  app.set('trust proxy', false);
} else if (trustProxy) {
  const hops = Number(trustProxy);
  app.set('trust proxy', Number.isFinite(hops) ? hops : trustProxy);
} else {
  app.set('trust proxy', 1);
}

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  const path = req.path || req.url || '';
  const isIdentityTraffic =
    path === '/api/callback' || path.startsWith('/api/v1/identity');
  if (!isIdentityTraffic) return next();

  const ts = new Date().toISOString();
  console.log(`[identity][http] ${ts} ${req.method} ${req.originalUrl} ip=${req.ip}`);
  console.log(
    `[identity][http] ${ts} content-type=${req.headers['content-type'] || '-'} ua=${req.headers['user-agent'] || '-'}`
  );
  try {
    console.log(`[identity][http] ${ts} body=${JSON.stringify(req.body ?? {})}`);
  } catch {
    console.log(`[identity][http] ${ts} body=(unserializable)`);
  }
  next();
});

app.use('/', routes);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Royal Hayat API is running' });
});

app.use((err, req, res, next) => {
  if (err instanceof ApiError || err?.statusCode) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Something went wrong',
      data: null,
      meta: err.meta || null,
    });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', data: null });
});

export default app;
