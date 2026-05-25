import mongoose from 'mongoose';
const AppointmentBookingRecord=new mongoose.Schema(  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
    },

    gender: {
      type: String,
      trim: true,
    },

    additionalNotes: {
      type: String,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
    },
    civilID: {
      type: String
    },
    operationalId: {
      type: String
    },
    date:{
      type: String
    },
    time:{
      type: String
    },
    nationality:{
      
      type: String

    },
    passportNumber:{
      type: String
    },
    symptoms: {

      type: [String],

    },
   
  },
  { timestamps: true },
);
