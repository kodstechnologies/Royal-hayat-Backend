import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import authService from '../services/auth.service.js';
import User from '../models/user.model.js';

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

export const resetPassword = asyncHandler(async (req, res) => {
  const payload = await authService.resetPassword(req.user._id, req.body);
  res.json(ApiResponse.success(payload, 'Password updated successfully'));
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);
  res
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(ApiResponse.success(null, 'Logged out successfully'));
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(
    ApiResponse.success(
      {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      'User fetched successfully'
    )
  );
});

export const createSubadmin = async (
  req,
  res
) => {
  try {

    const {
      name,
      email,
      password,
      role,
      permissions,
    } = req.body;

    const allowedRoles = [
      
      // 'doctor',
      // 'nurse',
      // 'receptionist',
      'call_center',
      // 'customer_support',
    ];

    // Role validation
    if (!allowedRoles.includes(role)) {
      console.log("------",role)
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const subadmin = await User.create({
      name,
      email,
      password,
      role,
      permissions,
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: subadmin,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};