// routes/doctorFeedback.routes.js

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

// CREATE (body.doctorId)
router.post("/create", createDoctorFeedback);

// GET ALL
router.get("/all", getAllDoctorFeedbacks);

router.get("/counts", getFeedbackCountsForAll);

router.patch("/view/:feedbackId", markDoctorFeedbackViewed);

// GET BY doctorId (business id)
router.get("/:doctorId", getDoctorFeedbackById);

// UPDATE (path: doctorId, body/query: feedbackId)
router.put("/update/:doctorId", updateDoctorFeedback);

// DELETE (path: doctorId, body/query: feedbackId)
router.delete("/delete/:doctorId", deleteDoctorFeedback);

export default router;
