import mongoose from 'mongoose';

const customSubspecialitySchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      trim: true,
    },

    subHeading: {
      type: String,
      trim: true,
    },

    arabicHeading: {
      type: String,
      trim: true,
    },

    arabicSubHeading: {
      type: String,
      trim: true,
    },

    explanations: [
      {
        type: String,
        trim: true,
      },
    ],

    arabicExplanations: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true },
);

const CustomSubspeciality = mongoose.model(
  'CustomSubspeciality',
  customSubspecialitySchema
);

export default CustomSubspeciality;