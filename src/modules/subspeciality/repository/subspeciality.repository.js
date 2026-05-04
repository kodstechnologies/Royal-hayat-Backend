import Subspeciality from '../model/subspeciality.model.js';

class SubspecialityRepository {
  async create(data) {
    const doc = new Subspeciality(data);
    return await doc.save();
  }

  async findById(id) {
    return await Subspeciality.findById(id).lean();
  }

  async findAll(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [subspecialities, total] = await Promise.all([
      Subspeciality.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Subspeciality.countDocuments(query),
    ]);

    return {
      subspecialities,
      meta: {
        page,
        limit,
        totalRecords: total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async updateById(id, updateData) {
    return await Subspeciality.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();
  }

  async deleteById(id) {
    return await Subspeciality.findByIdAndDelete(id).lean();
  }

  async exists(id) {
    return await Subspeciality.exists({ _id: id });
  }

  async existsByName(name, excludeId = null) {
    const q = { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
    if (excludeId) {
      q._id = { $ne: excludeId };
    }
    return await Subspeciality.exists(q);
  }
}

export default new SubspecialityRepository();
