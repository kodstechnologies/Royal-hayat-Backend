// routes/doctorFeedback.routes.js

import express from "express";

const router = express.Router();

import {
    createDoctorFeedback,
    getAllDoctorFeedbacks,
    getEnglishDoctorFeedbacks,
    getArabicDoctorFeedbacks,
    deleteDoctorFeedback,
    updateEnglishDoctorFeedback,
    updateArabicDoctorFeedback
} from "../controller/doctorFeedback.controller";

router.post("/create", createDoctorFeedback);

router.get("/all", getAllDoctorFeedbacks);

router.get("/english", getEnglishDoctorFeedbacks);

router.get("/arabic", getArabicDoctorFeedbacks);

router.delete("/delete/:id", deleteDoctorFeedback);


// UPDATE ENGLISH
router.put(
    "/update-english/:id",
    updateEnglishDoctorFeedback
);

// UPDATE ARABIC
router.put(
    "/update-arabic/:id",
    updateArabicDoctorFeedback
);
export default router;