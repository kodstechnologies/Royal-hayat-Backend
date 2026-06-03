import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
  hall: {
    type: String,
    required: true,
    trim: true,
    enum: ["aljouri", "gardenia", "in-room-event-services"],
  },
  dueDateOfExpectingMother: {
    type: Date,
    required: true,
  },
  eventType: {
    type: String,
    required: true,
    trim: true,
    enum: ["birth", "workshop", "social", "other"],
  },
  otherEventType: {
    type: String,
    trim: true,
    default: "",
  },
  proposedDate: {
    type: Date,
    required: true,
  },
  days: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  mrn: {
    type: String,
    trim: true,
  },
  isViewed: {
    type: Boolean,
    default: false,
  },
  },
  { timestamps: true },
);

eventSchema.index({ isViewed: 1 });
eventSchema.index({ createdAt: -1 });

eventSchema.pre("validate", function (next) {
  if (this.eventType === "other" && !this.otherEventType?.trim()) {
    return next(new Error("otherEventType is required when eventType is other"));
  }
  if (this.eventType !== "other") {
    this.otherEventType = "";
  }
  next();
});

export const Event = mongoose.model("Event", eventSchema);
