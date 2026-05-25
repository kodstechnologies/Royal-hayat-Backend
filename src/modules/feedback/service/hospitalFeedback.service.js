// services/hospitalFeedback.service.js

import {
    createHospitalFeedbackRepo,
    getAllHospitalFeedbacksRepo,
    getHospitalFeedbackByIdRepo,
    updateHospitalFeedbackRepo,
    deleteHospitalFeedbackRepo
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