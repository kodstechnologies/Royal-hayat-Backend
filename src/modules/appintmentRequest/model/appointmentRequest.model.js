import mongoose from 'mongoose';

const appointmentRequestSchema = new mongoose.Schema(
  {
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
    status: {
      type: String,
      enum: ['received', 'accepted', 'cancelled'],
      default: 'received',
    },
  },
  { timestamps: true },
);

appointmentRequestSchema.index({ createdAt: -1 });
appointmentRequestSchema.index({ phone: 1 });
appointmentRequestSchema.index({ status: 1 });

const AppointmentRequest = mongoose.model(
  'AppointmentRequest',
  appointmentRequestSchema,
);

export default AppointmentRequest;