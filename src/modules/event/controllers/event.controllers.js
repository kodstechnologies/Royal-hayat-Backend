import httpStatus from "http-status";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiError from "../../../utils/ApiError.js";
import eventService from "../service/event.service.js";
import {
  createEventSchema,
  getEventListSchema,
  eventIdSchema,
} from "../validators/event.validator.js";

const createEvent = asyncHandler(async (req, res) => {
  const { error, value } = createEventSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(", "),
    );
  }

  const event = await eventService.createEvent(value);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Event booking created successfully",
    data: event,
  });
});

const getAllEvents = asyncHandler(async (req, res) => {
  const { error, value } = getEventListSchema.validate(req.query, {
    abortEarly: false,
  });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(", "),
    );
  }

  const result = await eventService.getAllEvents(value);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Event bookings fetched successfully",
    data: result.events,
    meta: result.meta,
  });
});

const getEventById = asyncHandler(async (req, res) => {
  const { error, value } = eventIdSchema.validate(req.params, {
    abortEarly: false,
  });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(", "),
    );
  }

  const event = await eventService.getEventById(value.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Event booking fetched successfully",
    data: event,
  });
});

const deleteEvent = asyncHandler(async (req, res) => {
  const { error, value } = eventIdSchema.validate(req.params, {
    abortEarly: false,
  });
  if (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message).join(", "),
    );
  }

  await eventService.deleteEvent(value.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Event booking deleted successfully",
  });
});

export { createEvent, getAllEvents, getEventById, deleteEvent };
