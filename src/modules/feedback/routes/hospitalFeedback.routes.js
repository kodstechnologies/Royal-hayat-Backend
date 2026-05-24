// routes/hospitalFeedback.routes.js

import express from "express";

const router = express.Router();

import {
    createHospitalFeedback,
    getAllHospitalFeedbacks,
    getHospitalFeedbackById,
    updateHospitalFeedback,
    deleteHospitalFeedback
} from "../controller/hospitalFeedback.controller.js";


// CREATE
router.post(
    "/create",
    createHospitalFeedback
);

// GET ALL
router.get(
    "/all",
    getAllHospitalFeedbacks
);

// GET BY ID
router.get(
    "/:id",
    getHospitalFeedbackById
);

// UPDATE
router.put(
    "/update/:id",
    updateHospitalFeedback
);

// DELETE
router.delete(
    "/delete/:id",
    deleteHospitalFeedback
);

export default router;