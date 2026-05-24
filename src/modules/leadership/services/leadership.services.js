// services/leadership.service.js

import httpStatus from "http-status";
import mongoose from "mongoose";

import LeadershipRepository from "../repository/leadership.repository.js";

import {
  createLeadershipValidator,
  updateLeadershipValidator,
} from "../validators/leadership.validator.js";

import { uploadToS3 } from "../../../utils/s3Upload.js";

import { getFileUrl } from "../../../utils/s3Fetch.js";

class LeadershipService {

  // Create
  async createLeadership(data, file) {

    if (!file) {
      throw new Error(
        "Image is required"
      );
    }

    // validate only text fields
    const { error, value } =
      createLeadershipValidator.validate(
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

    const uploaded =
      await uploadToS3(file);

    const payload = {
      ...value,
      image: uploaded.key,
    };

    return await LeadershipRepository
      .createLeadership(payload);
  }

  // Get All
  async getAllLeadership() {

    const leadershipList =
      await LeadershipRepository.getAllLeadership();

    const updatedLeadership =
      await Promise.all(
        leadershipList.map(
          async (item) => {

            const signedImage =
              await getFileUrl(
                item.image
              );

            return {
              ...item.toObject(),
              image: signedImage,
            };
          }
        )
      );

    return updatedLeadership;
  }

  // Get By ID
  async getLeadershipById(id) {

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      const err = new Error(
        "Invalid Leadership ID"
      );

      err.statusCode =
        httpStatus.BAD_REQUEST;

      throw err;
    }

    const leadership =
      await LeadershipRepository.getLeadershipById(
        id
      );

    if (!leadership) {

      const err = new Error(
        "Leadership not found"
      );

      err.statusCode =
        httpStatus.NOT_FOUND;

      throw err;
    }

    const signedImage =
      await getFileUrl(
        leadership.image
      );

    return {
      ...leadership.toObject(),
      image: signedImage,
    };
  }

  // Update
  async updateLeadership(
    id,
    data,
    file
  ) {

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {

      const err = new Error(
        "Invalid Leadership ID"
      );

      err.statusCode =
        httpStatus.BAD_REQUEST;

      throw err;
    }

    const existingLeadership =
      await LeadershipRepository.getLeadershipById(
        id
      );

    if (!existingLeadership) {

      const err = new Error(
        "Leadership not found"
      );

      err.statusCode =
        httpStatus.NOT_FOUND;

      throw err;
    }

    // validate only text fields
    const { error, value } =
      updateLeadershipValidator.validate(
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

    let uploadedImage =
      existingLeadership.image;

    // if new image uploaded
    if (file) {

      const uploaded =
        await uploadToS3(file);

      uploadedImage =
        uploaded.key;
    }

    const payload = {
      ...value,
      image: uploadedImage,
    };

    const updatedLeadership =
      await LeadershipRepository.updateLeadership(
        id,
        payload
      );

    const signedImage =
      await getFileUrl(
        updatedLeadership.image
      );

    return {
      ...updatedLeadership.toObject(),
      image: signedImage,
    };
  }

  // Delete
  async deleteLeadership(id) {

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {

      const err = new Error(
        "Invalid Leadership ID"
      );

      err.statusCode =
        httpStatus.BAD_REQUEST;

      throw err;
    }

    const deletedLeadership =
      await LeadershipRepository.deleteLeadership(
        id
      );

    if (!deletedLeadership) {

      const err = new Error(
        "Leadership not found"
      );

      err.statusCode =
        httpStatus.NOT_FOUND;

      throw err;
    }

    return deletedLeadership;
  }
}

export default new LeadershipService();