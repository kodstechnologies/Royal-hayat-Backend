import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  specialty: {
    type: String,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  subspecialities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subspeciality',
  }],
  title: {
    type: String,
    trim: true
  },
  bio: {
    type: String
  },
  qualifications: [{
    type: String,
    trim: true
  }],
  expertise: [{
    type: String,
    trim: true
  }],
  languages: [{
    type: String,
    trim: true
  }],
  initials: {
    type: String,
    // required: true,
    trim: true,
    uppercase: true
  },
  color: {
    type: String,
    // required: true,
    trim: true
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  availableOnline: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
doctorSchema.index({ doctorId: 1 });
doctorSchema.index({ name: 1 });
doctorSchema.index({ department: 1 });
doctorSchema.index({ subspecialities: 1 });
doctorSchema.index({ specialty: 1 });
doctorSchema.index({ isActive: 1 });

// Text search index
doctorSchema.index({
  name: 'text',
  nameAr: 'text',
  specialty: 'text',
  specialtyAr: 'text',
  department: 'text',
  departmentAr: 'text'
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
