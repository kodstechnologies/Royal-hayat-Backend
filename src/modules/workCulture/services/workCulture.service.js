// services/workCulture.service.js

import httpStatus from "http-status";
import mongoose from "mongoose";

import WorkCultureRepository from "../repository/workCulture.repository.js";

import {
  createWorkCultureValidator,
  updateWorkCultureValidator,
} from "../validators/workCulture.validators.js";

import { uploadToS3 } from "../../../utils/s3Upload.js";

import { getMultipleFileUrls } from "../../../utils/s3Fetch.js";
import toPlainObject from "../../../utils/toPlainObject.js";

const attachSignedImages = async (workCulture) => {
  if (!workCulture) return null;

  const doc = toPlainObject(workCulture);
  const signedImages = await getMultipleFileUrls(doc.images || []);

  return {
    ...doc,
    images: signedImages,
  };
};

class WorkCultureService {
  // Create
  async createWorkCulture(data, files) {

    if (!files || files.length === 0) {
      throw new Error(
        "At least one image is required"
      );
    }

    // validate only text fields
    const { error, value } =
      createWorkCultureValidator.validate(
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
        uploaded.key
      );
    }

    const payload = {
      ...value,
      images: uploadedImages,
    };

    return await WorkCultureRepository
      .createWorkCulture(payload);
  }

  // Get All
  async getAllWorkCultures() {
    const workCultures =
      await WorkCultureRepository.getAllWorkCultures();

    const updatedWorkCultures = await Promise.all(
      workCultures.map((item) => attachSignedImages(item)),
    );

    return updatedWorkCultures;
  }

  // Get By ID
  async getWorkCultureById(id) {
    console.log("id---",id)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid Work Culture ID");
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    const workCulture =
      await WorkCultureRepository.getWorkCultureById(id);

    if (!workCulture) {
      const err = new Error("Work Culture not found");
      err.statusCode = httpStatus.NOT_FOUND;
      throw err;
    }

    return attachSignedImages(workCulture);
  }

  // Update
  async updateWorkCulture(id, data, files) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error(
        "Invalid Work Culture ID"
      );

      err.statusCode =
        httpStatus.BAD_REQUEST;

      throw err;
    }

    const existingWorkCulture =
      await WorkCultureRepository.getWorkCultureById(
        id
      );

    if (!existingWorkCulture) {
      const err = new Error(
        "Work Culture not found"
      );

      err.statusCode =
        httpStatus.NOT_FOUND;

      throw err;
    }

    // validate only text fields
    const { error, value } =
      updateWorkCultureValidator.validate(
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
      existingWorkCulture.images || [];

    // Keep only images explicitly retained by client (supports string or array)
    if (data.existingImages !== undefined) {
      const keptImages = Array.isArray(data.existingImages)
        ? data.existingImages
        : [data.existingImages];
      uploadedImages = keptImages.filter(
        (img) => typeof img === "string" && img.trim()
      );
    }

    // When upload middleware runs, new image URLs are already in data.images.
    // Merge those with retained existing images.
    if (Array.isArray(data.images) && data.images.length > 0) {
      uploadedImages = [...uploadedImages, ...data.images];
    } else if (files && files.length > 0) {
      // Fallback if middleware is bypassed
      for (const file of files) {
        const uploaded = await uploadToS3(file);
        uploadedImages.push(uploaded.key);
      }
    }

    const payload = {
      ...value,
      images: uploadedImages,
    };

    const updatedWorkCulture =
      await WorkCultureRepository.updateWorkCulture(
        id,
        payload
      );

    return attachSignedImages(updatedWorkCulture);
  }

  // Delete
  async deleteWorkCulture(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid Work Culture ID");
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    const deletedWorkCulture =
      await WorkCultureRepository.deleteWorkCulture(id);

    if (!deletedWorkCulture) {
      const err = new Error("Work Culture not found");
      err.statusCode = httpStatus.NOT_FOUND;
      throw err;
    }

    return deletedWorkCulture;
  }
}

export default new WorkCultureService();