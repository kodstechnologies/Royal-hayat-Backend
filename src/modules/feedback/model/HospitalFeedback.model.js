import mongoose from "mongoose";

const hospitalFeedbackSchema = new mongoose.Schema({

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
        default: false
    }

}, { timestamps: true });

const HospitalFeedback = mongoose.model(
    "HospitalFeedback",
    hospitalFeedbackSchema
);

export default HospitalFeedback;