// services/medicalRecordRequest.service.js

import {
    createMedicalRecordRequestRepo,
    getAllMedicalRecordRequestsRepo,
    getMedicalRecordRequestByIdRepo,
    deleteMedicalRecordRequestRepo
} from "../repository/medicalRecordRequest.repository.js";

import { uploadToS3 } from "../../../utils/s3Upload.js";
import { getFileUrl } from "../../../utils/s3Fetch.js";

export const createMedicalRecordRequestService = async (
    body,
    file
) => {

    if (!file) {
        throw new Error(
            "passportOrGovernmentId file is required"
        );
    }

    const uploadedFile = await uploadToS3(file);

    const payload = {
        ...body,
        passportOrGovernmentId: uploadedFile.key
    };

    return await createMedicalRecordRequestRepo(payload);
};

export const getAllMedicalRecordRequestsService =
    async () => {

        const requests =
            await getAllMedicalRecordRequestsRepo();

        return await Promise.all(
            requests.map(async (request) => {

                const fileUrl =
                    await getFileUrl(
                        request.passportOrGovernmentId
                    );

                return {
                    ...request.toObject(),
                    passportOrGovernmentId: fileUrl
                };
            })
        );
    };

export const getMedicalRecordRequestByIdService =
    async (id) => {

        const request =
            await getMedicalRecordRequestByIdRepo(id);

        if (!request) {
            throw new Error(
                "Medical record request not found"
            );
        }

        const fileUrl = await getFileUrl(
            request.passportOrGovernmentId
        );

        return {
            ...request.toObject(),
            passportOrGovernmentId: fileUrl
        };
    };

export const deleteMedicalRecordRequestService =
    async (id) => {

        return await deleteMedicalRecordRequestRepo(id);
    };