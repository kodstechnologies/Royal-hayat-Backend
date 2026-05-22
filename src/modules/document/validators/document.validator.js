// validators/document.validator.js

import Joi from "joi";

export const createDocumentValidator = Joi.object({
    title: Joi.string().trim().required(),

    catagory: Joi.string()
        .valid("Brochure", "Form", "Guide", "Policy")
        .required(),

    description: Joi.string().trim().required(),

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

    status: Joi.string()
        .valid("active", "inactive")
        .optional()
});