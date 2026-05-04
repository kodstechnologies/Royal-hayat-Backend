import mongoose from 'mongoose';

const customSubspecialitySchema = new mongoose.Schema(
  {
    subHeading: {
      type: String,
      trim: true,
    },
    /** Bullet-style lines shown with the subspeciality */
    explanations: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true },
);

const CustomSubspeciality = mongoose.model('CustomSubspeciality', customSubspecialitySchema);

export default CustomSubspeciality;
