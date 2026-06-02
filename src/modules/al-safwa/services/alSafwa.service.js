import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError.js";
import alSafwaRepository from "../repository/alSafwa.repository.js";
import { sendAlSafwaEnrollmentNotificationEmail } from "../../../utils/alSafwaEnrollmentNotificationMail.js";

class AlSafwaService {
  async createEnrollment(data) {
    try {
      const enrollment = await alSafwaRepository.create(data);

      try {
        await sendAlSafwaEnrollmentNotificationEmail(enrollment);
      } catch (mailError) {
        console.error(
          "Al Safwa enrollment notification email failed:",
          mailError?.message || mailError,
        );
      }

      return enrollment;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Error creating Al Safwa enrollment"
      );
    }
  }

  async getAllEnrollments(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      isViewed,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const query = { isActive: true };

    if (typeof isViewed === "boolean") {
      query.isViewed = isViewed;
    }

    let enrollments = [];
    let total = 0;

    if (search) {
      const searchResult = await alSafwaRepository.search(query, search, {
        page,
        limit,
        sortBy,
        sortOrder,
      });
      enrollments = searchResult.enrollments;
      total = searchResult.total;
    } else {
      enrollments = await alSafwaRepository.findMany(query, {
        page,
        limit,
        sortBy,
        sortOrder,
      });
      total = await alSafwaRepository.countDocuments(query);
    }

    const unviewedCount = await alSafwaRepository.countUnviewed({
      isActive: true,
    });

    return {
      enrollments,
      meta: {
        page,
        limit,
        totalRecords: total,
        totalPages: Math.ceil(total / limit) || 1,
        unviewedCount,
      },
    };
  }

  async getEnrollmentById(id) {
    const enrollment = await alSafwaRepository.findByIdAndMarkViewed(id);

    if (!enrollment || !enrollment.isActive) {
      throw new ApiError(httpStatus.NOT_FOUND, "Al Safwa enrollment not found");
    }

    return enrollment;
  }
}

export default new AlSafwaService();
