import User from '../models/user.model.js';

const authRepository = {
  findByEmail: (email) => User.findOne({ email }),

  findById: (id) => User.findById(id),

  create: (data) => User.create(data),

  updateRefreshToken: (id, refreshToken) =>
    User.findByIdAndUpdate(id, { refreshToken }, { new: true }),
};

export default authRepository;
