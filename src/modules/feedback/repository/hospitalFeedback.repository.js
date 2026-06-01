
import HospitalFeedback from "../model/HospitalFeedback.model.js";

export const createHospitalFeedbackRepo =
    async (payload) => {

        return await HospitalFeedback.create(payload);
    };

export const getAllHospitalFeedbacksRepo =
    async () => {

        return await HospitalFeedback.find()
            .sort({ createdAt: -1 })
            .lean();
    };

export const getHospitalFeedbackByIdRepo =
    async (id) => {

        return await HospitalFeedback.findById(id);
    };

export const markHospitalFeedbackViewedRepo = async (id) => {
    return await HospitalFeedback.findByIdAndUpdate(
        id,
        { isViewed: true },
        { new: true }
    );
};

export const updateHospitalFeedbackRepo =
    async (id, payload) => {

        return await HospitalFeedback.findByIdAndUpdate(
            id,
            payload,
            {
                new: true,
                runValidators: true
            }
        );
    };

export const deleteHospitalFeedbackRepo =
    async (id) => {

        return await HospitalFeedback.findByIdAndDelete(id);
    };