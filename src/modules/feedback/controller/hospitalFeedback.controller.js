
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

export const createHospitalFeedback =
    async (req, res) => {

        try {

            const {
                addedBy
            } = req.query;

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
                shownOnWebsite:
                    typeof req.body.shownOnWebsite === "boolean"
                        ? req.body.shownOnWebsite
                        : false,
                addedBy: addedBy || "patient",
                userName: req.body.userName,
                feedback: req.body.feedback,
                arabicUserName: req.body.arabicUserName,
                arabicFeedback: req.body.arabicFeedback,
            };

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

export const updateHospitalFeedback =
    async (req, res) => {

        try {

            const payload = {
                stars: req.body.stars,
                shownOnWebsite: req.body.shownOnWebsite,
                userName: req.body.userName,
                feedback: req.body.feedback,
                arabicUserName: req.body.arabicUserName,
                arabicFeedback: req.body.arabicFeedback,
            };

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