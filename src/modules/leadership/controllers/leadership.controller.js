// controllers/leadership.controller.js

import asyncHandler from '../../../utils/asyncHandler.js';
import httpStatus from "http-status";

import LeadershipService from "../services/leadership.services.js";

// Create
export const createLeadership = asyncHandler(
  async (req, res) => {
    const leadership =
      await LeadershipService.createLeadership(
        req.body,
        req.file
      );

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Leadership created successfully",
      data: leadership,
    });
  }
);

// Get All
export const getAllLeadership = asyncHandler(
  async (req, res) => {
    const leadership =
      await LeadershipService.getAllLeadership();

    res.status(httpStatus.OK).json({
      success: true,
      count: leadership.length,
      data: leadership,
    });
  }
);

// Get By ID
export const getLeadershipById = asyncHandler(
  async (req, res) => {
    const leadership =
      await LeadershipService.getLeadershipById(
        req.params.id
      );

    res.status(httpStatus.OK).json({
      success: true,
      data: leadership,
    });
  }
);

// Update
export const updateLeadership = asyncHandler(
  async (req, res) => {
    const updatedLeadership =
      await LeadershipService.updateLeadership(
        req.params.id,
        req.body,
        req.file
      );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Leadership updated successfully",
      data: updatedLeadership,
    });
  }
);

// Delete
export const deleteLeadership = asyncHandler(
  async (req, res) => {
    await LeadershipService.deleteLeadership(
      req.params.id
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Leadership deleted successfully",
    });
  }
);