import mongoose from 'mongoose';

const customSubspecialitySchema = new mongoose.Schema(
  {
    // English Heading
    subHeading: {
      type: String,
      trim: true,
    },

    // Arabic Heading
    arabicSubHeading: {
      type: String,
      trim: true,
    },

    // English Explanations
    explanations: [
      {
        type: String,
        trim: true,
      },
    ],

    // Arabic Explanations
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