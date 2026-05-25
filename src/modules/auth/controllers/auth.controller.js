import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import authService from '../services/auth.service.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
};

export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json(ApiResponse.success(
    { _id: user._id, name: user.name, email: user.email, role: user.role },
    'User registered successfully'
  ));
});

export const login = asyncHandler(async (req, res) => {
  const payload = await authService.login(req.body);
  res.json(ApiResponse.success(payload, 'OTP sent to your email'));
});

export const sendOtp = asyncHandler(async (req, res) => {
  const payload = await authService.sendOtp(req.body);
  res.json(ApiResponse.success(payload, 'OTP sent to your email'));
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.verifyOtp(req.body);
  res
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(ApiResponse.success(
      { _id: user._id, name: user.name, email: user.email, role: user.role, accessToken },
      'Login successful'
    ));
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  res
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .json(ApiResponse.success(null, 'Logged out successfully'));
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(ApiResponse.success(req.user, 'User fetched successfully'));
});
