import Doctor from '../models/doctor.model.js';
import '../../departments/models/department.model.js';
import '../models/expertise.model.js';
import '../models/qualifications.model.js';
import { attachExpertiseToDoctors } from '../utils/expertise.util.js';
import { attachQualificationsToDoctors } from '../utils/qualifications.util.js';
import {
  escapeRegex,
  matchesDoctorCombinedInitials,
} from '../utils/doctorSearch.util.js';

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
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

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
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      department,
    } = options;
    const term = String(searchQuery || '').trim();
    const escaped = escapeRegex(term);
    const compactTerm = term.replace(/[\s.]/g, '');

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;
    const baseQuery = { isActive: true };

    if (department) {
      baseQuery.department = department;
    }

    const regexQuery = {
      ...baseQuery,
      $or: [
        { name: { $regex: escaped, $options: 'i' } },
        { nameAr: { $regex: escaped, $options: 'i' } },
        { title: { $regex: escaped, $options: 'i' } },
        { titleAr: { $regex: escaped, $options: 'i' } },
        { subspecialities: { $regex: escaped, $options: 'i' } },
        { subspecialitiesAr: { $regex: escaped, $options: 'i' } },
      ],
    };

    let matchedDoctors = await Doctor.find(regexQuery)
      .populate(DOCTOR_POPULATE)
      .sort(sortOptions)
      .lean();

    if (compactTerm.length >= 2 && /^[\p{L}]+$/u.test(compactTerm)) {
      const regexIds = new Set(matchedDoctors.map((doctor) => String(doctor._id)));
      const initialsCandidates = await Doctor.find(baseQuery)
        .select('name nameAr')
        .lean();

      const initialsMatches = initialsCandidates.filter((doctor) =>
        matchesDoctorCombinedInitials(doctor, term),
      );

      const missingIds = initialsMatches
        .map((doctor) => String(doctor._id))
        .filter((id) => !regexIds.has(id));

      if (missingIds.length) {
        const extraDoctors = await Doctor.find({
          _id: { $in: missingIds },
          ...baseQuery,
        })
          .populate(DOCTOR_POPULATE)
          .lean();

        matchedDoctors = [...matchedDoctors, ...extraDoctors];
        matchedDoctors.sort((a, b) => {
          const direction = sortOrder === 'desc' ? -1 : 1;
          if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
            const aTime = new Date(a[sortBy] || 0).getTime();
            const bTime = new Date(b[sortBy] || 0).getTime();
            if (aTime === bTime) return 0;
            return aTime > bTime ? direction : -direction;
          }
          const aVal = String(a[sortBy] ?? '').toLowerCase();
          const bVal = String(b[sortBy] ?? '').toLowerCase();
          if (aVal === bVal) return 0;
          return aVal > bVal ? direction : -direction;
        });
      }
    }

    const total = matchedDoctors.length;
    const paginatedDoctors = matchedDoctors.slice(skip, skip + limit);
    const enrichedDoctors = await enrichDoctors(paginatedDoctors);

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
