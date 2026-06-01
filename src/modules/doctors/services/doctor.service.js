import doctorRepository from '../repositories/doctor.repository.js';
import Department from '../../departments/models/department.model.js';
import Subspeciality from '../../subspeciality/model/subspeciality.model.js';
import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';

function normalizeDoctorSubspecialityIds(ids) {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.map(String).filter((id) => /^[0-9a-fA-F]{24}$/i.test(id)))];
}

function subspecialityIdsFromDoctorDoc(doc) {
  if (!doc?.subspecialities?.length) return [];
  return doc.subspecialities.map((s) =>
    typeof s === 'object' && s && '_id' in s ? String(s._id) : String(s),
  );
}

async function assertSubspecialitiesBelongToDepartment(departmentId, subspecialityIds) {
  if (!subspecialityIds || subspecialityIds.length === 0) return;
  const dept = await Department.findById(departmentId).select('subspecialities').lean();
  if (!dept) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Department not found');
  }
  const allowed = new Set((dept.subspecialities || []).map(String));
  for (const sid of subspecialityIds) {
    if (!allowed.has(String(sid))) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Each selected subspeciality must belong to the selected department',
      );
    }
  }
}

class DoctorService {
  async createDoctor(doctorData) {
    try {
      const existingDoctor = await doctorRepository.findOne({
        name: doctorData.name,
        specialty: doctorData.specialty
      });

      const subs = normalizeDoctorSubspecialityIds(doctorData.subspecialities || []);
      await assertSubspecialitiesBelongToDepartment(doctorData.department, subs);
      const payload = { ...doctorData, subspecialities: subs };

      const doctor = await doctorRepository.create(payload);
      return doctor;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error creating doctor');
    }
  }

  async getAllDoctors(filters = {}) {
    const {
      page = 1,
      limit = 10,
      department,
      specialty,
      search,
      availableOnline,
      sortBy = 'name',
      sortOrder = 'asc'
    } = filters;

    const query = { isActive: true };

    if (department) {
      query.department = department;
    }
    if (specialty) {
      query.specialty = specialty;
    }
    if (availableOnline !== undefined) {
      query.availableOnline = availableOnline;
    }

    let doctors, total;

    if (search) {
      const searchResult = await doctorRepository.search(search, {
        page,
        limit,
        sortBy,
        sortOrder
      });
      doctors = searchResult.doctors;
      total = searchResult.total;
    } else {
      doctors = await doctorRepository.findMany(query, {
        page,
        limit,
        sortBy,
        sortOrder
      });
      total = await doctorRepository.countDocuments(query);
    }

    return {
      doctors,
      meta: {
        page,
        limit,
        totalRecords: total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getDoctorById(id) {
    const doctor = await doctorRepository.findById(id);

    if (!doctor) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
    }

    return doctor;
  }

  async getDoctorsByDepartment(department) {
    const doctors = await doctorRepository.findAll({
      department: department,
      isActive: true
    });

    return doctors.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getAllDoctorsBySubspeciality(subspecialityId, filters = {}) {
    const subsExists = await Subspeciality.exists({ _id: subspecialityId });
    if (!subsExists) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Subspeciality not found');
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters;

    const query = {
      isActive: true,
      subspecialities: subspecialityId,
    };

    const doctors = await doctorRepository.findMany(query, {
      page,
      limit,
      sortBy,
      sortOrder,
    });
    const total = await doctorRepository.countDocuments(query);

    return {
      doctors,
      meta: {
        page,
        limit,
        totalRecords: total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    };
  }

  async updateDoctor(id, updateData) {
    const existingDoctor = await doctorRepository.findById(id);
    if (!existingDoctor) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
    }

    if (updateData.name || updateData.specialty) {
      const duplicateCheck = await doctorRepository.findOne({
        _id: { $ne: id },
        name: updateData.name || existingDoctor.name,
        specialty: updateData.specialty || existingDoctor.specialty
      });

      if (duplicateCheck) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Doctor with this name and specialty already exists');
      }
    }

    const resolvedDeptId =
      updateData.department !== undefined
        ? String(updateData.department)
        : String(existingDoctor.department?._id || existingDoctor.department || '');

    const patch = { ...updateData };

    if (updateData.subspecialities !== undefined) {
      const subs = normalizeDoctorSubspecialityIds(updateData.subspecialities);
      await assertSubspecialitiesBelongToDepartment(resolvedDeptId, subs);
      patch.subspecialities = subs;
    } else if (updateData.department !== undefined) {
      const existingSubs = subspecialityIdsFromDoctorDoc(existingDoctor);
      const dept = await Department.findById(resolvedDeptId).select('subspecialities').lean();
      const allowed = new Set((dept?.subspecialities || []).map(String));
      const filtered = existingSubs.filter((sid) => allowed.has(sid));
      patch.subspecialities = filtered;
      await assertSubspecialitiesBelongToDepartment(resolvedDeptId, filtered);
    }

    const doctor = await doctorRepository.updateById(id, patch);
    return doctor;
  }

  async deleteDoctor(id) {
    const doctor = await doctorRepository.findById(id);
    
    if (!doctor) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
    }

    await doctorRepository.softDeleteById(id);
  }

  async getDepartments() {
    const departments = await doctorRepository.distinct('department', { isActive: true });
    return departments.sort();
  }

  async getSpecialties() {
    const specialties = await doctorRepository.distinct('specialty', { isActive: true });
    return specialties.sort();
  }
}

export default new DoctorService();
