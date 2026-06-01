import mongoose from 'mongoose';

const catagorySchema = new mongoose.Schema(
  {
    // English Name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Arabic Name
    arabicName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

catagorySchema.index({ name: 1 });
catagorySchema.index({ arabicName: 1 });
catagorySchema.index({ createdAt: -1 });

const Catagory = mongoose.model('Catagory', catagorySchema);

export default Catagory;