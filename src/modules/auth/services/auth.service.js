import ApiError from '../../../utils/ApiError.js';
import authRepository from '../repositories/auth.repository.js';

const authService = {
  register: async ({ name, email, password, role }) => {
    const existing = await authRepository.findByEmail(email);
    if (existing) throw new ApiError(409, 'Email already registered');

    const user = await authRepository.create({ name, email, password, role });
    return user;
  },

  login: async ({ email, password }) => {
    const user = await authRepository.findByEmail(email);
    if (!user) throw new ApiError(404, 'User not found');

    const isValid = await user.isPasswordCorrect(password);
    if (!isValid) throw new ApiError(401, 'Invalid credentials');

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    await authRepository.updateRefreshToken(user._id, refreshToken);

    return { user, accessToken, refreshToken };
  },

  logout: async (userId) => {
    await authRepository.updateRefreshToken(userId, null);
  },
};

export default authService;
