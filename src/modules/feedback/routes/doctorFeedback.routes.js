// routes/doctorFeedback.routes.js

import express from "express";

const router = express.Router();

import {
    createDoctorFeedback,
    getAllDoctorFeedbacks,
    getDoctorFeedbackById,
    updateDoctorFeedback,
    deleteDoctorFeedback
} from "../controller/doctorFeedback.controller.js";


// CREATE
router.post(
    "/create",
    createDoctorFeedback
);

// GET ALL
router.get(
    "/all",
    getAllDoctorFeedbacks
);

// GET BY ID
router.get(
    "/:id",
    getDoctorFeedbackById
);

// UPDATE
router.put(
    "/update/:id",
    updateDoctorFeedback
);

// DELETE
router.delete(
    "/delete/:id",
    deleteDoctorFeedback
);

export default router;