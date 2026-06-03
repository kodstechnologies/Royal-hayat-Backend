
import asyncHandler from "../../../utils/asyncHandler.js";
import httpStatus from "http-status";

import FeaturedDoctorsService from "../services/FeaturedDoctor.service.js";

export const createFeaturedDoctor = asyncHandler(
  async (req, res) => {
    const featuredDoctor =
      await FeaturedDoctorsService.createFeaturedDoctor(
        req.body
      );

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Featured doctor added successfully",
      data: featuredDoctor,
    });
  }
);

export const getFeaturedDoctors = asyncHandler(
  async (req, res) => {
    const featuredDoctors =
      await FeaturedDoctorsService.getFeaturedDoctors();

    res.status(httpStatus.OK).json({
      success: true,
      count: featuredDoctors.length,
      data: featuredDoctors,
    });
  }
);

export const updateFeaturedDoctor = asyncHandler(
  async (req, res) => {
    const updatedFeaturedDoctor =
      await FeaturedDoctorsService.updateFeaturedDoctor(
        req.params.id,
        req.body
      );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Featured doctor updated successfully",
      data: updatedFeaturedDoctor,
    });
  }
);

export const deleteFeaturedDoctor = asyncHandler(
  async (req, res) => {
    await FeaturedDoctorsService.deleteFeaturedDoctor(req.params.id);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Featured doctor removed successfully",
      data: null,
    });
  }
);