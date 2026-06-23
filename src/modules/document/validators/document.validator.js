
import Joi from "joi";

const publicPathSchema = Joi.string().trim().optional().messages({
    "string.empty": "Public path cannot be empty",
});

export const createDocumentValidator = Joi.object({
    title: Joi.string().trim().required(),

    catagory: Joi.string()
        .valid("Brochure", "Form", "Guide", "Policy")
        .required(),

    description: Joi.string().trim().required(),

    publicPath: publicPathSchema,

    status: Joi.string()
        .valid("active", "inactive")
        .optional()
});

export const updateDocumentValidator = Joi.object({
    title: Joi.string().trim().optional(),

    catagory: Joi.string()
        .valid("Brochure", "Form", "Guide", "Policy")
        .optional(),

    description: Joi.string().trim().optional(),

    publicPath: publicPathSchema,

    status: Joi.string()
        .valid("active", "inactive")
        .optional()
});