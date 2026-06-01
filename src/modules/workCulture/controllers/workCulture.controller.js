
import asyncHandler from '../../../utils/asyncHandler.js';
import httpStatus from "http-status";

import WorkCultureService from "../services/workCulture.service.js";

export const createWorkCulture = asyncHandler(
  async (req, res) => {
    const workCulture =
      await WorkCultureService.createWorkCulture(
        req.body,
        req.files
      );

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Work culture created successfully",
      data: workCulture,
    });
  }
);

export const getAllWorkCultures = asyncHandler(
  async (req, res) => {
    const workCultures =
      await WorkCultureService.getAllWorkCultures();

    res.status(httpStatus.OK).json({
      success: true,
      count: workCultures.length,
      data: workCultures,
    });
  }
);

export const getWorkCultureById = asyncHandler(
  async (req, res) => {
    const workCulture =
      await WorkCultureService.getWorkCultureById(
        req.params.id
      );

    res.status(httpStatus.OK).json({
      success: true,
      data: workCulture,
    });
  }
);

export const updateWorkCulture = asyncHandler(
  async (req, res) => {
    const updatedWorkCulture =
      await WorkCultureService.updateWorkCulture(
        req.params.id,
        req.body,
        req.files
      );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Work culture updated successfully",
      data: updatedWorkCulture,
    });
  }
);

export const deleteWorkCulture = asyncHandler(
  async (req, res) => {
    await WorkCultureService.deleteWorkCulture(
      req.params.id
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Work culture deleted successfully",
    });
  }
);