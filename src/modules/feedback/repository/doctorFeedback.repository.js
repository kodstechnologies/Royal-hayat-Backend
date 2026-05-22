// repositories/doctorFeedback.repository.js

import DoctorFeedback from "../model/DoctorFeedback.model.js";

export const createDoctorFeedbackRepo = async (payload) => {
    return await DoctorFeedback.create(payload);
};

export const getAllDoctorFeedbacksRepo = async () => {
    return await DoctorFeedback.find()
        .populate({
            path: "doctor",
            populate: {
                path: "department"
            }
        })
        .sort({ createdAt: -1 });
};

export const getEnglishDoctorFeedbacksRepo = async () => {
    return await DoctorFeedback.find({
        feedback: { $exists: true, $ne: "" }
    })
        .populate({
            path: "doctor",
            populate: {
                path: "department"
            }
        })
        .sort({ createdAt: -1 });
};

export const getArabicDoctorFeedbacksRepo = async () => {
    return await DoctorFeedback.find({
        arabicFeedback: { $exists: true, $ne: "" }
    })
        .populate({
            path: "doctor",
            populate: {
                path: "department"
            }
        })
        .sort({ createdAt: -1 });
};

export const deleteDoctorFeedbackRepo = async (id) => {
    return await DoctorFeedback.findByIdAndDelete(id);
};