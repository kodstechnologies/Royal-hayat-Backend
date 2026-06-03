import httpStatus from 'http-status';
import ApiError from '../../../utils/ApiError.js';
import enquiryRepository from '../repository/enquiry.repository.js';
import { sendEnquiryNotificationEmail } from '../../../utils/enquiryNotificationMail.js';

class EnquiryService {
  async createEnquiry(enquiryData) {
    try {
      const enquiry = await enquiryRepository.create(enquiryData);

      try {
        await sendEnquiryNotificationEmail(enquiry);
      } catch (mailError) {
        console.error(
          'Enquiry notification email failed:',
          mailError?.message || mailError,
        );
      }

      return enquiry;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error creating enquiry');
    }
  }

  async getAllEnquiries(filters = {}) {
    const {
      page = 1,
      limit = 10,
      department,
      email,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const query = { isActive: true };

    if (department) {
      query.department = department;
    }

    if (email) {
      query.email = email;
    }

    let enquiries = [];
    let total = 0;

    if (search) {
      const searchResult = await enquiryRepository.search(query, search, {
        page,
        limit,
        sortBy,
        sortOrder
      });
      enquiries = searchResult.enquiries;
      total = searchResult.total;
    } else {
      enquiries = await enquiryRepository.findMany(query, {
        page,
        limit,
        sortBy,
        sortOrder
      });
      total = await enquiryRepository.countDocuments(query);
    }

    return {
      enquiries,
      meta: {
        page,
        limit,
        totalRecords: total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getEnquiryById(id) {
    const enquiry = await enquiryRepository.findById(id);

    if (!enquiry || !enquiry.isActive) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Enquiry not found');
    }

    return enquiry;
  }

  async updateEnquiry(id, updateData) {
    const existingEnquiry = await enquiryRepository.findById(id);
    if (!existingEnquiry || !existingEnquiry.isActive) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Enquiry not found');
    }

    return await enquiryRepository.updateById(id, updateData);
  }

  async deleteEnquiry(id) {
    const existingEnquiry = await enquiryRepository.findById(id);
    if (!existingEnquiry || !existingEnquiry.isActive) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Enquiry not found');
    }

    await enquiryRepository.softDeleteById(id);
  }
}

export default new EnquiryService();
