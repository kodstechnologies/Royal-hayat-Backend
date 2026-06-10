import mongoose from "mongoose";

const SPECIFIC_DOCUMENT_TYPES = ["Lab Results", "Imaging Reports", "Others"];

const medicalRecordRequestSchema = new mongoose.Schema(
  {
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
      index: true,
    },

    patientFileNo: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    validIdentification: {
      type: String,
      enum: ["civilId", "passportORGovtId"],
      required: true,
    },

    civilIdNumber: {
      type: String,
      trim: true,
      index: true,
    },

    civilIdAttachment: {
      type: String,
    },

    passportOrGovernmentIdAttachment: {
      type: String,
    },

    specificAuthorization: {
      type: String,
      enum: ["Discharge Summary", "specific documents"],
      required: true,
    },

    specificAuthorizationDate: {
      type: Date,
    },

    specificFromDate: {
      type: Date,
    },

    specificToDate: {
      type: Date,
    },

    specialRequest: {
      type: String,
      trim: true,
    },

    specificDocumentTypes: {
      type: [String],
      enum: SPECIFIC_DOCUMENT_TYPES,
      default: undefined,
    },

    specificDocumentsOther: {
      type: String,
      trim: true,
    },

    recipientName: {
      type: String,
      required: true,
      trim: true,
    },

    recipientEmailAddress: {
      type: String,
      required: true,
      trim: true,
    },

    recipientContactNumber: {
      type: String,
      required: true,
      trim: true,
    },

    purposeOfDisclosure: {
      type: String,
      enum: ["Continuing Care", "Insurance Filing", "Others"],
      required: true,
    },

    otherPurpose: {
      type: String,
      trim: true,
    },

    requestedBy: {
      type: String,
      enum: ["Patient", "Legal Representative"],
      required: true,
    },

    patientNameConfirmation: {
      type: String,
      trim: true,
    },

    legalRepresentativeFullName: {
      type: String,
      trim: true,
    },

    relationshipWithPatient: {
      type: String,
      trim: true,
    },

    validProof: {
      type: String,
    },

    isViewed: {
      type: Boolean,
      default: false,
    },

    emailIdToShare: {
      type: String,
    },
  },
  { timestamps: true },
);

medicalRecordRequestSchema.index({
  patientFullName: 1,
  civilIdNumber: 1,
});

medicalRecordRequestSchema.index({
  patientFileNo: 1,
});

medicalRecordRequestSchema.index({ isViewed: 1 });

medicalRecordRequestSchema.index({ mrrId: 1 });

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

medicalRecordRequestSchema.pre("validate", function (next) {
  if (this.validIdentification === "civilId") {
    const civilId = String(this.civilIdNumber || "").trim();
    if (!civilId) {
      return next(new Error("civilIdNumber is required"));
    }
    if (!/^[23]\d{11}$/.test(civilId)) {
      return next(
        new Error(
          "civilIdNumber must be 12 digits and start with 2 or 3",
        ),
      );
    }
    if (!this.civilIdAttachment?.trim()) {
      return next(new Error("civilIdAttachment is required"));
    }
  }

  if (this.validIdentification === "passportORGovtId") {
    if (!this.passportOrGovernmentIdAttachment?.trim()) {
      return next(
        new Error("passportOrGovernmentIdAttachment is required"),
      );
    }
  }

  if (
    this.specificAuthorization !== "Discharge Summary" &&
    this.specificAuthorization !== "specific documents"
  ) {
    return next(new Error("specificAuthorization is invalid"));
  }

  if (this.specificAuthorization === "Discharge Summary") {
    this.specificDocumentTypes = undefined;
    this.specificDocumentsOther = undefined;
    this.specificFromDate = undefined;
    this.specificToDate = undefined;

    if (!this.specificAuthorizationDate) {
      return next(new Error("specificAuthorizationDate is required"));
    }
  }

  if (this.specificAuthorization === "specific documents") {
    this.specificAuthorizationDate = undefined;

    if (!this.specificFromDate) {
      return next(new Error("specificFromDate is required"));
    }
    if (!this.specificToDate) {
      return next(new Error("specificToDate is required"));
    }

    if (this.specificFromDate > this.specificToDate) {
      return next(
        new Error("specificToDate must be on or after specificFromDate"),
      );
    }
    const documentTypes = Array.isArray(this.specificDocumentTypes)
      ? this.specificDocumentTypes
      : [];

    if (documentTypes.length === 0) {
      return next(new Error("specificDocumentTypes is required"));
    }

    if (
      documentTypes.includes("Others") &&
      !this.specificDocumentsOther?.trim()
    ) {
      return next(new Error("specificDocumentsOther is required"));
    }
  }

  if (this.purposeOfDisclosure === "Others" && !this.otherPurpose?.trim()) {
    return next(new Error("otherPurpose is required"));
  }

  if (this.requestedBy === "Patient" && !this.patientNameConfirmation?.trim()) {
    return next(new Error("patientNameConfirmation is required"));
  }

  if (this.requestedBy === "Legal Representative") {
    if (!this.legalRepresentativeFullName?.trim()) {
      return next(new Error("legalRepresentativeFullName is required"));
    }
    if (!this.relationshipWithPatient?.trim()) {
      return next(new Error("relationshipWithPatient is required"));
    }
    if (!this.validProof?.trim()) {
      return next(new Error("validProof is required"));
    }
  }

  next();
});

const MedicalRecordRequest = mongoose.model(
  "MedicalRecordRequest",
  medicalRecordRequestSchema,
);

export default MedicalRecordRequest;
