import { Router } from "express";
import {
  createInternationalPatientEnquiry,
  getAllInternationalPatientEnquiries,
  getInternationalPatientEnquiryById,
} from "../controller/internationalPatientEnquiry.controller.js";
import { verifyJWT } from "../../../middlewares/authMiddleware.js";
import checkPermission from "../../../middlewares/checkPermission.js";
import { PERMISSIONS } from "../../../constants/permission.js";

const router = Router();

// Public — website enquiry form
router.post("/", createInternationalPatientEnquiry);

router.get(
  "/",
  verifyJWT,
  checkPermission(PERMISSIONS.INTERNATIONAL_PATIENT_VIEW),
  getAllInternationalPatientEnquiries
);

router.get(
  "/:id",
  verifyJWT,
  checkPermission(PERMISSIONS.INTERNATIONAL_PATIENT_VIEW),
  getInternationalPatientEnquiryById
);

export default router;
