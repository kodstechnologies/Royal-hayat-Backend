import mongoose from 'mongoose';
import ApiError from '../../../utils/ApiError.js';
import authRepository from '../repositories/auth.repository.js';

const RESERVED_ROLES = ['admin'];

const normalizeRole = (role) =>
  String(role || '').trim().toLowerCase().replace(/\s+/g, '_');

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

const assertValidObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user ID');
  }
};

const assertNotAdminUser = (user, message) => {
  if (user.role === 'admin') {
    throw new ApiError(403, message);
  }
};

const normalizeEmail = (email) => String(email).trim().toLowerCase();

const userService = {
  getAllUsers: async ({ page = 1, limit = 10, search = '' } = {}) => {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
    const safeSearch = String(search || '').trim();

    const [users, totalRecords] = await authRepository.findManagedUsersPaginated({
      page: safePage,
      limit: safeLimit,
      search: safeSearch,
    });

    return {
      users,
      meta: {
        page: safePage,
        limit: safeLimit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / safeLimit) || 0,
      },
    };
  },

  getUserById: async (id) => {
    assertValidObjectId(id);

    const user = await authRepository.findSafeById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    assertNotAdminUser(user, 'Cannot access admin user');

    return user;
  },

  createSubadmin: async ({ name, email, password, role, permissions }) => {
    const normalizedRole = assertManagedRole(role);
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = String(password || '').trim();

    if (normalizedPassword.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters');
    }

    const existingUser = await authRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ApiError(400, 'Email already exists');
    }

    const subadmin = await authRepository.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: normalizedPassword,
      role: normalizedRole,
      permissions: Array.isArray(permissions) ? permissions : [],
      isActive: true,
    });

    return authRepository.findSafeById(subadmin._id);
  },

  updateUser: async (id, body) => {
    assertValidObjectId(id);

    const user = await authRepository.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    assertNotAdminUser(user, 'Cannot modify admin user');

    const { name, email, password, role, permissions, isActive } = body;

    if (name !== undefined) {
      user.name = String(name).trim();
    }

    if (email !== undefined) {
      const normalizedEmail = normalizeEmail(email);
      const duplicate = await authRepository.findByEmailExcludingId(normalizedEmail, id);

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

    await authRepository.saveUser(user);

    return authRepository.findSafeById(id);
  },

  updateUserStatus: async (id, isActive, requesterId) => {
    assertValidObjectId(id);

    if (String(requesterId) === String(id) && isActive === false) {
      throw new ApiError(400, 'You cannot deactivate your own account');
    }

    const user = await authRepository.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    assertNotAdminUser(user, 'Cannot change status of admin user');

    user.isActive = Boolean(isActive);

    if (!user.isActive) {
      user.refreshToken = null;
    }

    await authRepository.saveUser(user);

    const safeUser = await authRepository.findSafeById(id);
    const statusLabel = user.isActive ? 'active' : 'inactive';

    return {
      user: safeUser,
      message: `User marked as ${statusLabel} successfully`,
    };
  },

  deleteUser: async (id, requesterId) => {
    assertValidObjectId(id);

    if (String(requesterId) === String(id)) {
      throw new ApiError(400, 'You cannot delete your own account');
    }

    const user = await authRepository.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    assertNotAdminUser(user, 'Cannot delete admin user');

    await authRepository.deleteById(id);
  },
};

export default userService;
