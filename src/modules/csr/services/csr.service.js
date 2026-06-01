
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

  async createCSR(data, files) {

    if (!files || files.length === 0) {

      throw new Error(
        "At least one image is required"
      );
    }

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

  async getAllCSR() {

    return await CSRRepository.getAllCSR();
  }

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

    let uploadedImages = existingCSR.images || [];

    if (data.existingImages !== undefined) {
      const kept = Array.isArray(data.existingImages)
        ? data.existingImages
        : [data.existingImages];
      uploadedImages = kept.filter((url) => url && String(url).trim());
    }

    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      uploadedImages = [...uploadedImages, ...data.images];
    } else if (files && files.length > 0) {
      for (const file of files) {
        const uploaded = await uploadToS3(file);
        uploadedImages.push(uploaded.url);
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