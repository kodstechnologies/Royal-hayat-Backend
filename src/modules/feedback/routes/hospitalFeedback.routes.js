// routes/hospitalFeedback.routes.js

import express from "express";

const router = express.Router();

import {
    createHospitalFeedback,
    getAllHospitalFeedbacks,
    getEnglishHospitalFeedbacks,
    getArabicHospitalFeedbacks,
    deleteHospitalFeedback
} from "../controller/hospitalFeedback.controller.js";

router.post("/create", createHospitalFeedback);

router.get("/all", getAllHospitalFeedbacks);

router.get("/english", getEnglishHospitalFeedbacks);

router.get("/arabic", getArabicHospitalFeedbacks);

router.delete("/delete/:id", deleteHospitalFeedback);

export default router;