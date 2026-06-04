
import express from "express";

const router = express.Router();

import {
    createDoctorFeedback,
    getAllDoctorFeedbacks,
    getDoctorFeedbackById,
    updateDoctorFeedback,
    deleteDoctorFeedback,
    getFeedbackCountsForAll,
    markDoctorFeedbackViewed,
} from "../controller/doctorFeedback.controller.js";

router.post("/create", createDoctorFeedback);

router.get("/all", getAllDoctorFeedbacks);

router.get("/counts", getFeedbackCountsForAll);

router.patch("/view/:feedbackId", markDoctorFeedbackViewed);

/** :doctorId = Doctor document MongoDB _id */
router.get("/:doctorId", getDoctorFeedbackById);

router.put("/update/:doctorId", updateDoctorFeedback);

router.delete("/delete/:doctorId", deleteDoctorFeedback);

export default router;
