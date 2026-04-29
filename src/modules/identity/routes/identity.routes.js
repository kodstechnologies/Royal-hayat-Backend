import { Router } from 'express';
import {
  startIdentityVerification,
  getIdentityStatus,
  identityCallback
} from '../controllers/identity.controller.js';

const router = Router();

router.post('/start', startIdentityVerification);
router.get('/status/:operationId', getIdentityStatus);
router.post('/callback', identityCallback);

export default router;

