// services/hospitalFeedback.service.js

import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError.js";
import {
    createHospitalFeedbackRepo,
    getAllHospitalFeedbacksRepo,
    getHospitalFeedbackByIdRepo,
    updateHospitalFeedbackRepo,
    deleteHospitalFeedbackRepo,
    markHospitalFeedbackViewedRepo,
} from "../repository/hospitalFeedback.repository.js";

export const createHospitalFeedbackService =
    async (body) => {

        return await createHospitalFeedbackRepo(body);
    };

export const getAllHospitalFeedbacksService =
    async () => {

        return await getAllHospitalFeedbacksRepo();
    };

export const getHospitalFeedbackByIdService =
    async (id) => {

        return await getHospitalFeedbackByIdRepo(id);
    };

export const updateHospitalFeedbackService =
    async (id, body) => {

        return await updateHospitalFeedbackRepo(
            id,
            body
        );
    };

export const deleteHospitalFeedbackService =
    async (id) => {

        return await deleteHospitalFeedbackRepo(id);
    };

export const markHospitalFeedbackViewedService = async (id) => {
    const feedback = await markHospitalFeedbackViewedRepo(id);

    if (!feedback) {
        throw new ApiError(httpStatus.NOT_FOUND, "Hospital feedback not found");
    }

    return feedback;
};