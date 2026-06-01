import httpStatus from "http-status";
import mongoose from "mongoose";

import AchievementRepository from "../repository/achievement.repository.js";
import {
  createAchievementValidator,
  updateAchievementValidator,
  getAchievementsQueryValidator,
} from "../validators/achievement.validators.js";
import { uploadToS3 as uploadFileToS3 } from "../../../utils/s3Upload.js";
import { getFileUrl } from "../../../utils/s3Fetch.js";
import toPlainObject from "../../../utils/toPlainObject.js";

const stripUploadFields = (data = {}) => {
  const { image, imageKey, ...fields } = data;
  return { fields, imageKey };
};

const normalizeAchievementFields = (fields = {}) => {
  const normalized = { ...fields };

  normalized.employeeId = normalized.employeeId || normalized.employeeID;
  normalized.employeeID = normalized.employeeID || normalized.employeeId;

  normalized.arabicTitle = normalized.arabicTitle || normalized.arabictitle || "";
  normalized.arabicAchievements =
    normalized.arabicAchievements || normalized.arabicachievements || "";

  delete normalized.arabictitle;
  delete normalized.arabicachievements;

  return normalized;
};

const attachSignedImage = async (achievement) => {
  if (!achievement) return null;

  const doc = toPlainObject(achievement);

  if (!doc.image) {
    return doc;
  }

  const signedImage = await getFileUrl(doc.image);

  return {
    ...doc,
    image: signedImage,
  };
};

class AchievementService {
  async createAchievement(data, file) {
    const { fields, imageKey } = stripUploadFields(data);

    const { error, value } = createAchievementValidator.validate(
      normalizeAchievementFields(fields),
      {
      abortEarly: false,
      }
    );

    if (error) {
      const err = new Error(error.details.map((d) => d.message).join(", "));
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    const payload = { ...value };

    if (imageKey) {
      payload.image = imageKey;
    } else if (file) {
      const uploaded = await uploadFileToS3(file);
      payload.image = uploaded.key;
    }

    const created = await AchievementRepository.create(payload);
    return attachSignedImage(created);
  }

  async getAllAchievements(query = {}) {
    const { error, value } = getAchievementsQueryValidator.validate(query, {
      abortEarly: false,
    });

    if (error) {
      const err = new Error(error.details.map((d) => d.message).join(", "));
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    const { visibilityStatus, page, limit } = value;
    const filter = {};

    if (visibilityStatus) {
      filter.visibilityStatus = visibilityStatus;
    }

    const all = await AchievementRepository.findAll(filter);
    const total = all.length;
    const start = (page - 1) * limit;
    const paginated = all.slice(start, start + limit);

    const data = await Promise.all(paginated.map((item) => attachSignedImage(item)));

    return {
      achievements: data,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getAchievementById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid achievement ID");
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    const achievement = await AchievementRepository.findById(id);

    if (!achievement) {
      const err = new Error("Achievement not found");
      err.statusCode = httpStatus.NOT_FOUND;
      throw err;
    }

    return attachSignedImage(achievement);
  }

  async updateAchievement(id, data, file) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid achievement ID");
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    const existing = await AchievementRepository.findById(id);

    if (!existing) {
      const err = new Error("Achievement not found");
      err.statusCode = httpStatus.NOT_FOUND;
      throw err;
    }

    const { fields, imageKey: uploadedImageKey } = stripUploadFields(data);

    const { error, value } = updateAchievementValidator.validate(
      normalizeAchievementFields(fields),
      {
      abortEarly: false,
      }
    );

    if (error) {
      const err = new Error(error.details.map((d) => d.message).join(", "));
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    const payload = { ...value };
    let imageKey = existing.image;

    if (uploadedImageKey) {
      imageKey = uploadedImageKey;
    } else if (file) {
      const uploaded = await uploadFileToS3(file);
      imageKey = uploaded.key;
    }

    if (imageKey) {
      payload.image = imageKey;
    }

    const updated = await AchievementRepository.updateById(id, payload);
    return attachSignedImage(updated);
  }

  async deleteAchievement(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid achievement ID");
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    const deleted = await AchievementRepository.deleteById(id);

    if (!deleted) {
      const err = new Error("Achievement not found");
      err.statusCode = httpStatus.NOT_FOUND;
      throw err;
    }

    return deleted;
  }
}

export default new AchievementService();
