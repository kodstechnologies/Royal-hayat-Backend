import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import ApiError from './utils/ApiError.js';
import routes from './routes/index.js';

dotenv.config();

const app = express();

// -------------------- CORS --------------------
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server tools and non-browser requests without Origin.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const message = `CORS blocked origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`;
    console.error(message);
    return callback(new Error(message));
  },
  credentials: true,
}));

// -------------------- Middleware --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// -------------------- Routes --------------------
app.use('/', routes);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Royal Hayat API is running' });
});

// -------------------- Global Error Handler --------------------
app.use((err, req, res, next) => {
  if (err?.message?.startsWith('CORS blocked origin:')) {
    return res.status(403).json({
      success: false,
      message: err.message,
      data: null
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }
  res.status(500).json({ success: false, message: 'Internal Server Error', data: null });
});

export default app;
