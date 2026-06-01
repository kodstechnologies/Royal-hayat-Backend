
import httpStatus from "http-status";
import asyncHandler from "../../../utils/asyncHandler.js";
import {
    createHospitalFeedbackService,
    getAllHospitalFeedbacksService,
    getHospitalFeedbackByIdService,
    updateHospitalFeedbackService,
    deleteHospitalFeedbackService,
    markHospitalFeedbackViewedService,
} from "../service/hospitalFeedback.service.js";

// CREATE
export const createHospitalFeedback =
    async (req, res) => {

        try {

            const {
                addedBy
            } = req.query;

            // VALIDATE addedBy
            const allowedAddedBy = [
                "patient",
                "admin"
            ];

            if (
                addedBy &&
                !allowedAddedBy.includes(addedBy)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid addedBy value"
                });
            }

            const payload = {
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
                await createHospitalFeedbackService(
                    payload
                );

            return res.status(201).json({
                success: true,
                message:
                    "Hospital feedback created successfully",
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
export const getAllHospitalFeedbacks =
    async (req, res) => {

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

// GET BY ID
export const getHospitalFeedbackById =
    async (req, res) => {

        try {

            const feedback =
                await getHospitalFeedbackByIdService(
                    req.params.id
                );

            if (!feedback) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Hospital feedback not found"
                });
            }

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
export const updateHospitalFeedback =
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
            };

            // Remove undefined keys so Mongoose doesn't overwrite with null
            Object.keys(payload).forEach(
                key => payload[key] === undefined && delete payload[key]
            );

            const feedback =
                await updateHospitalFeedbackService(
                    req.params.id,
                    payload
                );

            return res.status(200).json({
                success: true,
                message:
                    "Hospital feedback updated successfully",
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
export const deleteHospitalFeedback =
    async (req, res) => {

        try {

            await deleteHospitalFeedbackService(
                req.params.id
            );

            return res.status(200).json({
                success: true,
                message:
                    "Hospital feedback deleted successfully"
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

export const markHospitalFeedbackViewed = asyncHandler(async (req, res) => {
    const feedback = await markHospitalFeedbackViewedService(req.params.id);

    res.status(httpStatus.OK).json({
        success: true,
        message: "Hospital feedback marked as viewed",
        data: feedback,
    });
});