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

router.post('/', chatLimiter, postChat);
router.post('/stream', chatLimiter, postChatStream);

export default router;
