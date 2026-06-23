
import mongoose from 'mongoose';
import httpStatus from 'http-status';

import FeaturedDoctorsRepository from '../repositories/featuredDoctor.repository.js';

import {
  createFeaturedDoctorValidator,
  syncFeaturedDoctorsValidator,
} from '../validators/featuredDoctor.validators.js';

class FeaturedDoctorsService {
  async createFeaturedDoctor(data) {
    const { error, value } = createFeaturedDoctorValidator.validate(data, {
      abortEarly: false,
    });

    if (error) {
      throw new Error(error.details.map((err) => err.message).join(', '));
    }

    if (!mongoose.Types.ObjectId.isValid(value.doctor)) {
      const err = new Error('Invalid Doctor ID');
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    return await FeaturedDoctorsRepository.addFeaturedDoctor(value.doctor);
  }

  async getFeaturedDoctors() {
    return await FeaturedDoctorsRepository.getFeaturedDoctors();
  }

  async syncFeaturedDoctors(doctorIds) {
    const { error, value } = syncFeaturedDoctorsValidator.validate(
      { doctorIds },
      { abortEarly: false },
    );

    if (error) {
      throw new Error(error.details.map((err) => err.message).join(', '));
    }

    return await FeaturedDoctorsRepository.syncFeaturedDoctors(value.doctorIds);
  }

  async deleteFeaturedDoctor(doctorId) {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      const err = new Error('Invalid Doctor ID');
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    await FeaturedDoctorsRepository.removeFeaturedDoctor(doctorId);
    return null;
  }
}

export default new FeaturedDoctorsService();
