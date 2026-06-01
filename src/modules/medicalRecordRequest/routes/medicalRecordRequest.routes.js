
import express from "express";
import multer from "multer";
import {
    createMedicalRecordRequest,
    getAllMedicalRecordRequests,
    getMedicalRecordRequestById,
    deleteMedicalRecordRequest,
    shareMedicalRecordRequestViaEmail
} from "../controller/medicalRecordRequest.controller.js";
import { verifyJWT } from "../../../middlewares/authMiddleware.js";
import checkPermission from "../../../middlewares/checkPermission.js";
import { PERMISSIONS } from "../../../constants/permission.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const mrrViewPermissions = [PERMISSIONS.MRR_VIEW];

router.post(
    "/create",
    upload.single("passportOrGovernmentId"),
    createMedicalRecordRequest
);

router.get(
    "/all",
    verifyJWT,
    checkPermission(mrrViewPermissions),
    getAllMedicalRecordRequests
);

router.get(
    "/:id",
    verifyJWT,
    checkPermission(mrrViewPermissions),
    getMedicalRecordRequestById
);

router.delete(
    "/delete/:id",
    verifyJWT,
    checkPermission([PERMISSIONS.MRR_DELETE, PERMISSIONS.MRR_VIEW]),
    deleteMedicalRecordRequest
);

router.post(
    "/share-via-email/:id",
    verifyJWT,
    checkPermission([PERMISSIONS.MRR_SHARE_VIA_EMAIL, PERMISSIONS.MRR_VIEW]),
    shareMedicalRecordRequestViaEmail
);

export default router;
