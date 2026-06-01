import asyncHandler from "../../../utils/asyncHandler.js";
import httpStatus from "http-status";
import DashboardService from "../service/dashboard.service.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await DashboardService.getDashboardStats();

  res.status(httpStatus.OK).json({
    success: true,
    message: "Dashboard stats fetched successfully",
    data: stats,
  });
});

export const getCurrentWeekAppointmentRequests = asyncHandler(async (req, res) => {
  const weekData = await DashboardService.getCurrentWeekAppointmentRequests();

  res.status(httpStatus.OK).json({
    success: true,
    message: "Current week appointment requests fetched successfully",
    data: weekData,
  });
});

export const getMonthlyAppointmentRequests = asyncHandler(async (req, res) => {
  const monthData = await DashboardService.getMonthlyAppointmentRequests(
    req.query.months
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Monthly appointment requests fetched successfully",
    data: monthData,
  });
});

export const getFeedbackStarStats = asyncHandler(async (req, res) => {
  const starStats = await DashboardService.getFeedbackStarStats();

  res.status(httpStatus.OK).json({
    success: true,
    message: "Feedback star stats fetched successfully",
    data: starStats,
  });
});

export const getDoctorsCountByDepartment = asyncHandler(async (req, res) => {
  const departmentStats = await DashboardService.getDoctorsCountByDepartment();

  res.status(httpStatus.OK).json({
    success: true,
    message: "Doctors count by department fetched successfully",
    data: departmentStats,
  });
});

export const getSidebarCounts = asyncHandler(async (req, res) => {
  const counts = await DashboardService.getSidebarCounts();

  res.status(httpStatus.OK).json({
    success: true,
    message: "Sidebar unviewed counts fetched successfully",
    data: counts,
  });
});