
import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError.js";
import { resolveDoctorByMongoId } from "../utils/resolveDoctor.js";
import {
    createDoctorFeedbackRepo,
    getAllDoctorFeedbacksRepo,
    getDoctorFeedbacksByDoctorIdRepo,
    getDoctorFeedbackByIdRepo,
    updateDoctorFeedbackRepo,
    deleteDoctorFeedbackRepo,
    getFeedbackCountsRepo,
    markDoctorFeedbackViewedRepo,
} from "../repository/doctorFeedback.repository.js";

const resolveDoctorObjectId = async (doctorMongoId) => {
    const doctor = await resolveDoctorByMongoId(doctorMongoId);
    return doctor._id;
};

const resolveFeedbackId = (feedbackId) => {
    if (!feedbackId || typeof feedbackId !== "string") {
        throw new ApiError(httpStatus.BAD_REQUEST, "feedbackId is required");
    }
    return feedbackId.trim();
};

export const createDoctorFeedbackService = async (body) => {
    const doctorMongoId = body.doctor ?? body.doctorId;
    const doctorObjectId = await resolveDoctorObjectId(doctorMongoId);

    const { doctorId, doctor, ...rest } = body;

    return await createDoctorFeedbackRepo({
        ...rest,
        doctor: doctorObjectId,
    });
};

export const getAllDoctorFeedbacksService = async () => {
    return await getAllDoctorFeedbacksRepo();
};

export const getDoctorFeedbacksByDoctorIdService = async (doctorMongoId) => {
    const doctorObjectId = await resolveDoctorObjectId(doctorMongoId);
    return await getDoctorFeedbacksByDoctorIdRepo(doctorObjectId);
};

export const updateDoctorFeedbackService = async (doctorMongoId, feedbackId, body) => {
    const resolvedFeedbackId = resolveFeedbackId(feedbackId);
    await resolveDoctorObjectId(doctorMongoId);

    const payload = { ...body };

    if (payload.doctorId !== undefined || payload.doctor !== undefined) {
        const nextDoctorMongoId = payload.doctor ?? payload.doctorId;
        payload.doctor = await resolveDoctorObjectId(nextDoctorMongoId);
        delete payload.doctorId;
    }

    const feedback = await updateDoctorFeedbackRepo(resolvedFeedbackId, payload);

    if (!feedback) {
        throw new ApiError(httpStatus.NOT_FOUND, "Doctor feedback not found");
    }

    return feedback;
};

export const deleteDoctorFeedbackService = async (doctorMongoId, feedbackId) => {
    const resolvedFeedbackId = resolveFeedbackId(feedbackId);
    await resolveDoctorObjectId(doctorMongoId);

    const feedback = await getDoctorFeedbackByIdRepo(resolvedFeedbackId);

    if (!feedback) {
        throw new ApiError(httpStatus.NOT_FOUND, "Doctor feedback not found");
    }

    await deleteDoctorFeedbackRepo(resolvedFeedbackId);
};
export const getFeedbackCounts = async () => {

    return await getFeedbackCountsRepo();

};

export const markDoctorFeedbackViewedService = async (feedbackId) => {
    const resolvedFeedbackId = resolveFeedbackId(feedbackId);

    const feedback = await markDoctorFeedbackViewedRepo(resolvedFeedbackId);

    if (!feedback) {
        throw new ApiError(httpStatus.NOT_FOUND, "Doctor feedback not found");
    }

    return feedback;
};