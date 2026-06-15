import mongoose from "mongoose";

const csrSchema = new mongoose.Schema(
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

    subheading: {
      type: String,
      required: true,
      trim: true,
    },

    subheadingArabic: {
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

    images: {
      type: [String],
      required: true,
      validate: [
        (val) => val.length > 0,
        "At least one image is required",
      ],
    },
  },
  {
    timestamps: true,
  }
);

csrSchema.index({ createdAt: -1 });

export default mongoose.model("CSR", csrSchema);