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

// UPDATE ENGLISH
export const updateEnglishDoctorFeedbackRepo =
    async (id, payload) => {

        return await DoctorFeedback.findByIdAndUpdate(
            id,
            {
                userName:
                    payload.userName,

                feedback:
                    payload.feedback,

                stars:
                    payload.stars,

                shownOnWebsite:
                    payload.shownOnWebsite,
            },
            {
                new: true,
            }
        )
            .populate({
                path: "doctor",
                populate: {
                    path: "department"
                }
            });
    };

// UPDATE ARABIC
export const updateArabicDoctorFeedbackRepo =
    async (id, payload) => {

        return await DoctorFeedback.findByIdAndUpdate(
            id,
            {
                arabicUserName:
                    payload.arabicUserName,

                arabicFeedback:
                    payload.arabicFeedback,

                stars:
                    payload.stars,

                shownOnWebsite:
                    payload.shownOnWebsite,
            },
            {
                new: true,
            }
        )
            .populate({
                path: "doctor",
                populate: {
                    path: "department"
                }
            });
    };