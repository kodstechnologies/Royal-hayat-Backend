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

    email: {
      type: String,
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
    slot_from_time: {
      type: String,
    },
    slot_to_time: {
      type: String,
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
    },
    note: {
      type: String,
      trim: true,
    },
    isViewed: {
      type: Boolean,
      default: false
    },
  
    requestType:{
      type:String,
      enum:[
        // 'doctor unavailability request',
        'first time visitor request',
        'appointment request',
        'registered patient booking fallback',
      ],
    }
  },
  { timestamps: true },
);

appointmentRequestSchema.index({ createdAt: -1 });
appointmentRequestSchema.index({ phone: 1 });
appointmentRequestSchema.index({ status: 1 });
appointmentRequestSchema.index({ isViewed: 1 });
appointmentRequestSchema.index({ requestType: 1 });

const AppointmentRequest = mongoose.model(
  'AppointmentRequest',
  appointmentRequestSchema,
);

export default AppointmentRequest;