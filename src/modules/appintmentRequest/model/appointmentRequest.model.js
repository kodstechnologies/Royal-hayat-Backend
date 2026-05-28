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

    dob: {
      type: Date,
    },
    patient_id: {
      type: String,
    },
    urn: {
      type: String,
    },
    national_id: {
      type: String,
    },
    mobile_number: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    englishName: {
      type: String,
      trim: true,
    },
    arabicName: {
      type: String,
      trim: true,
    },
    operationId: {
      type: String
    },
    paciRequestId: {
      type: String,
    },
    date: {
      type: String
    },
    time: {
      type: String
    },
    nationality: {

      type: String

    },
    passportNumber: {
      type: String
    },
    symptoms: {

      type: [String],

    },
    doctor: {
      type: String,

    },
    department: {
      type: String,
    },
    status: {
      type: String,
      enum: ['received', 'accepted', 'cancelled'],
      // default: 'received',
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