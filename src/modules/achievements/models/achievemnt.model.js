import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },

    employeeName: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    achievements: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
    },

    visibilityStatus: {
      type: String,
      enum: ["show", "hide"],
      default: "show",
    },
  },
  {
    timestamps: true,
  }
);

const Achievement = mongoose.model(
  "Achievement",
  achievementSchema
);

export default Achievement;