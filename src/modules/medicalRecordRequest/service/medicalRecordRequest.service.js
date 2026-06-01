import nodemailer from "nodemailer";

import {
    createMedicalRecordRequestRepo,
    getAllMedicalRecordRequestsRepo,
    getMedicalRecordRequestByIdRepo,
    deleteMedicalRecordRequestRepo
} from "../repository/medicalRecordRequest.repository.js";

import { uploadToS3 } from "../../../utils/s3Upload.js";
import { getFileUrl } from "../../../utils/s3Fetch.js";
import {
    medicalRecordRequestEmailTemplate,
    resolveEmailSubject,
} from "../../../utils/shareViaMail.js";
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

        const { emailId, languages } = body;

        if (!emailId?.trim()) {
            throw new Error("emailId is required");
        }

        const normalizedLanguages = Array.isArray(languages) && languages.length > 0
            ? [...new Set(languages.filter((lang) => lang === "en" || lang === "ar"))]
            : ["en"];

        if (normalizedLanguages.length === 0) {
            throw new Error("At least one language (en or ar) is required");
        }

        const recipients = emailId
            .split(",")
            .map((email) => email.trim())
            .filter(Boolean);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalid = recipients.find((email) => !emailRegex.test(email));

        if (recipients.length === 0) {
            throw new Error("At least one valid email address is required");
        }

        if (invalid) {
            throw new Error(`Invalid email address: ${invalid}`);
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

        const htmlContent = medicalRecordRequestEmailTemplate(
            request,
            passportFileUrl,
            normalizedLanguages,
        );

        const subject = resolveEmailSubject(normalizedLanguages);
        const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || "royalehayat.dev@gmail.com";

        await transporter.sendMail({
            from: fromAddress,
            to: recipients.join(", "),
            subject,
            html: htmlContent,
        });

        return {
            success: true,
            message: `Medical record request shared successfully to ${recipients.length} recipient(s)`,
        };
    };