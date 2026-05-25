import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    departmentId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    // ENGLISH NAME
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // ARABIC NAME
    arabicName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // ENGLISH DESCRIPTION
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },

    // ARABIC DESCRIPTION
    arabicDescription: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },

    catagory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Catagory',
      required: true,
    },

    subspecialities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subspeciality',
      },
    ],

    image: {
      type: String,
      trim: true,
    },

    /**
     * Rich multilingual sections
     */
    customExplainantions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CustomExplainantion',
      },
    ],

    // ENGLISH SUBSPECIALTIES
    subSpecialties: [
      {
        type: String,
        trim: true,
        maxlength: 100,
      },
    ],

    // ARABIC SUBSPECIALTIES
    arabicSubSpecialties: [
      {
        type: String,
        trim: true,
        maxlength: 100,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
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

departmentSchema.index({ name: 1 });

departmentSchema.index({ arabicName: 1 });

departmentSchema.index({ departmentId: 1 });

departmentSchema.index({ isActive: 1 });

departmentSchema.index({ order: 1 });

departmentSchema.index({ catagory: 1 });

departmentSchema.index({ subspecialities: 1 });

const Department = mongoose.model(
  'Department',
  departmentSchema
);

export default Department;