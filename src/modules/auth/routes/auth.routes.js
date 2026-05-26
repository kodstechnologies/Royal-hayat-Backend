import { Router } from 'express';
import { register, login, sendOtp, verifyOtp, logout, getMe, resetPassword } from '../controllers/auth.controller.js';
import validate from '../../../middlewares/validate.js';
import { registerSchema, loginSchema, sendOtpSchema, verifyOtpSchema, resetPasswordSchema } from '../validations/auth.validation.js';
import { verifyJWT } from '../../../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/send-otp', validate(sendOtpSchema), sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/reset-password', verifyJWT, validate(resetPasswordSchema), resetPassword);
router.post('/logout', verifyJWT, logout);
router.get('/me', verifyJWT, getMe);

export default router;
