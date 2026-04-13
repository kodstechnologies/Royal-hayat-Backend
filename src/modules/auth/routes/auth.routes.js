import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/auth.controller.js';
import validate from '../../../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', getMe);

export default router;
