import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },
    employeeID: {
      type: String,
      trim: true,
    },

    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    employeeNameArabic: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },
    arabicDepartment: {
      type: String,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
    arabicTitle: {
      type: String,
      trim: true,
    },

    achievements: {
      type: String,
      required: true,
      trim: true,
    },
    arabicAchievements: {
      type: String,
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

achievementSchema.index({ visibilityStatus: 1, createdAt: -1 });
achievementSchema.index({ employeeId: 1 });
achievementSchema.index({ employeeID: 1 });
achievementSchema.index({ createdAt: -1 });

achievementSchema.index({
  employeeName: "text",
  employeeNameArabic: "text",
  title: "text",
  arabicTitle: "text",
  department: "text",
  arabicDepartment: "text",
  achievements: "text",
  arabicAchievements: "text",
});

const Achievement = mongoose.model(
  "Achievement",
  achievementSchema
);

export default Achievement;