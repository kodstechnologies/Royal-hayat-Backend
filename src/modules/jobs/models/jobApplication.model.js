import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    unique: true,
    trim: true,
    match: /^JA-\d{3,}$/
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  resume: {
    type: String,
    required: true,
    trim: true
  },
  // tellusUrself: {
  //   type: String,
  //   trim: true,

  // },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
// Note: applicationId unique index is defined on the field itself via `unique: true`
jobApplicationSchema.index({ jobId: 1 });
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ appliedDate: -1 });
jobApplicationSchema.index({ email: 1 });

// Auto-generate applicationId (e.g. JA-001) before saving
jobApplicationSchema.pre('validate', async function (next) {
  if (this.applicationId) return next();

  const latest = await this.constructor.aggregate([
    { $match: { applicationId: { $regex: /^JA-\d+$/ } } },
    {
      $project: {
        seq: {
          $toInt: { $arrayElemAt: [{ $split: ['$applicationId', '-'] }, 1] }
        }
      }
    },
    { $sort: { seq: -1 } },
    { $limit: 1 }
  ]);

  const nextSeq = (latest[0]?.seq || 0) + 1;
  this.applicationId = `JA-${String(nextSeq).padStart(3, '0')}`;
  next();
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

export default JobApplication;
