// routes/medicalRecordRequest.routes.js

import express from "express";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

import {
    createMedicalRecordRequest,
    getAllMedicalRecordRequests,
    getMedicalRecordRequestById,
    deleteMedicalRecordRequest
} from "../controller/medicalRecordRequest.controller.js";


router.post(
    "/create",
    upload.single("passportOrGovernmentId"),
    createMedicalRecordRequest
);

router.get(
    "/all",
    getAllMedicalRecordRequests
);

router.get(
    "/:id",
    getMedicalRecordRequestById
);

router.delete(
    "/delete/:id",
    deleteMedicalRecordRequest
);

export default router;