import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      unique: true,
      trim: true,
      match: /^JA-\d{3,}$/,
    },

    // ENGLISH TITLE
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    // ARABIC TITLE
    arabicTitle: {
      type: String,
      required: false,
      trim: true,
      maxlength: 200,
    },

    // ENGLISH DESCRIPTION
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },

    // ARABIC DESCRIPTION
    arabicDescription: {
      type: String,
      required: false,
      trim: true,
      maxlength: 2000,
    },

    // LOCATION ENGLISH
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // LOCATION ARABIC
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

    // ENGLISH RESPONSIBILITIES
    responsibilities: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],

    // ARABIC RESPONSIBILITIES
    arabicResponsibilities: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],

    // ENGLISH REQUIREMENTS
    requirements: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],

    // ARABIC REQUIREMENTS
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

// INDEXES
// Note: jobId unique index is defined on the field itself via `unique: true`

jobSchema.index({ title: 1 });

jobSchema.index({ arabicTitle: 1 });

jobSchema.index({ location: 1 });

jobSchema.index({ arabicLocation: 1 });

jobSchema.index({ type: 1 });

jobSchema.index({ isActive: 1 });

jobSchema.index({ postedDate: -1 });

/**
 * AUTO JOB ID
 */
jobSchema.pre(
  'validate',
  async function (next) {
    if (this.jobId)
      return next();

    const latest =
      await this.constructor.aggregate([
        {
          $match: {
            jobId: {
              $regex: /^JA-\d+$/,
            },
          },
        },

        {
          $project: {
            seq: {
              $toInt: {
                $arrayElemAt: [
                  {
                    $split: [
                      '$jobId',
                      '-',
                    ],
                  },
                  1,
                ],
              },
            },
          },
        },

        {
          $sort: {
            seq: -1,
          },
        },

        {
          $limit: 1,
        },
      ]);

    const nextSeq =
      (latest[0]?.seq || 0) + 1;

    this.jobId = `JA-${String(
      nextSeq
    ).padStart(3, '0')}`;

    next();
  }
);

const Job = mongoose.model(
  'Job',
  jobSchema
);

export default Job;