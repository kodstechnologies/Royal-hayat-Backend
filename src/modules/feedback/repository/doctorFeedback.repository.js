// repositories/doctorFeedback.repository.js

import DoctorFeedback from "../model/DoctorFeedback.model.js";

export const createDoctorFeedbackRepo =
    async (payload) => {

        return await DoctorFeedback.create(payload);
    };

export const getAllDoctorFeedbacksRepo =
    async () => {

        return await DoctorFeedback.find()
            .populate({
                path: "doctor",
                populate: {
                    path: "department"
                }
            })
            .sort({ createdAt: -1 });
    };

export const getDoctorFeedbackByIdRepo =
    async (id) => {

        return await DoctorFeedback.findById(id)
            .populate({
                path: "doctor",
                populate: {
                    path: "department"
                }
            });
    };

export const updateDoctorFeedbackRepo =
    async (id, payload) => {

        return await DoctorFeedback.findByIdAndUpdate(
            id,
            payload,
            {
                new: true,
                runValidators: true
            }
        )
            .populate({
                path: "doctor",
                populate: {
                    path: "department"
                }
            });
    };

export const deleteDoctorFeedbackRepo =
    async (id) => {

        return await DoctorFeedback.findByIdAndDelete(id);
    };