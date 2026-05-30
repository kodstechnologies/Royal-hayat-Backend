import { Router } from "express";
import {
  getDashboardStats,
  getCurrentWeekAppointmentRequests,
  getMonthlyAppointmentRequests,
  getFeedbackStarStats,
  getDoctorsCountByDepartment,
  getSidebarCounts,
} from "../controller/dashboard.controller.js";

const router = Router();

router.get("/stats", getDashboardStats);
router.get(
  "/current-week-appointment-requests",
  getCurrentWeekAppointmentRequests
);
router.get(
  "/monthly-appointment-requests",
  getMonthlyAppointmentRequests
);
router.get("/feedback-star-stats", getFeedbackStarStats);
router.get("/doctors-by-department", getDoctorsCountByDepartment);
router.get("/sidebar-counts", getSidebarCounts);

export default router;
