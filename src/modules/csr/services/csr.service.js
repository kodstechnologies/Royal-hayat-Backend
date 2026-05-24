// services/csr.service.js

import httpStatus from "http-status";
import mongoose from "mongoose";

import CSRRepository from "../repository/csr.repository.js";

import {
  createCSRValidator,
  updateCSRValidator,
} from "../validators/csr.validator.js";

import {
  uploadToS3,
} from "../../../utils/s3Upload.js";

class CSRService {

  // Create
  async createCSR(data, files) {

    if (!files || files.length === 0) {

      throw new Error(
        "At least one image is required"
      );
    }

    // validate only text fields
    const { error, value } =
      createCSRValidator.validate(
        data,
        {
          abortEarly: false,
        }
      );

    if (error) {

      throw new Error(
        error.details
          .map((err) => err.message)
          .join(", ")
      );
    }

    const uploadedImages = [];

    for (const file of files) {

      const uploaded =
        await uploadToS3(file);

      // STORE DIRECT URL
      uploadedImages.push(
        uploaded.url
      );
    }

    const payload = {
      ...value,
      images: uploadedImages,
    };

    return await CSRRepository.createCSR(
      payload
    );
  }

  // Get All
  async getAllCSR() {

    return await CSRRepository.getAllCSR();
  }

  // Get By ID
  async getCSRById(id) {

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {

      const err =
        new Error("Invalid CSR ID");

      err.statusCode =
        httpStatus.BAD_REQUEST;

      throw err;
    }

    const csr =
      await CSRRepository.getCSRById(id);

    if (!csr) {

      const err =
        new Error("CSR not found");

      err.statusCode =
        httpStatus.NOT_FOUND;

      throw err;
    }

    return csr;
  }

  // Update
  async updateCSR(id, data, files) {

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {

      const err =
        new Error("Invalid CSR ID");

      err.statusCode =
        httpStatus.BAD_REQUEST;

      throw err;
    }

    const existingCSR =
      await CSRRepository.getCSRById(id);

    if (!existingCSR) {

      const err =
        new Error("CSR not found");

      err.statusCode =
        httpStatus.NOT_FOUND;

      throw err;
    }

    // validate only text fields
    const { error, value } =
      updateCSRValidator.validate(
        data,
        {
          abortEarly: false,
        }
      );

    if (error) {

      throw new Error(
        error.details
          .map((err) => err.message)
          .join(", ")
      );
    }

    let uploadedImages =
      existingCSR.images || [];

    // if new images uploaded
    if (files && files.length > 0) {

      uploadedImages = [];

      for (const file of files) {

        const uploaded =
          await uploadToS3(file);

        // STORE DIRECT URL
        uploadedImages.push(
          uploaded.url
        );
      }
    }

    const payload = {
      ...value,
      images: uploadedImages,
    };

    return await CSRRepository.updateCSR(
      id,
      payload
    );
  }

  // Delete
  async deleteCSR(id) {

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {

      const err =
        new Error("Invalid CSR ID");

      err.statusCode =
        httpStatus.BAD_REQUEST;

      throw err;
    }

    const deletedCSR =
      await CSRRepository.deleteCSR(id);

    if (!deletedCSR) {

      const err =
        new Error("CSR not found");

      err.statusCode =
        httpStatus.NOT_FOUND;

      throw err;
    }

    return deletedCSR;
  }
}

export default new CSRService();