import mongoose from "mongoose";

const fileItemSchema = new mongoose.Schema(
  {
    slno: {
      type: Number,
      required: true,
      min: 1,
    },
    s3Key: {
      type: String,
      required: true,
    },
    s3Url: {
      type: String,
      default: "",
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const fileManagerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FileManager",
      default: null,
    },
    files: {
      type: [fileItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

fileManagerSchema.index({ name: 1, parent: 1 });
fileManagerSchema.index({ parent: 1 });

const FileManager = mongoose.model("FileManager", fileManagerSchema);

export default FileManager;
