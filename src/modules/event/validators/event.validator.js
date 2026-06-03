import Joi from "joi";

const objectIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required();

const createEventSchema = Joi.object({
  hall: Joi.string()
    .valid("aljouri", "gardenia", "in-room-event-services")
    .required(),
  dueDateOfExpectingMother: Joi.date().optional(),
  dueDate: Joi.date().optional(),
  eventType: Joi.string()
    .valid("birth", "workshop", "social", "other")
    .required(),
  otherEventType: Joi.when("eventType", {
    is: "other",
    then: Joi.string().trim().min(1).required(),
    otherwise: Joi.string().allow("").optional(),
  }),
  proposedDate: Joi.date().iso().required(),
  days: Joi.number().integer().min(1).optional(),
  numberOfDays: Joi.number().integer().min(1).optional(),
  name: Joi.string().trim().min(1).required(),
  mobileNumber: Joi.string().trim().min(1).optional(),
  mobile: Joi.string().trim().min(1).optional(),
  email: Joi.string().trim().email().required(),
  mrn: Joi.string().allow("").trim().optional(),
})
  .or("days", "numberOfDays")
  .or("mobileNumber", "mobile")
  .or("dueDateOfExpectingMother", "dueDate");

const getEventListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  isViewed: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid("true", "false"))
    .optional()
    .custom((value) => {
      if (value === "true") return true;
      if (value === "false") return false;
      return value;
    }),
  sortBy: Joi.string()
    .valid("name", "email", "hall", "eventType", "createdAt", "isViewed")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

const eventIdSchema = Joi.object({
  id: objectIdSchema,
});

export { createEventSchema, getEventListSchema, eventIdSchema };
