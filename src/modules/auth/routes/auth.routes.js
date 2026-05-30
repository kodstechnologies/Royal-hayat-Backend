import { Router } from 'express';
import {
  register,
  login,
  sendOtp,
  verifyOtp,
  logout,
  getMe,
  resetPassword,
  createSubadmin,
  getAllUsers,
  updateUser,
  updateUserStatus,
  deleteUser,
} from '../controllers/auth.controller.js';
import { PERMISSIONS } from '../../../constants/permission.js';
import validate from '../../../middlewares/validate.js';
import {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from '../validations/auth.validation.js';
import { verifyJWT } from '../../../middlewares/authMiddleware.js';
import checkPermission from '../../../middlewares/checkPermission.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/send-otp', validate(sendOtpSchema), sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/reset-password', verifyJWT, validate(resetPasswordSchema), resetPassword);
router.post('/logout', verifyJWT, logout);
router.get('/me', verifyJWT, getMe);
router.get(
  '/users',
  verifyJWT,
  checkPermission([PERMISSIONS.USER_VIEW_ALL, PERMISSIONS.USER_VIEW]),
  getAllUsers,
);
router.post(
  '/subadmin',
  verifyJWT,
  checkPermission([PERMISSIONS.USER_CREATE]),
  createSubadmin,
);

router.patch(
  '/users/:id/status',
  verifyJWT,
  checkPermission([PERMISSIONS.USER_UPDATE]),
  validate(updateUserStatusSchema),
  updateUserStatus,
);

router.put(
  '/users/:id',
  verifyJWT,
  checkPermission([PERMISSIONS.USER_UPDATE]),
  validate(updateUserSchema),
  updateUser,
);

router.delete(
  '/users/:id',
  verifyJWT,
  checkPermission([PERMISSIONS.USER_DELETE]),
  deleteUser,
);



export default router;
