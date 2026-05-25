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

const Catagory = mongoose.model('Catagory', catagorySchema);

export default Catagory;