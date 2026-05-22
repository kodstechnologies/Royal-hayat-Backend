// repositories/hospitalFeedback.repository.js

import HospitalFeedback from "../model/HospitalFeedback.model.js";

export const createHospitalFeedbackRepo = async (payload) => {
    return await HospitalFeedback.create(payload);
};

export const getAllHospitalFeedbacksRepo = async () => {
    return await HospitalFeedback.find()
        .sort({ createdAt: -1 });
};

export const getEnglishHospitalFeedbacksRepo = async () => {
    return await HospitalFeedback.find({
        feedback: { $exists: true, $ne: "" }
    }).sort({ createdAt: -1 });
};

export const getArabicHospitalFeedbacksRepo = async () => {
    return await HospitalFeedback.find({
        arabicFeedback: { $exists: true, $ne: "" }
    }).sort({ createdAt: -1 });
};

export const deleteHospitalFeedbackRepo = async (id) => {
    return await HospitalFeedback.findByIdAndDelete(id);
};