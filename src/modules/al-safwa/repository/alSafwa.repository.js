import AlSafwa from "../model/alSafwa.model.js";

class AlSafwaRepository {
  async create(data) {
    const enrollment = new AlSafwa(data);
    return enrollment.save();
  }

  async findById(id) {
    return AlSafwa.findById(id);
  }

  async findByIdAndMarkViewed(id) {
    return AlSafwa.findByIdAndUpdate(
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

    return AlSafwa.find(query)
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
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
        { notes: { $regex: searchTerm, $options: "i" } },
      ],
    };

    const [enrollments, total] = await Promise.all([
      AlSafwa.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      AlSafwa.countDocuments(query),
    ]);

    return { enrollments, total };
  }

  async countDocuments(query) {
    return AlSafwa.countDocuments(query);
  }

  async countUnviewed(query = {}) {
    return AlSafwa.countDocuments({
      ...query,
      isViewed: false,
    });
  }
}

export default new AlSafwaRepository();
