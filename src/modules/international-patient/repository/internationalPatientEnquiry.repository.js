import InternationalPatientEnquiry from "../model/internationalPatientEnquiry.js";

class InternationalPatientEnquiryRepository {
  async create(data) {
    const enquiry = new InternationalPatientEnquiry(data);
    return enquiry.save();
  }

  async findByIdAndMarkViewed(id) {
    return InternationalPatientEnquiry.findByIdAndUpdate(
      id,
      { isViewed: true },
      { new: true, runValidators: true }
    );
  }

  async findMany(query, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    const skip = (page - 1) * limit;

    return InternationalPatientEnquiry.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async search(baseQuery, searchTerm, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    const skip = (page - 1) * limit;

    const query = {
      ...baseQuery,
      $or: [
        { firstName: { $regex: searchTerm, $options: "i" } },
        { lastName: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
        { country: { $regex: searchTerm, $options: "i" } },
        { comments: { $regex: searchTerm, $options: "i" } },
      ],
    };

    const [enquiries, total] = await Promise.all([
      InternationalPatientEnquiry.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      InternationalPatientEnquiry.countDocuments(query),
    ]);

    return { enquiries, total };
  }

  async countDocuments(query) {
    return InternationalPatientEnquiry.countDocuments(query);
  }

  async countUnviewed(query = {}) {
    return InternationalPatientEnquiry.countDocuments({
      ...query,
      isViewed: false,
    });
  }
}

export default new InternationalPatientEnquiryRepository();
