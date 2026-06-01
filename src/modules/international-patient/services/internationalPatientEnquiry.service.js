import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError.js";
import internationalPatientEnquiryRepository from "../repository/internationalPatientEnquiry.repository.js";
import { sendInternationalPatientEnquiryNotificationEmail } from "../../../utils/internationalPatientEnquiryNotificationMail.js";

class InternationalPatientEnquiryService {
  async createEnquiry(data) {
    try {
      const enquiry = await internationalPatientEnquiryRepository.create(data);

      try {
        await sendInternationalPatientEnquiryNotificationEmail(enquiry);
      } catch (mailError) {
        console.error(
          "International patient enquiry notification email failed:",
          mailError?.message || mailError,
        );
      }

      return enquiry;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Error creating international patient enquiry"
      );
    }
  }

  async getAllEnquiries(filters = {}) {
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

    let enquiries = [];
    let total = 0;

    if (search) {
      const searchResult = await internationalPatientEnquiryRepository.search(
        query,
        search,
        { page, limit, sortBy, sortOrder }
      );
      enquiries = searchResult.enquiries;
      total = searchResult.total;
    } else {
      enquiries = await internationalPatientEnquiryRepository.findMany(query, {
        page,
        limit,
        sortBy,
        sortOrder,
      });
      total = await internationalPatientEnquiryRepository.countDocuments(query);
    }

    const unviewedCount =
      await internationalPatientEnquiryRepository.countUnviewed({
        isActive: true,
      });

    return {
      enquiries,
      meta: {
        page,
        limit,
        totalRecords: total,
        totalPages: Math.ceil(total / limit) || 1,
        unviewedCount,
      },
    };
  }

  async getEnquiryById(id) {
    const enquiry =
      await internationalPatientEnquiryRepository.findByIdAndMarkViewed(id);

    if (!enquiry || !enquiry.isActive) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "International patient enquiry not found"
      );
    }

    return enquiry;
  }
}

export default new InternationalPatientEnquiryService();
