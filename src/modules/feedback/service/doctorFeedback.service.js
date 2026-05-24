// services/doctorFeedback.service.js

import {
    createDoctorFeedbackRepo,
    getAllDoctorFeedbacksRepo,
    getEnglishDoctorFeedbacksRepo,
    getArabicDoctorFeedbacksRepo,
    deleteDoctorFeedbackRepo,
    updateArabicDoctorFeedbackRepo,
    updateEnglishDoctorFeedbackRepo
} from "../repository/doctorFeedback.repository.js";

export const createDoctorFeedbackService = async (body) => {
    return await createDoctorFeedbackRepo(body);
};

export const getAllDoctorFeedbacksService = async () => {
    return await getAllDoctorFeedbacksRepo();
};

export const getEnglishDoctorFeedbacksService = async () => {
    return await getEnglishDoctorFeedbacksRepo();
};

export const getArabicDoctorFeedbacksService = async () => {
    return await getArabicDoctorFeedbacksRepo();
};

export const deleteDoctorFeedbackService = async (id) => {
    return await deleteDoctorFeedbackRepo(id);
};


// UPDATE ENGLISH
export const updateEnglishDoctorFeedbackService =
    async (id, body) => {

        return await updateEnglishDoctorFeedbackRepo(
            id,
            body
        );
    };

// UPDATE ARABIC
export const updateArabicDoctorFeedbackService =
    async (id, body) => {

        return await updateArabicDoctorFeedbackRepo(
            id,
            body
        );
    };
