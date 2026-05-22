// routes/doctorFeedback.routes.js

import express from "express";

const router = express.Router();

import {
    createDoctorFeedback,
    getAllDoctorFeedbacks,
    getEnglishDoctorFeedbacks,
    getArabicDoctorFeedbacks,
    deleteDoctorFeedback
} from "../controllers/doctorFeedback.controller.js";

router.post("/create", createDoctorFeedback);

router.get("/all", getAllDoctorFeedbacks);

router.get("/english", getEnglishDoctorFeedbacks);

router.get("/arabic", getArabicDoctorFeedbacks);

router.delete("/delete/:id", deleteDoctorFeedback);

export default router;