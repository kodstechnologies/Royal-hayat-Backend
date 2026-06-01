
import MedicalRecordRequest from "../model/medicalRecordRequest.model.js";

export const createMedicalRecordRequestRepo = async (payload) => {
    return await MedicalRecordRequest.create(payload);
};

export const getAllMedicalRecordRequestsRepo = async () => {
    return await MedicalRecordRequest.find()
        .sort({ createdAt: -1 })
        .lean();
};

export const getMedicalRecordRequestByIdRepo = async (id) => {
    return await MedicalRecordRequest.findByIdAndUpdate(
        id,
        {
            isViewed: true
        },
        {
            new: true
        }
    );
};
export const deleteMedicalRecordRequestRepo = async (id) => {
    return await MedicalRecordRequest.findByIdAndDelete(id);
};