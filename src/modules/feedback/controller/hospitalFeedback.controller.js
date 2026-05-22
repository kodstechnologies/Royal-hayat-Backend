// controllers/hospitalFeedback.controller.js

import {
    createHospitalFeedbackService,
    getAllHospitalFeedbacksService,
    getEnglishHospitalFeedbacksService,
    getArabicHospitalFeedbacksService,
    deleteHospitalFeedbackService
} from "../service/hospitalFeedback.service.js";

export const createHospitalFeedback = async (req, res) => {

    try {

        const feedback =
            await createHospitalFeedbackService(req.body);

        return res.status(201).json({
            success: true,
            message: "Hospital feedback created successfully",
            data: feedback
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllHospitalFeedbacks = async (req, res) => {

    try {

        const feedbacks =
            await getAllHospitalFeedbacksService();

        return res.status(200).json({
            success: true,
            data: feedbacks
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getEnglishHospitalFeedbacks = async (req, res) => {

    try {

        const feedbacks =
            await getEnglishHospitalFeedbacksService();

        return res.status(200).json({
            success: true,
            data: feedbacks
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getArabicHospitalFeedbacks = async (req, res) => {

    try {

        const feedbacks =
            await getArabicHospitalFeedbacksService();

        return res.status(200).json({
            success: true,
            data: feedbacks
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteHospitalFeedback = async (req, res) => {

    try {

        await deleteHospitalFeedbackService(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Hospital feedback deleted successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};