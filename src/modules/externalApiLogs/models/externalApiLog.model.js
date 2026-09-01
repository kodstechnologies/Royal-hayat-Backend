import mongoose from 'mongoose';

const externalApiLogSchema = new mongoose.Schema(
  {
    service: {
      type: String,
      enum: ['identity', 'royalhayat'],
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      trim: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      default: 'GET',
    },
    civilId: {
      type: String,
      trim: true,
      index: true,
    },
    patientId: {
      type: String,
      trim: true,
      index: true,
    },
    requestData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    responseData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    statusCode: {
      type: Number,
      index: true,
    },
    success: {
      type: Boolean,
      default: true,
      index: true,
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    responseTime: {
      type: Number,
      default: 0,
    },
    clientIp: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
externalApiLogSchema.index({ createdAt: -1 });
externalApiLogSchema.index({ service: 1, createdAt: -1 });
externalApiLogSchema.index({ civilId: 1, createdAt: -1 });
externalApiLogSchema.index({ patientId: 1, createdAt: -1 });
externalApiLogSchema.index({ success: 1, createdAt: -1 });

const ExternalApiLog = mongoose.model('ExternalApiLog', externalApiLogSchema);

export default ExternalApiLog;
