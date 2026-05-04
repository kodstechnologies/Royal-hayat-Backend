import departmentRepository from '../repositories/department.repository.js';
import Department from '../models/department.model.js';
import Catagory from '../../catagory/model/catagory.model.js';
import Subspeciality from '../../subspeciality/model/subspeciality.model.js';
import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';

class DepartmentService {
  async createDepartment(departmentData) {
    const catagoryExists = await Catagory.exists({ _id: departmentData.catagory });
    if (!catagoryExists) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Category not found');
    }

    if (departmentData.subspeciality) {
      const subspecialityExists = await Subspeciality.exists({ _id: departmentData.subspeciality });
      if (!subspecialityExists) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Subspeciality not found');
      }
    }

    const existingDepartmentId = await departmentRepository.existsByDepartmentId(departmentData.departmentId);
    // if (existingDepartmentId) {
    //   throw new ApiError(httpStatus.CONFLICT, 'Department with this departmentId already exists');
    // }

    // Check if department name already exists
    // const existingDepartment = await departmentRepository.existsByName(departmentData.name);
    // if (existingDepartment) {
    //   throw new ApiError(httpStatus.CONFLICT, 'Department with this name already exists');
    // }

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

    if (updateData.departmentId) {
      const departmentIdExists = await Department.findOne({
        departmentId: updateData.departmentId,
        _id: { $ne: id }
      });
      if (departmentIdExists) {
        throw new ApiError(httpStatus.CONFLICT, 'Department with this departmentId already exists');
      }
    }

    if (updateData.catagory) {
      const catagoryExists = await Catagory.exists({ _id: updateData.catagory });
      if (!catagoryExists) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Category not found');
      }
    }

    if (updateData.subspeciality) {
      const subspecialityExists = await Subspeciality.exists({ _id: updateData.subspeciality });
      if (!subspecialityExists) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Subspeciality not found');
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
