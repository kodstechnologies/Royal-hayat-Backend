import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError.js";
import eventRepository from "../repository/event.repository.js";

const GENERIC_ERROR_MESSAGE = "Something went wrong";

const normalizeHall = (hall) => {
  if (hall === "in-room-event-services") return "in-room-event";
  return hall;
};

const normalizeCreatePayload = (body) => ({
  hall: normalizeHall(body.hall),
  dueDateOfExpectingMother:
    body.dueDateOfExpectingMother ?? body.dueDate,
  eventType: body.eventType,
  otherEventType: body.otherEventType ?? "",
  proposedDate: body.proposedDate,
  days: body.days ?? body.numberOfDays,
  name: body.name?.trim(),
  mobileNumber: (body.mobileNumber ?? body.mobile)?.trim(),
  email: body.email?.trim(),
  mrn: body.mrn?.trim() || undefined,
});

const handleServiceError = (error, context) => {
  if (error instanceof ApiError) {
    throw error;
  }
  if (error?.name === "ValidationError") {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
  console.error(`Event service error (${context}):`, error);
  throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, GENERIC_ERROR_MESSAGE);
};

class EventService {
  async createEvent(data) {
    try {
      const payload = normalizeCreatePayload(data);
      return await eventRepository.create(payload);
    } catch (error) {
      handleServiceError(error, "createEvent");
    }
  }

  async getAllEvents(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        isViewed,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = filters;

      const query = {};

      if (typeof isViewed === "boolean") {
        query.isViewed = isViewed;
      }

      const [events, total] = await Promise.all([
        eventRepository.findMany(query, {
          page,
          limit,
          sortBy,
          sortOrder,
        }),
        eventRepository.countDocuments(query),
      ]);

      const unviewedCount = await eventRepository.countUnviewed();

      return {
        events,
        meta: {
          page,
          limit,
          totalRecords: total,
          totalPages: Math.ceil(total / limit) || 1,
          unviewedCount,
        },
      };
    } catch (error) {
      handleServiceError(error, "getAllEvents");
    }
  }

  async getEventById(id) {
    try {
      const event = await eventRepository.findByIdAndMarkViewed(id);

      if (!event) {
        throw new ApiError(httpStatus.NOT_FOUND, "Event booking not found");
      }

      return event;
    } catch (error) {
      handleServiceError(error, "getEventById");
    }
  }

  async deleteEvent(id) {
    try {
      const deleted = await eventRepository.deleteById(id);

      if (!deleted) {
        throw new ApiError(httpStatus.NOT_FOUND, "Event booking not found");
      }

      return deleted;
    } catch (error) {
      handleServiceError(error, "deleteEvent");
    }
  }
}

export default new EventService();
