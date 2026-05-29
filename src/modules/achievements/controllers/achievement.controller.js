import asyncHandler from "../../../utils/asyncHandler.js";
import httpStatus from "http-status";
import AchievementService from "../services/achievement.services.js";

export const createAchievement = asyncHandler(async (req, res) => {
  const achievement = await AchievementService.createAchievement(
    req.body || {},
    req.file
  );

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Achievement created successfully",
    data: achievement,
  });
});

export const getAllAchievements = asyncHandler(async (req, res) => {
  const result = await AchievementService.getAllAchievements(req.query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Achievements fetched successfully",
    data: result.achievements,
    meta: result.meta,
  });
});

export const getAchievementById = asyncHandler(async (req, res) => {
  const achievement = await AchievementService.getAchievementById(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Achievement fetched successfully",
    data: achievement,
  });
});

export const updateAchievement = asyncHandler(async (req, res) => {
  const achievement = await AchievementService.updateAchievement(
    req.params.id,
    req.body || {},
    req.file
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Achievement updated successfully",
    data: achievement,
  });
});

export const deleteAchievement = asyncHandler(async (req, res) => {
  await AchievementService.deleteAchievement(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Achievement deleted successfully",
    data: null,
  });
});
