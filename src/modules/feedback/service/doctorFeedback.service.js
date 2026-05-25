// services/doctorFeedback.service.js

import {
    createDoctorFeedbackRepo,
    getAllDoctorFeedbacksRepo,
    getDoctorFeedbackByIdRepo,
    updateDoctorFeedbackRepo,
    deleteDoctorFeedbackRepo
} from "../repository/doctorFeedback.repository.js";

export const createDoctorFeedbackService =
    async (body) => {

        return await createDoctorFeedbackRepo(body);
    };

export const getAllDoctorFeedbacksService =
    async () => {

        return await getAllDoctorFeedbacksRepo();
    };

export const getDoctorFeedbackByIdService =
    async (id) => {

        return await getDoctorFeedbackByIdRepo(id);
    };

export const updateDoctorFeedbackService =
    async (id, body) => {

        return await updateDoctorFeedbackRepo(
            id,
            body
        );
    };

export const deleteDoctorFeedbackService =
    async (id) => {

        return await deleteDoctorFeedbackRepo(id);
    };