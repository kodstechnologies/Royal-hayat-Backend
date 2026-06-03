import mongoose from 'mongoose';

const subspecialitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    arabicName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    arabicDescription: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },

    customSubspecialities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CustomSubspeciality',
      },
    ],
  },
  { timestamps: true },
);

subspecialitySchema.index({ name: 1 });
subspecialitySchema.index({ arabicName: 1 });

subspecialitySchema.index({ department: 1 });

subspecialitySchema.index(
  { customSubspecialities: 1 },
  { sparse: true }
);

const Subspeciality = mongoose.model(
  'Subspeciality',
  subspecialitySchema
);

export default Subspeciality;