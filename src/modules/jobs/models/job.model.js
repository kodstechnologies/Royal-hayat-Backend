import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000
  },
  department: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract']
  },
  classification: {
    type: String,
    trim: true,
    maxlength: 100
  },
  responsibilities: [{
    type: String,
    trim: true,
    maxlength: 500
  }],
  requirements: [{
    type: String,
    trim: true,
    maxlength: 500
  }],
  education: {
    type: String,
    trim: true,
    maxlength: 200
  },
  professionalExperience: {
    type: String,
    trim: true,
    maxlength: 200
  },
  specializedKnowledge: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  computerLiteracy: {
    type: Boolean,
    default: false
  },
  languages: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  postedDate: {
    type: Date,
    default: Date.now
  },
  closingDate: {
    type: Date
  },
  urgency: {
    type: String,
    enum: ['immediate', 'urgent', 'normal'],
    default: 'normal'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicationsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
jobSchema.index({ department: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ classification: 1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ postedDate: -1 });
jobSchema.index({ urgency: 1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;
