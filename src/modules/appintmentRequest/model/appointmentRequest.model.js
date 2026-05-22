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