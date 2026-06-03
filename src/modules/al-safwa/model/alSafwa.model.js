import mongoose from "mongoose";

const alSafwaSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    familyName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      trim: true,
      enum: ["male", "female"],
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    preferredAppointmentDate: {
      type: Date,
      required: true,
    },
    previousMedicalCheckup: {
      type: String,
      required: true,
      enum: ["less_than_1_year", "more_than_1_year", "never"],
    },
    diabetes: {
      type: String,
      required: true,
      enum: ["yes", "no", "dont_know"],
    },
    highCholesterol: {
      type: String,
      required: true,
      enum: ["yes", "no", "dont_know"],
    },
    bronchialAsthma: {
      type: String,
      required: true,
      enum: ["yes", "no", "dont_know"],
    },
    hypertension: {
      type: String,
      required: true,
      enum: ["yes", "no", "dont_know"],
    },
    heartDisease: {
      type: String,
      required: true,
      enum: ["yes", "no", "dont_know"],
    },
    overweightObesity: {
      type: String,
      required: true,
      enum: ["yes", "no", "dont_know"],
    },
    smoker: {
      type: String,
      required: true,
      enum: ["yes", "no"],
    },
    alcohol: {
      type: String,
      required: true,
      enum: ["yes", "no"],
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
alSafwaSchema.index({ firstName: 1 });
alSafwaSchema.index({ familyName: 1 });
alSafwaSchema.index({ mobile: 1 });

const AlSafwa = mongoose.model("AlSafwa", alSafwaSchema);

export default AlSafwa;
