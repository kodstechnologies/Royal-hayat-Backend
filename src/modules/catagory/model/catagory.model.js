import mongoose from 'mongoose';

const catagorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Catagory = mongoose.model('Catagory', catagorySchema);

export default Catagory;
