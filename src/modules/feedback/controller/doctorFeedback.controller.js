// controllers/doctorFeedback.controller.js

import {
    createDoctorFeedbackService,
    getAllDoctorFeedbacksService,
    getDoctorFeedbackByIdService,
    updateDoctorFeedbackService,
    deleteDoctorFeedbackService
} from "../service/doctorFeedback.service.js";


// CREATE
export const createDoctorFeedback =
    async (req, res) => {

        try {

            const {
                addedBy
            } = req.query;

            const payload = {
                doctor: req.body.doctor,
                stars: req.body.stars,
                shownOnWebsite: req.body.shownOnWebsite,
                addedBy: addedBy || "patient",
                // Accept both languages in a single create
                userName: req.body.userName,
                feedback: req.body.feedback,
                arabicUserName: req.body.arabicUserName,
                arabicFeedback: req.body.arabicFeedback,
            };

            // Remove undefined keys
            Object.keys(payload).forEach(
                key => payload[key] === undefined && delete payload[key]
            );

            const feedback =
                await createDoctorFeedbackService(
                    payload
                );

            return res.status(201).json({
                success: true,
                message:
                    "Doctor feedback created successfully",
                data: feedback
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };


// GET ALL
export const getAllDoctorFeedbacks =
    async (req, res) => {

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


// GET BY ID
export const getDoctorFeedbackById =
    async (req, res) => {

        try {

            const feedback =
                await getDoctorFeedbackByIdService(
                    req.params.id
                );

            return res.status(200).json({
                success: true,
                data: feedback
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };


// UPDATE
export const updateDoctorFeedback =
    async (req, res) => {

        try {

            const payload = {
                stars: req.body.stars,
                shownOnWebsite: req.body.shownOnWebsite,
                // Accept both languages in a single update
                userName: req.body.userName,
                feedback: req.body.feedback,
                arabicUserName: req.body.arabicUserName,
                arabicFeedback: req.body.arabicFeedback,
                doctor: req.body.doctor,
            };

            // Remove undefined keys so Mongoose doesn't overwrite with null
            Object.keys(payload).forEach(
                key => payload[key] === undefined && delete payload[key]
            );

            const feedback =
                await updateDoctorFeedbackService(
                    req.params.id,
                    payload
                );

            return res.status(200).json({
                success: true,
                message:
                    "Doctor feedback updated successfully",
                data: feedback
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };


// DELETE
export const deleteDoctorFeedback =
    async (req, res) => {

        try {

            await deleteDoctorFeedbackService(
                req.params.id
            );

            return res.status(200).json({
                success: true,
                message:
                    "Doctor feedback deleted successfully"
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };