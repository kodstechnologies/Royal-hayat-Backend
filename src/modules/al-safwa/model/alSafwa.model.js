import mongoose from "mongoose";

const alSafwaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isViewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

alSafwaSchema.index({ isViewed: 1 });
alSafwaSchema.index({ isActive: 1 });
alSafwaSchema.index({ email: 1 });

const AlSafwa = mongoose.model("AlSafwa", alSafwaSchema);

export default AlSafwa;
