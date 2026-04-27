import departmentRepository from '../repositories/department.repository.js';
import Department from '../models/department.model.js';
import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';

class DepartmentService {
  async createDepartment(departmentData) {
    // Check if department name already exists
    const existingDepartment = await departmentRepository.existsByName(departmentData.name);
    if (existingDepartment) {
      throw new ApiError(httpStatus.CONFLICT, 'Department with this name already exists');
    }

    // Check if slug already exists (if provided)
    if (departmentData.slug) {
      const existingSlug = await departmentRepository.existsBySlug(departmentData.slug);
      if (existingSlug) {
        throw new ApiError(httpStatus.CONFLICT, 'Department with this slug already exists');
      }
    }

    return await departmentRepository.create(departmentData);
  }

  async getAllDepartments(filters = {}) {
    return await departmentRepository.findAll(filters);
  }

  async getDepartmentById(id) {
    const department = await departmentRepository.findById(id);
    if (!department) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Department not found');
    }
    return department;
  }

  async getDepartmentBySlug(slug) {
    const department = await departmentRepository.findBySlug(slug);
    if (!department) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Department not found');
    }
    return department;
  }

  async updateDepartment(id, updateData) {
    // Check if department exists
    const existingDepartment = await departmentRepository.exists(id);
    if (!existingDepartment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Department not found');
    }

    // Check if name is being updated and if it already exists
    if (updateData.name) {
      const nameExists = await Department.findOne({ 
        name: updateData.name, 
        _id: { $ne: id } 
      });
      if (nameExists) {
        throw new ApiError(httpStatus.CONFLICT, 'Department with this name already exists');
      }
    }

    // Check if slug is being updated and if it already exists
    if (updateData.slug) {
      const slugExists = await Department.findOne({ 
        slug: updateData.slug, 
        _id: { $ne: id } 
      });
      if (slugExists) {
        throw new ApiError(httpStatus.CONFLICT, 'Department with this slug already exists');
      }
    }

    return await departmentRepository.updateById(id, updateData);
  }

  async deleteDepartment(id) {
    // Check if department exists
    const existingDepartment = await departmentRepository.exists(id);
    if (!existingDepartment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Department not found');
    }

    return await departmentRepository.deleteById(id);
  }
}

export default new DepartmentService();
