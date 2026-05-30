// models/medicalRecordRequest.model.js

import mongoose from "mongoose";

const medicalRecordRequestSchema = new mongoose.Schema({

    patientFullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    civilId: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    passportOrGovernmentId: {
        type: String,
        required: true
    },

    patientFileNo: {
        type: String,
        required: true,
        trim: true,
    },

    dateOfBirth: {
        type: Date,
        required: true
    },

    specificAuthorization: {
        type: String,
        enum: [
            "Discharge Summary",
            "Discharge Summary with a specific date of service"
        ],
        required: true
    },

    specificDateOfService: {
        type: Date
    },

    recipientName: {
        type: String,
        required: true,
        trim: true
    },

    recipientEmailAddress: {
        type: String,
        required: true,
        trim: true
    },

    recipientContactNumber: {
        type: String,
        required: true,
        trim: true
    },

    purposeOfDisclosure: {
        type: String,
        enum: [
            "Continuing Care",
            "Insurance Filing",
            "Others"
        ],
        required: true
    },

    otherPurpose: {
        type: String,
        trim: true
    },

    requestedBy: {
        type: String,
        enum: [
            "Patient",
            "Legal Representative"
        ],
        required: true
    },

    patientNameConfirmation: {
        type: String,
        trim: true
    },
    isViewed: {
        type: Boolean,
        default: false
    },
    emailIdToShare: {
        type: String,

    }

}, { timestamps: true });


// compound indexes
medicalRecordRequestSchema.index({
    patientFullName: 1,
    civilId: 1
});

medicalRecordRequestSchema.index({
    patientFileNo: 1
});

medicalRecordRequestSchema.index({ isViewed: 1 });


// conditional validations
medicalRecordRequestSchema.pre("validate", function (next) {

    if (
        this.specificAuthorization ===
        "Discharge Summary with a specific date of service"
        &&
        !this.specificDateOfService
    ) {
        return next(
            new Error(
                "specificDateOfService is required"
            )
        );
    }

    if (
        this.purposeOfDisclosure === "Others"
        &&
        !this.otherPurpose
    ) {
        return next(
            new Error(
                "otherPurpose is required"
            )
        );
    }

    if (
        this.requestedBy === "Patient"
        &&
        !this.patientNameConfirmation
    ) {
        return next(
            new Error(
                "patientNameConfirmation is required"
            )
        );
    }

    next();
});

const MedicalRecordRequest = mongoose.model(
    "MedicalRecordRequest",
    medicalRecordRequestSchema
);

export default MedicalRecordRequest;