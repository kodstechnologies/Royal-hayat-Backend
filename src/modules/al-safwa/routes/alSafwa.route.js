import { Router } from "express";
import {
  createAlSafwaEnrollment,
  getAllAlSafwaEnrollments,
  getAlSafwaEnrollmentById,
} from "../controller/alSafwa.controller.js";
import { verifyJWT } from "../../../middlewares/authMiddleware.js";
import checkPermission from "../../../middlewares/checkPermission.js";
import { PERMISSIONS } from "../../../constants/permission.js";

const router = Router();

router.post("/", createAlSafwaEnrollment);

router.get(
  "/",
  verifyJWT,
  checkPermission(PERMISSIONS.AL_SAFWA_VIEW),
  getAllAlSafwaEnrollments
);

router.get(
  "/:id",
  verifyJWT,
  checkPermission(PERMISSIONS.AL_SAFWA_VIEW),
  getAlSafwaEnrollmentById
);

export default router;
