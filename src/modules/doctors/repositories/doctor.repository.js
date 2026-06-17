import Doctor from '../models/doctor.model.js';
import '../../departments/models/department.model.js';
import '../models/expertise.model.js';
import '../models/qualifications.model.js';
import { attachExpertiseToDoctors } from '../utils/expertise.util.js';
import { attachQualificationsToDoctors } from '../utils/qualifications.util.js';

const DOCTOR_POPULATE = [
  { path: 'department', select: 'departmentId name arabicName' },
];

async function enrichDoctors(doctors) {
  return attachQualificationsToDoctors(await attachExpertiseToDoctors(doctors));
}

class DoctorRepository {
  async create(doctorData) {
    const doctor = new Doctor(doctorData);
    return await doctor.save();
  }

  async findById(id) {
    const doctor = await Doctor.findById(id)
      .populate(DOCTOR_POPULATE)
      .lean();
    if (!doctor) return null;
    return enrichDoctors(doctor);
  }

  async findOne(query) {
    return await Doctor.findOne(query);
  }

  async findMany(query, options = {}) {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = options;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const doctors = await Doctor.find(query)
      .populate(DOCTOR_POPULATE)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    return enrichDoctors(doctors);
  }

  async findAll(query) {
    const doctors = await Doctor.find(query)
      .populate(DOCTOR_POPULATE)
      .lean();

    return enrichDoctors(doctors);
  }

  async countDocuments(query) {
    return await Doctor.countDocuments(query);
  }

  async updateById(id, updateData) {
    const doctor = await Doctor.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate(DOCTOR_POPULATE)
      .lean();

    if (!doctor) return null;
    return enrichDoctors(doctor);
  }

  async findOneAndUpdate(query, updateData, options = {}) {
    return await Doctor.findOneAndUpdate(query, updateData, {
      new: true,
      runValidators: true,
      ...options,
    });
  }

  async deleteById(id) {
    return await Doctor.findByIdAndDelete(id);
  }

  async softDeleteById(id) {
    return await Doctor.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );
  }

  async distinct(field, query = {}) {
    return await Doctor.distinct(field, query);
  }

  async search(searchQuery, options = {}) {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = options;

    const query = {
      $text: { $search: searchQuery },
      isActive: true,
    };

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const doctors = await Doctor.find(query)
      .populate(DOCTOR_POPULATE)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const enrichedDoctors = await enrichDoctors(doctors);

    const total = await Doctor.countDocuments(query);

    return {
      doctors: enrichedDoctors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export default new DoctorRepository();
