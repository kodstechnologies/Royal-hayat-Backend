import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { verifyJWT } from '../../../middlewares/authMiddleware.js';
import checkPermission from '../../../middlewares/checkPermission.js';
import { PERMISSIONS } from '../../../constants/permission.js';
import {
  getChatSession,
  getAllChatLogs,
  getChatLogsBySession,
  getChatLogsByReference,
  getChatLogById,
  postChat,
  postChatLog,
  postChatStream,
} from '../controller/chat.controller.js';

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
  const keyFormat = !key
    ? 'missing'
    : /^AIza[\w-]+$/i.test(key)
      ? 'AIza'
      : /^AQ\.[\w.-]+$/i.test(key)
        ? 'AQ'
        : 'unknown';
  res.json({
    success: true,
    data: {
      configured: Boolean(key),
      keyFormat,
      model: (process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash').trim(),
    },
  });
});

router.get('/session', chatLimiter, getChatSession);

const chatLogAuth = [verifyJWT, checkPermission(PERMISSIONS.CHAT_LOG_VIEW)];

router.get('/logs', ...chatLogAuth, getAllChatLogs);

router.get('/logs/session/:sessionId', ...chatLogAuth, getChatLogsBySession);

router.get('/logs/reference/:referenceId', ...chatLogAuth, getChatLogsByReference);

router.get('/logs/:id', ...chatLogAuth, getChatLogById);

router.post('/', chatLimiter, postChat);
router.post('/log', chatLimiter, postChatLog);
router.post('/stream', chatLimiter, postChatStream);

export default router;