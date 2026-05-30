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
} from "../controller/doctorFeedback.controller.js";

// CREATE (body.doctorId)
router.post("/create", createDoctorFeedback);

// GET ALL
router.get("/all", getAllDoctorFeedbacks);

router.get("/counts", getFeedbackCountsForAll);

// GET BY doctorId (business id)
router.get("/:doctorId", getDoctorFeedbackById);

// UPDATE (path: doctorId, body/query: feedbackId)
router.put("/update/:doctorId", updateDoctorFeedback);

// DELETE (path: doctorId, body/query: feedbackId)
router.delete("/delete/:doctorId", deleteDoctorFeedback);

export default router;
