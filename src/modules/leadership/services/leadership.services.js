
import httpStatus from "http-status";
import mongoose from "mongoose";

import LeadershipRepository from "../repository/leadership.repository.js";

import {
  createLeadershipValidator,
  updateLeadershipValidator,
} from "../validators/leadership.validator.js";

import { uploadToS3 } from "../../../utils/s3Upload.js";

import { getFileUrl } from "../../../utils/s3Fetch.js";
import toPlainObject from "../../../utils/toPlainObject.js";

const stripUploadFields = (data = {}) => {
  const { image, imageKey, ...fields } = data;
  return { fields, imageKey };
};

const attachSignedImage = async (leadership) => {
  if (!leadership) return null;

  const doc = toPlainObject(leadership);

  if (!doc.image) {
    return doc;
  }

  const signedImage = await getFileUrl(doc.image);

  return {
    ...doc,
    image: signedImage,
  };
};

class LeadershipService {

  async createLeadership(data, file) {
    const { fields, imageKey } = stripUploadFields(data);

    const { error, value } = createLeadershipValidator.validate(fields, {
      abortEarly: false,
    });

    if (error) {
      const err = new Error(
        error.details.map((detail) => detail.message).join(", ")
      );
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    const payload = { ...value };

    if (imageKey) {
      payload.image = imageKey;
    } else if (file) {
      const uploaded = await uploadToS3(file);
      payload.image = uploaded.key;
    } else {
      const err = new Error("Image is required");
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    const created = await LeadershipRepository.createLeadership(payload);
    return attachSignedImage(created);
  }

  async getAllLeadership() {

    const leadershipList =
      await LeadershipRepository.getAllLeadership();

    const updatedLeadership = await Promise.all(
      leadershipList.map((item) => attachSignedImage(item)),
    );

    return updatedLeadership;
  }

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

    return attachSignedImage(leadership);
  }

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

    const { fields, imageKey } = stripUploadFields(data);

    const { error, value } = updateLeadershipValidator.validate(fields, {
      abortEarly: false,
    });

    if (error) {
      const err = new Error(
        error.details.map((detail) => detail.message).join(", ")
      );
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    let uploadedImage = existingLeadership.image;

    if (imageKey) {
      uploadedImage = imageKey;
    } else if (file) {
      const uploaded = await uploadToS3(file);
      uploadedImage = uploaded.key;
    }

    const payload = {
      ...value,
      image: uploadedImage,
    };

    const updatedLeadership =
      await LeadershipRepository.updateLeadership(id, payload);

    return attachSignedImage(updatedLeadership);
  }

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