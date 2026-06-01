import nodemailer from "nodemailer";

import {
    createMedicalRecordRequestRepo,
    getAllMedicalRecordRequestsRepo,
    getMedicalRecordRequestByIdRepo,
    deleteMedicalRecordRequestRepo
} from "../repository/medicalRecordRequest.repository.js";

import { uploadToS3 } from "../../../utils/s3Upload.js";
import { getFileUrl } from "../../../utils/s3Fetch.js";
import { medicalRecordRequestEmailTemplate } from "../../../utils/shareViaMail.js";
import toPlainObject from "../../../utils/toPlainObject.js";

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
                    ...toPlainObject(request),
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
            ...toPlainObject(request),
            passportOrGovernmentId: fileUrl
        };
    };

export const deleteMedicalRecordRequestService =
    async (id) => {

        return await deleteMedicalRecordRequestRepo(id);
    };

export const shareMedicalRecordRequestViaEmailService =
    async (id, body) => {
        const request =
            await getMedicalRecordRequestByIdRepo(id);

        if (!request) {
            throw new Error(
                "Medical record request not found"
            );
        }

        const { emailId } = body;

        if (!emailId) {
            throw new Error("emailId is required");
        }

        const passportFileUrl = await getFileUrl(
            request.passportOrGovernmentId
        );

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const htmlContent =
            medicalRecordRequestEmailTemplate(
                request,
                passportFileUrl
            );

        await transporter.sendMail({
            from: "royalehayat.dev@gmail.com",
            to: emailId,
            subject: "Medical Record Request Details",
            html: htmlContent,
        });

        return {
            success: true,
            message:
                "Medical record request shared successfully",
        };
    };