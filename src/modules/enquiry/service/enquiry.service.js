import httpStatus from 'http-status';
import ApiError from '../../../utils/ApiError.js';
import enquiryRepository from '../repository/enquiry.repository.js';

class EnquiryService {
  async createEnquiry(enquiryData) {
    try {
      const enquiry = await enquiryRepository.create(enquiryData);
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

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const enquiries = await enquiryRepository.findMany(query, {
      page,
      limit,
      sortBy,
      sortOrder
    });

    const total = await enquiryRepository.countDocuments(query);

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
