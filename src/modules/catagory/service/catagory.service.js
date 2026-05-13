import httpStatus from 'http-status';
import ApiError from '../../../utils/ApiError.js';
import catagoryRepository from '../repository/catagory.repository.js';

class CatagoryService {
  async createCatagory(data) {
    const trimmedName = data.name.trim();
    const trimmedArabicName = data.arabicName.trim();

    const nameTaken = await catagoryRepository.existsByName(
      trimmedName,
      trimmedArabicName
    );

    if (nameTaken) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'Category with this English or Arabic name already exists'
      );
    }

    return await catagoryRepository.create({
      name: trimmedName,
      arabicName: trimmedArabicName,
    });
  }

  async getAllCatagories(filters = {}) {
    return await catagoryRepository.findAll(filters);
  }

  async getCatagoriesWithDepartmentsAndDoctors() {
    return await catagoryRepository.findAllWithDepartmentsAndDoctors();
  }

  async getCatagoryById(id) {
    const catagory = await catagoryRepository.findById(id);

    if (!catagory) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Category not found'
      );
    }

    return catagory;
  }

  async updateCatagory(id, updateData) {
    const exists = await catagoryRepository.exists(id);

    if (!exists) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Category not found'
      );
    }

    const trimmedName = updateData.name.trim();
    const trimmedArabicName = updateData.arabicName.trim();

    const taken = await catagoryRepository.existsByName(
      trimmedName,
      trimmedArabicName,
      id
    );

    if (taken) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'Category with this English or Arabic name already exists'
      );
    }

    const payload = {
      name: trimmedName,
      arabicName: trimmedArabicName,
    };

    const updated = await catagoryRepository.updateById(
      id,
      payload
    );

    if (!updated) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Category not found'
      );
    }

    return updated;
  }

  async deleteCatagory(id) {
    const exists = await catagoryRepository.exists(id);

    if (!exists) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Category not found'
      );
    }

    await catagoryRepository.deleteById(id);
  }
}

export default new CatagoryService();