// repositories/doctorFeedback.repository.js

import DoctorFeedback from "../model/DoctorFeedback.model.js";

const doctorPopulate = {
    path: "doctor",
    populate: {
        path: "department",
    },
};

export const createDoctorFeedbackRepo =
    async (payload) => {

        return await DoctorFeedback.create(payload);
    };

export const getAllDoctorFeedbacksRepo =
    async () => {

        return await DoctorFeedback.find()
            .populate(doctorPopulate)
            .sort({ createdAt: -1 });
    };

export const getDoctorFeedbacksByDoctorIdRepo =
    async (doctorObjectId) => {

        return await DoctorFeedback.find({ doctor: doctorObjectId })
            .populate(doctorPopulate)
            .sort({ createdAt: -1 });
    };

export const getDoctorFeedbackByIdRepo =
    async (feedbackId) => {

        return await DoctorFeedback.findById(feedbackId)
            .populate(doctorPopulate);
    };

export const updateDoctorFeedbackRepo =
    async (feedbackId, payload) => {

        return await DoctorFeedback.findByIdAndUpdate(
            feedbackId,
            payload,
            {
                new: true,
                runValidators: true,
            }
        ).populate(doctorPopulate);
    };

export const deleteDoctorFeedbackRepo =
    async (feedbackId) => {

        return await DoctorFeedback.findByIdAndDelete(feedbackId);
    };
