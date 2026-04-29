import User from '../models/user.model.js';
import Otp from '../models/otp.model.js';

const authRepository = {
  findByEmail: (email) => User.findOne({ email }),

  findById: (id) => User.findById(id),

  create: (data) => User.create(data),

  updateRefreshToken: (id, refreshToken) =>
    User.findByIdAndUpdate(id, { refreshToken }, { new: true }),

  upsertLoginOtp: (userId, email, otp, expiresAt) =>
    Otp.findOneAndUpdate(
      { userId, email },
      { otp, expiresAt },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ),

  findLoginOtpByUser: (userId, email) => Otp.findOne({ userId, email }),

  clearLoginOtpByUser: (userId, email) => Otp.deleteOne({ userId, email }),
};

export default authRepository;
