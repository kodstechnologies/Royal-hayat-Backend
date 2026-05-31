// models/medicalRecordRequest.model.js

import mongoose from "mongoose";

const medicalRecordRequestSchema = new mongoose.Schema({

    mrrId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        index: true,
    },

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

medicalRecordRequestSchema.index({ mrrId: 1 });

/**
 * AUTO MRR ID on create
 * FORMAT => MRR-000001
 */
medicalRecordRequestSchema.pre("validate", async function (next) {
    if (this.mrrId) {
        return next();
    }

    try {
        const latest = await this.constructor
            .findOne({ mrrId: { $regex: /^MRR-/ } })
            .sort({ createdAt: -1 })
            .select("mrrId")
            .lean();

        let nextSequence = 1;

        if (latest?.mrrId) {
            const match = latest.mrrId.match(/^MRR-(\d+)$/);
            if (match) {
                nextSequence = parseInt(match[1], 10) + 1;
            }
        }

        this.mrrId = `MRR-${String(nextSequence).padStart(6, "0")}`;
        next();
    } catch (error) {
        next(error);
    }
});

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