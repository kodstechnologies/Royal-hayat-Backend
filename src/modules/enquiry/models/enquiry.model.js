import mongoose from 'mongoose';
const enquirySchema = new mongoose.Schema(
  {
    enquiryId: {
      type: String,
      unique: true,
      index: true
    },
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

enquirySchema.pre('save', async function (next) {
  if (!this.isNew || this.enquiryId) {
    return next();
  }

  try {
    const lastEnquiry = await this.constructor
      .findOne({ enquiryId: { $regex: /^ENQ\d+$/ } })
      .sort({ createdAt: -1, _id: -1 })
      .select('enquiryId')
      .lean();

    const lastNumber = lastEnquiry?.enquiryId
      ? Number(lastEnquiry.enquiryId.replace('ENQ', '')) || 0
      : 0;

    this.enquiryId = `ENQ${String(lastNumber + 1).padStart(3, '0')}`;
    return next();
  } catch (error) {
    return next(error);
  }
});

enquirySchema.index({ department: 1 });
enquirySchema.index({ email: 1 });
enquirySchema.index({ isActive: 1 });

const Enquiry = mongoose.model('Enquiry', enquirySchema);
export default Enquiry;