
import express from "express";

const router = express.Router();

import {
    createDoctorFeedback,
    createDoctorFeedbackByName,
    getAllDoctorFeedbacks,
    getDoctorFeedbackById,
    getDoctorFeedbackByName,
    updateDoctorFeedback,
    deleteDoctorFeedback,
    getFeedbackCountsForAll,
    markDoctorFeedbackViewed,
} from "../controller/doctorFeedback.controller.js";

router.post("/create", createDoctorFeedback);
router.post("/create/by-name", createDoctorFeedbackByName);
router.post("/create/by-id", createDoctorFeedback); // Alias for doctor ID-based creation

router.get("/all", getAllDoctorFeedbacks);

router.get("/counts", getFeedbackCountsForAll);

router.get("/by-name", getDoctorFeedbackByName);
router.get("/by-id/:doctorId", getDoctorFeedbackById); // New route for fetching by doctor ID

router.patch("/view/:feedbackId", markDoctorFeedbackViewed);

/** :doctorId = Doctor document MongoDB _id */
router.get("/:doctorId", getDoctorFeedbackById);

router.put("/update/:doctorId", updateDoctorFeedback);

router.delete("/delete/:doctorId", deleteDoctorFeedback);

export default router;
