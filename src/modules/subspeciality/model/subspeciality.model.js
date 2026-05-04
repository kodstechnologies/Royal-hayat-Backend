import mongoose from 'mongoose';

const subspecialitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

subspecialitySchema.index({ name: 1 });

const Subspeciality = mongoose.model('Subspeciality', subspecialitySchema);

export default Subspeciality;
