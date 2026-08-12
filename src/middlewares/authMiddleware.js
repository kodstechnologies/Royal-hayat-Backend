import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../modules/auth/models/user.model.js';

function authFailureLog(req, reason, code) {
  const via = req.cookies?.accessToken ? 'cookie' : 'authorization-header';
  console.warn(
    `[auth] ${reason} ${req.method} ${req.originalUrl} ip=${req.ip} via=${via} code=${code}`,
  );
}

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    authFailureLog(req, 'missing-token', 'NO_TOKEN');
    throw new ApiError(401, 'Unauthorized: No token provided', { code: 'NO_TOKEN' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    if (err?.name === 'TokenExpiredError') {
      authFailureLog(req, 'token-expired', 'TOKEN_EXPIRED');
      throw new ApiError(401, 'Access token expired', { code: 'TOKEN_EXPIRED' });
    }
    if (err?.name === 'JsonWebTokenError') {
      authFailureLog(req, 'invalid-token', 'INVALID_TOKEN');
      throw new ApiError(401, 'Invalid access token', { code: 'INVALID_TOKEN' });
    }
    authFailureLog(req, 'jwt-verify-failed', err?.name || 'UNKNOWN');
    throw err;
  }

  const user = await User.findById(decoded._id)
    .select('name email role permissions isActive')
    .lean();

  if (!user) throw new ApiError(401, 'Invalid token: User not found');

  req.user = user;
  next();
});

export const optionalVerifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id)
      .select('name email role permissions isActive')
      .lean();

    if (user) {
      req.user = user;
    }
  } catch {
    // Public routes may be called with an expired/invalid token; ignore and continue.
  }

  next();
});
