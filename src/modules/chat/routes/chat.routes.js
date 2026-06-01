import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { postChat, postChatStream } from '../controller/chat.controller.js';

const router = Router();

const chatLimiter = rateLimit({
  windowMs: Number(process.env.CHAT_RATE_LIMIT_WINDOW_MS || 900_000),
  max: Number(process.env.CHAT_RATE_LIMIT_MAX || 30),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many chat messages. Please wait a few minutes and try again.',
    data: null,
  },
});

router.get('/health', (req, res) => {
  const key = process.env.GEMINI_API_KEY?.trim();
  res.json({
    success: true,
    data: {
      configured: Boolean(key),
      keyLooksLikeAiStudio: /^AIza[\w-]+$/i.test(key || ''),
      model: (process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash').trim(),
    },
  });
});

router.post('/', chatLimiter, postChat);
router.post('/stream', chatLimiter, postChatStream);

export default router;
