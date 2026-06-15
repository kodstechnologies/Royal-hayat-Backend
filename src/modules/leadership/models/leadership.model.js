import mongoose from "mongoose";

const leadershipSchema = new mongoose.Schema(
  {
    initials: {
      type: String,
      trim: true,
    },

    initialsArabic: {
      type: String,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    nameArabic: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    titleArabic: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: [String],
      required: true,
      validate: [
        (val) => val.length > 0,
        "At least one description is required",
      ],
    },

    descriptionArabic: {
      type: [String],
      required: true,
      validate: [
        (val) => val.length > 0,
        "At least one Arabic description is required",
      ],
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

leadershipSchema.index({ createdAt: -1 });

export default mongoose.model("Leadership", leadershipSchema);