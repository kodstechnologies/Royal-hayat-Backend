// services/doctorFeedback.service.js

import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError.js";
import { resolveDoctorByDoctorId } from "../utils/resolveDoctor.js";
import {
    createDoctorFeedbackRepo,
    getAllDoctorFeedbacksRepo,
    getDoctorFeedbacksByDoctorIdRepo,
    getDoctorFeedbackByIdRepo,
    updateDoctorFeedbackRepo,
    deleteDoctorFeedbackRepo,
    getFeedbackCountsRepo,
} from "../repository/doctorFeedback.repository.js";

const resolveDoctorObjectId = async (doctorIdOrMongoId) => {
    const doctor = await resolveDoctorByDoctorId(doctorIdOrMongoId);
    return doctor._id;
};

const resolveFeedbackId = (feedbackId) => {
    if (!feedbackId || typeof feedbackId !== "string") {
        throw new ApiError(httpStatus.BAD_REQUEST, "feedbackId is required");
    }
    return feedbackId.trim();
};

export const createDoctorFeedbackService = async (body) => {
    const doctorRef = body.doctorId ?? body.doctor;
    const doctorObjectId = await resolveDoctorObjectId(doctorRef);

    const { doctorId, doctor, ...rest } = body;

    return await createDoctorFeedbackRepo({
        ...rest,
        doctor: doctorObjectId,
    });
};

export const getAllDoctorFeedbacksService = async () => {
    return await getAllDoctorFeedbacksRepo();
};

export const getDoctorFeedbacksByDoctorIdService = async (doctorId) => {
    const doctorObjectId = await resolveDoctorObjectId(doctorId);
    return await getDoctorFeedbacksByDoctorIdRepo(doctorObjectId);
};

export const updateDoctorFeedbackService = async (doctorId, feedbackId, body) => {
    const resolvedFeedbackId = resolveFeedbackId(feedbackId);
    await resolveDoctorObjectId(doctorId);

    const payload = { ...body };

    if (payload.doctorId !== undefined || payload.doctor !== undefined) {
        const doctorRef = payload.doctorId ?? payload.doctor;
        payload.doctor = await resolveDoctorObjectId(doctorRef);
        delete payload.doctorId;
    }

    const feedback = await updateDoctorFeedbackRepo(resolvedFeedbackId, payload);

    if (!feedback) {
        throw new ApiError(httpStatus.NOT_FOUND, "Doctor feedback not found");
    }

    return feedback;
};

export const deleteDoctorFeedbackService = async (doctorId, feedbackId) => {
    const resolvedFeedbackId = resolveFeedbackId(feedbackId);
    await resolveDoctorObjectId(doctorId);

    const feedback = await getDoctorFeedbackByIdRepo(resolvedFeedbackId);

    if (!feedback) {
        throw new ApiError(httpStatus.NOT_FOUND, "Doctor feedback not found");
    }

    await deleteDoctorFeedbackRepo(resolvedFeedbackId);
};
export const getFeedbackCounts = async () => {

    return await getFeedbackCountsRepo();

};