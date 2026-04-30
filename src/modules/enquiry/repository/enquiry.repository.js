import Enquiry from '../models/enquiry.model.js';

class EnquiryRepository {
  async create(enquiryData) {
    const enquiry = new Enquiry(enquiryData);
    return await enquiry.save();
  }

  async findById(id) {
    return await Enquiry.findById(id);
  }

  async findOne(query) {
    return await Enquiry.findOne(query);
  }

  async findMany(query, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    return await Enquiry.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async search(baseQuery, searchTerm, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const query = {
      ...baseQuery,
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { department: { $regex: searchTerm, $options: 'i' } },
        { message: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    const [enquiries, total] = await Promise.all([
      Enquiry.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      Enquiry.countDocuments(query)
    ]);

    return { enquiries, total };
  }

  async countDocuments(query) {
    return await Enquiry.countDocuments(query);
  }

  async updateById(id, updateData) {
    return await Enquiry.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
  }

  async softDeleteById(id) {
    return await Enquiry.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }
}

export default new EnquiryRepository();
