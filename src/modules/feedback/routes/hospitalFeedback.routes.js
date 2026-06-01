
import express from "express";

const router = express.Router();

import {
    createHospitalFeedback,
    getAllHospitalFeedbacks,
    getHospitalFeedbackById,
    updateHospitalFeedback,
    deleteHospitalFeedback,
    markHospitalFeedbackViewed,
} from "../controller/hospitalFeedback.controller.js";

router.post(
    "/create",
    createHospitalFeedback
);

router.get(
    "/all",
    getAllHospitalFeedbacks
);

router.patch(
    "/view/:id",
    markHospitalFeedbackViewed
);

router.get(
    "/:id",
    getHospitalFeedbackById
);

router.put(
    "/update/:id",
    updateHospitalFeedback
);

router.delete(
    "/delete/:id",
    deleteHospitalFeedback
);

export default router;