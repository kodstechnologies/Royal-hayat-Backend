// services/featuredDoctors.service.js

import mongoose from "mongoose";
import httpStatus from "http-status";

import FeaturedDoctorsRepository from "../repositories/featuredDoctor.repository.js";

import {
  createFeaturedDoctorValidator,
  updateFeaturedDoctorValidator,
} from "../validators/featuredDoctor.validators.js";

class FeaturedDoctorsService {
  // Add Featured Doctor
  async createFeaturedDoctor(data) {
    const { error, value } =
      createFeaturedDoctorValidator.validate(data, {
        abortEarly: false,
      });

    if (error) {
      throw new Error(
        error.details.map((err) => err.message).join(", ")
      );
    }

    if (!mongoose.Types.ObjectId.isValid(value.doctor)) {
      const err = new Error("Invalid Doctor ID");
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    return await FeaturedDoctorsRepository.createFeaturedDoctor(
      value
    );
  }

  // Get Featured Doctors
  async getFeaturedDoctors() {
    return await FeaturedDoctorsRepository.getFeaturedDoctors();
  }

  // Edit Featured Doctor
  async updateFeaturedDoctor(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid Featured Doctor ID");
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    const { error, value } =
      updateFeaturedDoctorValidator.validate(data, {
        abortEarly: false,
      });

    if (error) {
      throw new Error(
        error.details.map((err) => err.message).join(", ")
      );
    }

    if (!mongoose.Types.ObjectId.isValid(value.doctor)) {
      const err = new Error("Invalid Doctor ID");
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    const updatedFeaturedDoctor =
      await FeaturedDoctorsRepository.updateFeaturedDoctor(
        id,
        value
      );

    if (!updatedFeaturedDoctor) {
      const err = new Error("Featured Doctor not found");
      err.statusCode = httpStatus.NOT_FOUND;
      throw err;
    }

    return updatedFeaturedDoctor;
  }
}

export default new FeaturedDoctorsService();