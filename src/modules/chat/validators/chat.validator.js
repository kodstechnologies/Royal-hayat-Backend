import Joi from 'joi';

const chatMessageSchema = Joi.object({
  role: Joi.string().valid('user', 'assistant').required(),
  content: Joi.string().trim().min(1).max(2000).required(),
});

export const postChatSchema = Joi.object({
  messages: Joi.array().items(chatMessageSchema).min(1).max(20).required(),
  lang: Joi.string().valid('en', 'ar').default('en'),
  sessionId: Joi.string().trim().max(64).optional().allow(''),
});
