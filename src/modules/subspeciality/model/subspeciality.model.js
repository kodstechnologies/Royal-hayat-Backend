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
subspecialitySchema.index({ customSubspecialities: 1 }, { sparse: true });

const Subspeciality = mongoose.model('Subspeciality', subspecialitySchema);

export default Subspeciality;
