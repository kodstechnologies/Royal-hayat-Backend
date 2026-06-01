import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../modules/auth/models/user.model.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers['authorization']?.replace('Bearer ', '');

  if (!token) throw new ApiError(401, 'Unauthorized: No token provided');

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findById(decoded._id)
    .select('name email role permissions isActive')
    .lean();

  if (!user) throw new ApiError(401, 'Invalid token: User not found');

  req.user = user;
  next();
});
