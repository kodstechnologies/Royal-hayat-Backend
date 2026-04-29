import doctorRepository from '../repositories/doctor.repository.js';
import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';

class DoctorService {
  async createDoctor(doctorData) {
    try {
      // Check if doctor already exists with same name and specialty
      const existingDoctor = await doctorRepository.findOne({
        name: doctorData.name,
        specialty: doctorData.specialty
      });

      // if (existingDoctor) {
      //   throw new ApiError(httpStatus.BAD_REQUEST, 'Doctor with this name and specialty already exists');
      // }

      const doctor = await doctorRepository.create(doctorData);
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

    // Apply filters
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
    
    if (!doctor || !doctor.isActive) {
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

  async updateDoctor(id, updateData) {
    // Check if doctor exists
    const existingDoctor = await doctorRepository.findById(id);
    if (!existingDoctor || !existingDoctor.isActive) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
    }

    // Check for duplicate if updating name or specialty
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

    const doctor = await doctorRepository.updateById(id, updateData);
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
