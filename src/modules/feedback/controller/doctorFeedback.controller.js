
import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError.js";
import {
    createDoctorFeedbackService,
    getAllDoctorFeedbacksService,
    getDoctorFeedbacksByDoctorIdService,
    updateDoctorFeedbackService,
    deleteDoctorFeedbackService,
    getFeedbackCounts,
    markDoctorFeedbackViewedService,
} from "../service/doctorFeedback.service.js";
import asyncHandler from "../../../utils/asyncHandler.js";

const handleError = (res, error) => {
    const statusCode =
        error instanceof ApiError ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR;

    return res.status(statusCode).json({
        success: false,
        message: error.message,
    });
};

export const createDoctorFeedback = async (req, res) => {
    try {
        const { addedBy } = req.query;
        const doctorRef = req.body.doctorId ?? req.body.doctor;

        if (!doctorRef) {
            throw new ApiError(httpStatus.BAD_REQUEST, "doctorId is required");
        }

        const payload = {
            doctorId: doctorRef,
            stars: req.body.stars,
            shownOnWebsite:
                typeof req.body.shownOnWebsite === "boolean"
                    ? req.body.shownOnWebsite
                    : true,
            addedBy: addedBy || "patient",
            userName: req.body.userName,
            feedback: req.body.feedback,
            arabicUserName: req.body.arabicUserName,
            arabicFeedback: req.body.arabicFeedback,
        };

        Object.keys(payload).forEach(
            (key) => payload[key] === undefined && delete payload[key]
        );

        const feedback = await createDoctorFeedbackService(payload);

        return res.status(201).json({
            success: true,
            message: "Doctor feedback created successfully",
            data: feedback,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const getAllDoctorFeedbacks = async (req, res) => {
    try {
        const feedbacks = await getAllDoctorFeedbacksService();

        return res.status(200).json({
            success: true,
            data: feedbacks,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const getDoctorFeedbackById = async (req, res) => {
    try {
        const feedbacks = await getDoctorFeedbacksByDoctorIdService(
            req.params.doctorId
        );

        return res.status(200).json({
            success: true,
            data: feedbacks,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const updateDoctorFeedback = async (req, res) => {
    try {
        const feedbackId = req.body.feedbackId ?? req.query.feedbackId;

        const payload = {
            stars: req.body.stars,
            shownOnWebsite: req.body.shownOnWebsite,
            userName: req.body.userName,
            feedback: req.body.feedback,
            arabicUserName: req.body.arabicUserName,
            arabicFeedback: req.body.arabicFeedback,
        };

        const doctorRef = req.body.doctorId ?? req.body.doctor;
        if (doctorRef !== undefined) {
            payload.doctorId = doctorRef;
        }

        Object.keys(payload).forEach(
            (key) => payload[key] === undefined && delete payload[key]
        );

        const feedback = await updateDoctorFeedbackService(
            req.params.doctorId,
            feedbackId,
            payload
        );

        return res.status(200).json({
            success: true,
            message: "Doctor feedback updated successfully",
            data: feedback,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const deleteDoctorFeedback = async (req, res) => {
    try {
        const feedbackId = req.body.feedbackId ?? req.query.feedbackId;

        await deleteDoctorFeedbackService(req.params.doctorId, feedbackId);

        return res.status(200).json({
            success: true,
            message: "Doctor feedback deleted successfully",
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const getFeedbackCountsForAll = asyncHandler(async (req, res) => {

    const counts = await getFeedbackCounts();

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Feedback counts fetched successfully',
        data: counts,
    });

});

export const markDoctorFeedbackViewed = asyncHandler(async (req, res) => {
    const feedback = await markDoctorFeedbackViewedService(req.params.feedbackId);

    res.status(httpStatus.OK).json({
        success: true,
        message: "Doctor feedback marked as viewed",
        data: feedback,
    });
});