import mongoose from 'mongoose';
const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    phone: {
      type: Number,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

enquirySchema.index({ department: 1 });
enquirySchema.index({ email: 1 });
enquirySchema.index({ isActive: 1 });

const Enquiry = mongoose.model('Enquiry', enquirySchema);
export default Enquiry;