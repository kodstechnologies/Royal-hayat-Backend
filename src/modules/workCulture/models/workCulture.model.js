import mongoose from "mongoose";

const workCultureSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
      trim: true,
    },

    headingArabic: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    descriptionArabic: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [String],
      required: true,
      validate: [(val) => val.length > 0, "At least one image is required"],
    },
  },
  {
    timestamps: true,
  }
);

workCultureSchema.index({ createdAt: -1 });

workCultureSchema.index({
  heading: "text",
  headingArabic: "text",
  description: "text",
  descriptionArabic: "text",
});

export default mongoose.model("WorkCulture", workCultureSchema);