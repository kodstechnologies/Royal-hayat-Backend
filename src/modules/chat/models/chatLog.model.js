import mongoose from 'mongoose';

/** REF# + last 6 chars of sessionId (hyphens stripped), e.g. REF#A3F91C */
export function buildChatReferenceId(sessionId) {
  const id = String(sessionId ?? '').trim();
  if (!id) return undefined;
  const suffix = id.replace(/-/g, '').slice(-6).toUpperCase();
  if (!suffix) return undefined;
  return `REF#${suffix}`;
}

const chatMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
  },
  { _id: false },
);

const chatLogSchema = new mongoose.Schema(
  {
    lang: { type: String, enum: ['en', 'ar'], required: true },
    messages: { type: [chatMessageSchema], required: true },
    lastUserMessage: { type: String, required: true, trim: true },
    assistantReply: { type: String, default: '', trim: true },
    model: { type: String, trim: true },
    success: { type: Boolean, required: true, default: false },
    errorCode: { type: String, trim: true },
    stream: { type: Boolean, default: true },
    latencyMs: { type: Number },
    clientIp: { type: String, trim: true },
    sessionId: { type: String, trim: true },
    referenceId: { type: String, trim: true },
    source: { type: String, enum: ['ai', 'guided_topic'], trim: true },
    topicId: { type: String, trim: true },
    modelsAttempted: [{ type: String, trim: true }],
    isViewed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

chatLogSchema.index({ createdAt: -1 });
chatLogSchema.index({ success: 1, createdAt: -1 });
chatLogSchema.index({ sessionId: 1, createdAt: 1 });
chatLogSchema.index({ referenceId: 1, createdAt: -1 });
chatLogSchema.index({ source: 1, createdAt: -1 });
chatLogSchema.index({ isViewed: 1, createdAt: -1 });
chatLogSchema.index({ lastUserMessage: 'text', assistantReply: 'text' });

chatLogSchema.pre('save', function assignReferenceId(next) {
  if (this.sessionId) {
    this.referenceId = buildChatReferenceId(this.sessionId);
  }
  next();
});

const ChatLog = mongoose.model('ChatLog', chatLogSchema);

export default ChatLog;
