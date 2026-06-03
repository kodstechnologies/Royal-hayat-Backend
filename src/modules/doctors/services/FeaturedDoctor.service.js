
import mongoose from "mongoose";
import httpStatus from "http-status";

import FeaturedDoctorsRepository from "../repositories/featuredDoctor.repository.js";

import {
  createFeaturedDoctorValidator,
  updateFeaturedDoctorValidator,
} from "../validators/featuredDoctor.validators.js";

class FeaturedDoctorsService {
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

  async getFeaturedDoctors() {
    return await FeaturedDoctorsRepository.getFeaturedDoctors();
  }

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

  async deleteFeaturedDoctor(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid Featured Doctor ID");
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    const deleted = await FeaturedDoctorsRepository.deleteFeaturedDoctor(id);

    if (!deleted) {
      const err = new Error("Featured Doctor not found");
      err.statusCode = httpStatus.NOT_FOUND;
      throw err;
    }

    return deleted;
  }
}

export default new FeaturedDoctorsService();