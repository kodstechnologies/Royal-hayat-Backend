import mongoose from 'mongoose';

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
    modelsAttempted: [{ type: String, trim: true }],
  },
  { timestamps: true },
);

chatLogSchema.index({ createdAt: -1 });
chatLogSchema.index({ success: 1, createdAt: -1 });
chatLogSchema.index({ lastUserMessage: 'text', assistantReply: 'text' });

const ChatLog = mongoose.model('ChatLog', chatLogSchema);

export default ChatLog;
