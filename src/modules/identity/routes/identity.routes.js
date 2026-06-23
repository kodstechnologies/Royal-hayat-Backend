import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import {
  startIdentityVerification,
  getIdentityStatus,
  getIdentityData,
  identityCallback
} from '../controllers/identity.controller.js';
import { logIdentityHttp } from '../utils/identity.logger.js';

const router = Router();

const startLimiter = rateLimit({
  windowMs: Number(process.env.IDENTITY_START_RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.IDENTITY_START_RATE_LIMIT_MAX || 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many identity start requests. Please wait and try again.',
    data: null
  }
});

const statusLimiter = rateLimit({
  windowMs: Number(process.env.IDENTITY_STATUS_RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.IDENTITY_STATUS_RATE_LIMIT_MAX || 30),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many status checks. Please slow down and try again.',
    data: null
  }
});

router.post('/start', logIdentityHttp('POST /api/v1/identity/start'), startLimiter, startIdentityVerification);
router.get('/status/:operationId', logIdentityHttp('GET /api/v1/identity/status'), statusLimiter, getIdentityStatus);
router.get('/data/:civilId', logIdentityHttp('GET /api/v1/identity/data'), getIdentityData);
router.post('/callback', logIdentityHttp('POST /api/v1/identity/callback'), identityCallback);

export default router;

