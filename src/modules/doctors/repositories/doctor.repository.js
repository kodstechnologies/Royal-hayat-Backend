import Doctor from '../models/doctor.model.js';

class DoctorRepository {
  async create(doctorData) {
    const doctor = new Doctor(doctorData);
    return await doctor.save();
  }

  async findById(id) {
    return await Doctor.findById(id)
      .populate({
        path: 'department',
        select: 'name departmentId',
        populate: { path: 'subspecialities', select: 'name description' },
      })
      .populate('subspecialities', 'name description')
      .lean();
  }

  async findOne(query) {
    return await Doctor.findOne(query);
  }

  async findMany(query, options = {}) {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = options;
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (page - 1) * limit;
    
    return await Doctor.find(query)
      .populate('department', 'name departmentId')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async findAll(query) {
    return await Doctor.find(query).lean();
  }

  async countDocuments(query) {
    return await Doctor.countDocuments(query);
  }

  async updateById(id, updateData) {
    return await Doctor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  async findOneAndUpdate(query, updateData, options = {}) {
    return await Doctor.findOneAndUpdate(
      query,
      updateData,
      { new: true, runValidators: true, ...options }
    );
  }

  async deleteById(id) {
    return await Doctor.findByIdAndDelete(id);
  }

  async softDeleteById(id) {
    return await Doctor.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  async distinct(field, query = {}) {
    return await Doctor.distinct(field, query);
  }

  async search(searchQuery, options = {}) {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = options;
    
    const query = {
      $text: { $search: searchQuery },
      isActive: true
    };
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (page - 1) * limit;
    
    const doctors = await Doctor.find(query)
      .populate('department', 'name departmentId')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Doctor.countDocuments(query);
    
    return {
      doctors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}

export default new DoctorRepository();
