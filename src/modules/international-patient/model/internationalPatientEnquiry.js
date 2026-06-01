import mongoose from "mongoose";

const internationalPatientEnquirySchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
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
    country: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    comments: {
      type: String,
      trim: true,
      default: "",
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

internationalPatientEnquirySchema.index({ isViewed: 1 });
internationalPatientEnquirySchema.index({ isActive: 1 });
internationalPatientEnquirySchema.index({ email: 1 });

const InternationalPatientEnquiry = mongoose.model(
  "InternationalPatientEnquiry",
  internationalPatientEnquirySchema
);

export default InternationalPatientEnquiry;
