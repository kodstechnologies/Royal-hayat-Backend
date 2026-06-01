import mongoose from 'mongoose';
import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import authService from '../services/auth.service.js';
import User from '../models/user.model.js';

const RESERVED_ROLES = ['admin'];

const normalizeRole = (role) =>
  String(role || '').trim().toLowerCase().replace(/\s+/g, '_');

/** Any custom role from user-management; only `admin` is reserved. */
const assertManagedRole = (role) => {
  const normalized = normalizeRole(role);

  if (!normalized) {
    throw new ApiError(400, 'Role is required');
  }

  if (RESERVED_ROLES.includes(normalized)) {
    throw new ApiError(400, 'Admin role cannot be assigned to managed users');
  }

  if (!/^[a-z][a-z0-9_]{0,49}$/.test(normalized)) {
    throw new ApiError(
      400,
      'Role must start with a letter and contain only letters, numbers, and underscores',
    );
  }

  return normalized;
};

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
  const users = await User.find({ role: { $ne: 'admin' } })
    .select('-password -refreshToken')
    .sort({ createdAt: -1 })
    .lean();

  res.json(ApiResponse.success(users, 'Users fetched successfully'));
});

export const createSubadmin =
  asyncHandler(async (req, res) => {

    const {
      name,
      email,
      password,
      role,
      permissions,
    } = req.body;

    const normalizedRole = assertManagedRole(role);

    const existingUser =
      await User.findOne({
        email: String(email)
          .trim()
          .toLowerCase(),
      });

    if (existingUser) {

      throw new ApiError(
        400,
        'Email already exists'
      );
    }

    const subadmin = await User.create({
      name: String(name).trim(),

      email: String(email)
        .trim()
        .toLowerCase(),

      password,

      role: normalizedRole,

      permissions:
        Array.isArray(permissions)
          ? permissions
          : [],
    });

    const safeUser =
      await User.findById(subadmin._id)
        .select('-password -refreshToken');

    res.status(201).json(
      ApiResponse.success(
        safeUser,
        'User created successfully'
      )
    );
  });

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.role === 'admin') {
    throw new ApiError(403, 'Cannot modify admin user');
  }

  const { name, email, password, role, permissions, isActive } = req.body;

  if (name !== undefined) {
    user.name = String(name).trim();
  }

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const duplicate = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
    });

    if (duplicate) {
      throw new ApiError(400, 'Email already exists');
    }

    user.email = normalizedEmail;
  }

  if (role !== undefined) {
    user.role = assertManagedRole(role);
  }

  if (permissions !== undefined) {
    user.permissions = Array.isArray(permissions) ? permissions : [];
  }

  if (isActive !== undefined) {
    user.isActive = Boolean(isActive);
  }

  if (password !== undefined && String(password).trim()) {
    user.password = password;
  }

  await user.save();

  const safeUser = await User.findById(id).select('-password -refreshToken');

  res.json(ApiResponse.success(safeUser, 'User updated successfully'));
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  if (String(req.user._id) === String(id) && isActive === false) {
    throw new ApiError(400, 'You cannot deactivate your own account');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.role === 'admin') {
    throw new ApiError(403, 'Cannot change status of admin user');
  }

  user.isActive = Boolean(isActive);

  if (!user.isActive) {
    user.refreshToken = null;
  }

  await user.save();

  const safeUser = await User.findById(id).select('-password -refreshToken');
  const statusLabel = user.isActive ? 'active' : 'inactive';

  res.json(
    ApiResponse.success(
      safeUser,
      `User marked as ${statusLabel} successfully`,
    ),
  );
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  if (String(req.user._id) === String(id)) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.role === 'admin') {
    throw new ApiError(403, 'Cannot delete admin user');
  }

  await User.findByIdAndDelete(id);

  res.json(ApiResponse.success(null, 'User deleted successfully'));
});