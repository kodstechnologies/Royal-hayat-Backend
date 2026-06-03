import Joi from "joi";

export const createFolderValidator = Joi.object({
  name: Joi.string().trim().min(1).max(120).required(),
  parent: Joi.string().hex().length(24).allow(null, "").optional(),
});

export const renameFolderValidator = Joi.object({
  name: Joi.string().trim().min(1).max(120).required(),
});

export const updateFileValidator = Joi.object({
  originalName: Joi.string().trim().min(1).max(255).optional(),
  slno: Joi.number().integer().min(1).optional(),
});
