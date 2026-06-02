import mongoose from "mongoose";

const doctorFeedbackSchema = new mongoose.Schema({

    userName: {
        type: String,
        trim: true
    },

    arabicUserName: {
        type: String,
        trim: true
    },

    feedback: {
        type: String,
        trim: true
    },

    arabicFeedback: {
        type: String,
        trim: true
    },

    stars: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },

    shownOnWebsite: {
        type: Boolean,
        default: true
    },
    addedBy: {
        type: String,
        enum: ["patient", "admin"],
        default: "patient"
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },
    isViewed: {
        type: Boolean,
        default: false
    },
    

}, { timestamps: true });

doctorFeedbackSchema.index({ isViewed: 1 });
doctorFeedbackSchema.index({ isViewed: 1, addedBy: 1 });
doctorFeedbackSchema.index({ doctor: 1 });
doctorFeedbackSchema.index({ createdAt: -1 });

const DoctorFeedback = mongoose.model(
    "DoctorFeedback",
    doctorFeedbackSchema
);

export default DoctorFeedback;