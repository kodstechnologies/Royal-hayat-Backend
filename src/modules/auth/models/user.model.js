import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin','sub_admin','call_center'],
      default: 'patient',
    },
    refreshToken: { type: String },
    permissions: [
      {
        type: String,
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// email: unique index is created automatically by `unique: true` on the field

// List managed users: find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 })
userSchema.index({ role: 1, createdAt: -1 });

// Filter by role alone
userSchema.index({ role: 1 });

// Account status checks (checkPermission inactive guard, future admin filters)
userSchema.index({ isActive: 1 });

// Active users by role
userSchema.index({ isActive: 1, role: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, role: this.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d' }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );
};

const User = mongoose.model('User', userSchema);
export default User;
