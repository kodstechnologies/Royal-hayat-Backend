import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  image: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true
  },
  subSpecialties: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
departmentSchema.index({ name: 1 });
departmentSchema.index({ slug: 1 });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ order: 1 });

// Pre-save middleware to generate slug from name
departmentSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

const Department = mongoose.model('Department', departmentSchema);

export default Department;
