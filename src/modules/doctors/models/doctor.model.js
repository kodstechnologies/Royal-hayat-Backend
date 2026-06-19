import mongoose from 'mongoose';
import './expertise.model.js';
import './qualifications.model.js';
import { filterValidObjectIds } from '../utils/expertise.util.js';

const doctorSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true
  },

  nameAr: {
    type: String,
    required: true,
    trim: true
  },

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  subspecialities: [{
    type: String,
    trim: true
  }],
  subspecialitiesAr: [{
    type: String,
    trim: true
  }],
  title: {
    type: String,
    trim: true
  },
  titleAr: {
    type: String,
    trim: true
  },

  qualifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Qualifications',
  }],
  expertise: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expertise',
  }],
  languages: [{
    type: String,
    trim: true
  }],
  languagesAr: [{
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
  },
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

doctorSchema.index({ name: 1 });
doctorSchema.index({ department: 1 });
doctorSchema.index({ subspecialities: 1 });
doctorSchema.index({ subspecialitiesAr: 1 });
doctorSchema.index({ isActive: 1 });

doctorSchema.index({
  name: 'text',
  nameAr: 'text',
  title: 'text',
  titleAr: 'text',
  subspecialities: 'text',
  subspecialitiesAr: 'text',
});

doctorSchema.pre('save', function saveDoctorRefs(next) {
  if (Array.isArray(this.expertise)) {
    this.expertise = filterValidObjectIds(this.expertise);
  }
  if (Array.isArray(this.qualifications)) {
    this.qualifications = filterValidObjectIds(this.qualifications);
  }
  next();
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
