import { Router } from 'express';
import { register, login, sendOtp, verifyOtp, logout, getMe } from '../controllers/auth.controller.js';
import validate from '../../../middlewares/validate.js';
import { registerSchema, loginSchema, sendOtpSchema, verifyOtpSchema } from '../validations/auth.validation.js';
import { protect } from '../../../middlewares/protect.js';
const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/send-otp', validate(sendOtpSchema), sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);

router.post('/logout',protect, logout);
router.get('/me', getMe);

export default router;
