import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      unique: true,
      trim: true,

      match: /^\d{6}-\d{6}$/,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    arabicTitle: {
      type: String,
      required: false,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },

    arabicDescription: {
      type: String,
      required: false,
      trim: true,
      maxlength: 2000,
    },

    classification: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    arabicLocation: {
      type: String,
      required: false,
      trim: true,
      maxlength: 100,
    },

    type: {
      type: String,
      required: true,
      enum: [
        'Full-time',
        'Part-time',
        'Contract',
      ],
    },

    responsibilities: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],

    arabicResponsibilities: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],

    requirements: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],

    arabicRequirements: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],

    postedDate: {
      type: Date,
      default: Date.now,
    },

    closingDate: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    applicationsCount: {
      type: Number,
      default: 0,
    },
    isViewed: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  }
);

jobSchema.index({ title: 1 });

jobSchema.index({ arabicTitle: 1 });

jobSchema.index({ title: 'text', jobId: 'text', arabicTitle: 'text' });

jobSchema.index({ classification: 1 });

jobSchema.index({ location: 1 });

jobSchema.index({ arabicLocation: 1 });

jobSchema.index({ type: 1 });

jobSchema.index({ isActive: 1 });

jobSchema.index({ postedDate: -1 });

jobSchema.pre(
  'validate',
  async function (next) {
    if (this.jobId) {
      return next();
    }

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, '0');

    const prefix = `${year}${month}`;

    const latest =
      await this.constructor.findOne({
        jobId: {
          $regex: `^${prefix}-`,
        },
      })
        .sort({ createdAt: -1 })
        .lean();

    let nextSequence = 1;

    if (latest?.jobId) {
      const lastSequence =
        parseInt(
          latest.jobId.split('-')[1]
        );

      nextSequence = lastSequence + 1;
    }

    const sequence = String(
      nextSequence
    ).padStart(6, '0');

    this.jobId = `${prefix}-${sequence}`;

    next();
  }
);

const Job = mongoose.model(
  'Job',
  jobSchema
);

export default Job;