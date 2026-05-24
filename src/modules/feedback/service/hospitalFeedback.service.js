// services/hospitalFeedback.service.js

import {
    createHospitalFeedbackRepo,
    getAllHospitalFeedbacksRepo,
    getEnglishHospitalFeedbacksRepo,
    getArabicHospitalFeedbacksRepo,
    deleteHospitalFeedbackRepo,
    updateArabicHospitalFeedbackRepo
} from "../repository/hospitalFeedback.repository.js";

export const createHospitalFeedbackService = async (body) => {
    return await createHospitalFeedbackRepo(body);
};

export const getAllHospitalFeedbacksService = async () => {
    return await getAllHospitalFeedbacksRepo();
};

export const getEnglishHospitalFeedbacksService = async () => {
    return await getEnglishHospitalFeedbacksRepo();
};

export const getArabicHospitalFeedbacksService = async () => {
    return await getArabicHospitalFeedbacksRepo();
};

export const deleteHospitalFeedbackService = async (id) => {
    return await deleteHospitalFeedbackRepo(id);
};

// UPDATE ENGLISH
export const updateEnglishHospitalFeedbackService =
    async (id, body) => {

        return await updateEnglishHospitalFeedbackRepo(
            id,
            body
        );
    };

// UPDATE ARABIC
export const updateArabicHospitalFeedbackService =
    async (id, body) => {

        return await updateArabicHospitalFeedbackRepo(
            id,
            body
        );
    };