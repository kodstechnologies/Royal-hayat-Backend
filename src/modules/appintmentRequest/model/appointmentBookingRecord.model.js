import mongoose from 'mongoose';
const appointmentBookingRecordSchema = new mongoose.Schema({
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
  isViewed: {
    type: Boolean,
    default: false
  }
},
  { timestamps: true },
);

appointmentBookingRecordSchema.index({ createdAt: -1 });
appointmentBookingRecordSchema.index({ phone: 1 });
appointmentBookingRecordSchema.index({ date: 1, slot_from_time: 1 });
appointmentBookingRecordSchema.index({ isViewed: 1 });

const AppointmentBookingRecord = mongoose.model(
  'AppointmentBookingRecord',
  appointmentBookingRecordSchema,
);

export default AppointmentBookingRecord;
