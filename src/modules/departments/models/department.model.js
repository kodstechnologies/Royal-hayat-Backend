import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    departmentId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    arabicName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },

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

    image: {
      type: String,
      trim: true,
    },

    customExplainantions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CustomExplainantion',
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

departmentSchema.index({ name: 1 });

departmentSchema.index({ arabicName: 1 });

departmentSchema.index({ departmentId: 1 });

departmentSchema.index({ isActive: 1 });

departmentSchema.index({ order: 1 });

departmentSchema.index({ catagory: 1 });

const Department = mongoose.model(
  'Department',
  departmentSchema
);

export default Department;