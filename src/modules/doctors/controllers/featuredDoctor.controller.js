
import asyncHandler from '../../../utils/asyncHandler.js';
import httpStatus from 'http-status';

import FeaturedDoctorsService from '../services/FeaturedDoctor.service.js';

export const createFeaturedDoctor = asyncHandler(async (req, res) => {
  const featuredDoctors = await FeaturedDoctorsService.createFeaturedDoctor(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Featured doctor added successfully',
    data: featuredDoctors,
  });
});

export const getFeaturedDoctors = asyncHandler(async (req, res) => {
  const featuredDoctors = await FeaturedDoctorsService.getFeaturedDoctors();

  res.status(httpStatus.OK).json({
    success: true,
    count: featuredDoctors.length,
    data: featuredDoctors,
  });
});

export const syncFeaturedDoctors = asyncHandler(async (req, res) => {
  const doctorIds = Array.isArray(req.body?.doctorIds) ? req.body.doctorIds : [];
  const featuredDoctors = await FeaturedDoctorsService.syncFeaturedDoctors(doctorIds);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Featured doctors synced successfully',
    count: featuredDoctors.length,
    data: featuredDoctors,
  });
});

export const deleteFeaturedDoctor = asyncHandler(async (req, res) => {
  await FeaturedDoctorsService.deleteFeaturedDoctor(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Featured doctor removed successfully',
    data: null,
  });
});
