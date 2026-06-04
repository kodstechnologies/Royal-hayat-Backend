import express from "express";
import multer from "multer";
import {
  createMedicalRecordRequest,
  getAllMedicalRecordRequests,
  getMedicalRecordRequestById,
  deleteMedicalRecordRequest,
  shareMedicalRecordRequestViaEmail,
} from "../controller/medicalRecordRequest.controller.js";
import { verifyJWT } from "../../../middlewares/authMiddleware.js";
import checkPermission from "../../../middlewares/checkPermission.js";
import { PERMISSIONS } from "../../../constants/permission.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const mrrViewPermissions = [PERMISSIONS.MRR_VIEW];

const createUpload = upload.fields([
  { name: "civilIdAttachment", maxCount: 1 },
  { name: "passportOrGovernmentIdAttachment", maxCount: 1 },
  { name: "validProof", maxCount: 1 },
]);

/**
 * Public create — multipart/form-data.
 * specificAuthorization: "Discharge Summary" | "specific documents"
 * - Discharge Summary: requires specificFromDate, specificToDate; optional specialRequest
 * - specific documents: also requires specificDocumentTypes (+ specificDocumentsOther if Others)
 */
router.post("/create", createUpload, createMedicalRecordRequest);

router.get(
  "/all",
  verifyJWT,
  checkPermission(mrrViewPermissions),
  getAllMedicalRecordRequests,
);

router.get(
  "/:id",
  verifyJWT,
  checkPermission(mrrViewPermissions),
  getMedicalRecordRequestById,
);

router.delete(
  "/delete/:id",
  verifyJWT,
  checkPermission([PERMISSIONS.MRR_DELETE, PERMISSIONS.MRR_VIEW]),
  deleteMedicalRecordRequest,
);

router.post(
  "/share-via-email/:id",
  verifyJWT,
  checkPermission([PERMISSIONS.MRR_SHARE_VIA_EMAIL, PERMISSIONS.MRR_VIEW]),
  shareMedicalRecordRequestViaEmail,
);

export default router;