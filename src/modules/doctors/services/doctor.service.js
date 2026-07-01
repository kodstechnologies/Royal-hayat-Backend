import doctorRepository from '../repositories/doctor.repository.js';
import Department from '../../departments/models/department.model.js';
import Subspeciality from '../../subspeciality/model/subspeciality.model.js';
import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';
import {
  filterValidObjectIds,
  resolveExpertiseRefs,
} from '../utils/expertise.util.js';
import { resolveQualificationsRefs } from '../utils/qualifications.util.js';

const OID = /^[0-9a-fA-F]{24}$/i;

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value.map((s) => String(s).trim()).filter(Boolean),
    ),
  ];
}

async function assertDepartmentsExist(departments) {
  const departmentIds = filterValidObjectIds(departments);

  if (departmentIds.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'At least one department is required');
  }

  const count = await Department.countDocuments({ _id: { $in: departmentIds } });

  if (count !== departmentIds.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'One or more departments not found');
  }

  return departmentIds;
}

async function resolveDepartmentId(departmentParam) {
  if (OID.test(departmentParam)) {
    await assertDepartmentsExist([departmentParam]);
    return departmentParam;
  }

  const dept = await Department.findOne({
    $or: [{ departmentId: departmentParam }, { name: departmentParam }],
  })
    .select('_id')
    .lean();

  if (!dept) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Department not found');
  }

  return String(dept._id);
}

class DoctorService {
  async createDoctor(doctorData) {
    const departmentIds = await assertDepartmentsExist(doctorData.department);

    const payload = {
      ...doctorData,
      department: departmentIds,
      subspecialities: normalizeStringArray(
        doctorData.subspecialities,
      ),
      subspecialitiesAr: normalizeStringArray(
        doctorData.subspecialitiesAr,
      ),
      expertise: await resolveExpertiseRefs(doctorData.expertise),
      qualifications: await resolveQualificationsRefs(doctorData.qualifications),
    };

    return await doctorRepository.create(payload);
  }

  async getAllDoctors(filters = {}) {
    const {
      page = 1,
      limit = 10,
      department,
      subspeciality,
      search,
      availableOnline,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const query = { isActive: true };

    if (department) {
      query.department = department;
    }

    if (subspeciality) {
      query.$or = [
        { subspecialities: subspeciality },
        { subspecialitiesAr: subspeciality },
      ];
    }

    if (availableOnline !== undefined) {
      query.availableOnline = availableOnline;
    }

    let doctors;
    let total;

    if (search) {
      const searchResult = await doctorRepository.search(search, {
        page,
        limit,
        sortBy,
        sortOrder,
        department,
      });
      doctors = searchResult.doctors;
      total = searchResult.total;
    } else {
      doctors = await doctorRepository.findMany(query, {
        page,
        limit,
        sortBy,
        sortOrder,
      });
      total = await doctorRepository.countDocuments(query);
    }

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

  async getDoctorById(id) {
    const doctor = await doctorRepository.findById(id);

    if (!doctor) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
    }

    return doctor;
  }

  async getDoctorsByDepartment(departmentParam) {
    const departmentId = await resolveDepartmentId(departmentParam);

    const doctors = await doctorRepository.findAll({
      department: departmentId,
      isActive: true,
    });

    return doctors.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getAllDoctorsBySubspeciality(subspecialityId, filters = {}) {
    const sub = await Subspeciality.findById(subspecialityId)
      .select('name arabicName')
      .lean();

    if (!sub) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Subspeciality not found');
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters;

    const matchValues = [
      sub.name,
      sub.arabicName,
    ].filter(Boolean);

    const query = {
      isActive: true,
      $or: [
        { subspecialities: { $in: matchValues } },
        { subspecialitiesAr: { $in: matchValues } },
      ],
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

    const patch = { ...updateData };

    if (updateData.department !== undefined) {
      patch.department = await assertDepartmentsExist(updateData.department);
    }

    if (patch.image === undefined || patch.image === '') {
      delete patch.image;
    }

    if (updateData.subspecialities !== undefined) {
      patch.subspecialities = normalizeStringArray(
        updateData.subspecialities,
      );
    }

    if (updateData.subspecialitiesAr !== undefined) {
      patch.subspecialitiesAr = normalizeStringArray(
        updateData.subspecialitiesAr,
      );
    }

    if (updateData.expertise !== undefined) {
      patch.expertise = await resolveExpertiseRefs(updateData.expertise);
    }

    if (updateData.qualifications !== undefined) {
      patch.qualifications = await resolveQualificationsRefs(
        updateData.qualifications,
      );
    }

    return await doctorRepository.updateById(id, patch);
  }

  async deleteDoctor(id) {
    const doctor = await doctorRepository.findById(id);

    if (!doctor) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
    }

    await doctorRepository.softDeleteById(id);
  }

  async getDepartments() {
    const departmentIds = await doctorRepository.distinct('department', {
      isActive: true,
    });

    if (departmentIds.length === 0) return [];

    const departments = await Department.find({
      _id: { $in: departmentIds },
    })
      .select('departmentId name arabicName')
      .sort({ name: 1 })
      .lean();

    return departments;
  }
}

export default new DoctorService();
