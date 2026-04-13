import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import ApiError from './utils/ApiError.js';
import routes from './routes/index.js';

dotenv.config();

const app = express();

// -------------------- CORS --------------------
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }
  res.status(500).json({ success: false, message: 'Internal Server Error', data: null });
});

export default app;
