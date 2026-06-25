import User from '../models/user.model.js';
import Otp from '../models/otp.model.js';

const authRepository = {
  findByEmail: (email) =>
    User.findOne({ email: String(email || '').trim().toLowerCase() }),

  findById: (id) => User.findById(id),

  findSafeById: (id) =>
    User.findById(id).select('-password -refreshToken'),

  buildManagedUsersFilter: (search = '') => {
    const filter = { role: { $ne: 'admin' } };
    const term = String(search || '').trim();

    if (term) {
      const pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: pattern },
        { email: pattern },
        { role: pattern },
      ];
    }

    return filter;
  },

  findManagedUsersPaginated: ({ page, limit, search }) => {
    const filter = authRepository.buildManagedUsersFilter(search);
    const skip = (page - 1) * limit;

    return Promise.all([
      User.find(filter)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);
  },

  findByEmailExcludingId: (email, excludeId) =>
    User.findOne({
      email,
      _id: { $ne: excludeId },
    }),

  saveUser: (user) => user.save(),

  deleteById: (id) => User.findByIdAndDelete(id),

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
