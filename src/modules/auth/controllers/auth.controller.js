import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import authService from '../services/auth.service.js';
import userService from '../services/user.service.js';
import { getUsersQuerySchema } from '../validations/auth.validation.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  /** Limit cookie to admin app path when set (e.g. /admin). Default / = whole host. */
  path: process.env.AUTH_COOKIE_PATH || '/',
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
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken,
        permissions: user.permissions || [],
        isActive: user.isActive !== false,
      },
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

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incoming =
    req.cookies?.refreshToken ||
    req.body?.refreshToken ||
    req.headers['x-refresh-token'];

  const { user, accessToken, refreshToken } = await authService.refreshAccessToken(incoming);

  res
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      ApiResponse.success(
        {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          accessToken,
          permissions: user.permissions || [],
          isActive: user.isActive !== false,
        },
        'Token refreshed successfully',
      ),
    );
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(
    ApiResponse.success(
      {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        permissions: req.user.permissions || [],
        isActive: req.user.isActive !== false,
      },
      'User fetched successfully'
    )
  );
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const { error, value } = getUsersQuerySchema.validate(req.query, {
    abortEarly: false,
  });

  if (error) {
    throw new ApiError(400, error.details.map((detail) => detail.message).join(', '));
  }

  const { users, meta } = await userService.getAllUsers(value);

  res.json(ApiResponse.success(users, 'Users fetched successfully', meta));
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  res.json(ApiResponse.success(user, 'User fetched successfully'));
});

export const createSubadmin = asyncHandler(async (req, res) => {
  const safeUser = await userService.createSubadmin(req.body);

  res.status(201).json(
    ApiResponse.success(safeUser, 'User created successfully'),
  );
});

export const updateUser = asyncHandler(async (req, res) => {
  const safeUser = await userService.updateUser(req.params.id, req.body);

  res.json(ApiResponse.success(safeUser, 'User updated successfully'));
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { user, message } = await userService.updateUserStatus(
    req.params.id,
    req.body.isActive,
    req.user._id,
  );

  res.json(ApiResponse.success(user, message));
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user._id);

  res.json(ApiResponse.success(null, 'User deleted successfully'));
});
