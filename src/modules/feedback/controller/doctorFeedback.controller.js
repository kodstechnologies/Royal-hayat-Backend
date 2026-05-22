// controllers/doctorFeedback.controller.js

import {
    createDoctorFeedbackService,
    getAllDoctorFeedbacksService,
    getEnglishDoctorFeedbacksService,
    getArabicDoctorFeedbacksService,
    deleteDoctorFeedbackService
} from "../service/doctorFeedback.service.js";

export const createDoctorFeedback = async (req, res) => {

    try {

        const feedback =
            await createDoctorFeedbackService(req.body);

        return res.status(201).json({
            success: true,
            message: "Doctor feedback created successfully",
            data: feedback
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllDoctorFeedbacks = async (req, res) => {

    try {

        const feedbacks =
            await getAllDoctorFeedbacksService();

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

export const getEnglishDoctorFeedbacks = async (req, res) => {

    try {

        const feedbacks =
            await getEnglishDoctorFeedbacksService();

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

export const getArabicDoctorFeedbacks = async (req, res) => {

    try {

        const feedbacks =
            await getArabicDoctorFeedbacksService();

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

export const deleteDoctorFeedback = async (req, res) => {

    try {

        await deleteDoctorFeedbackService(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Doctor feedback deleted successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};