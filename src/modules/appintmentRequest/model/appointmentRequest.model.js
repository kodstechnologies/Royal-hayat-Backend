import mongoose from 'mongoose';

const appointmentRequestSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
    
    },
    phone: {
      type: String,
    
    },
    age: {
      type: Number,
   
    },
    gender: {
      type: String,
     
    },
    additionalNotes: {
      type: String,
    
    },
    dateOfBirth: {
      type: Date,
    },
  },
  { timestamps: true },
);

appointmentRequestSchema.index({ createdAt: -1 });
appointmentRequestSchema.index({ phone: 1 });

const AppointmentRequest = mongoose.model('AppointmentRequest', appointmentRequestSchema);

export default AppointmentRequest;
