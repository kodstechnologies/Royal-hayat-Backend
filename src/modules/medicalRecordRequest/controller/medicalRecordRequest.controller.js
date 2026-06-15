import httpStatus from "http-status";

import {
    createMedicalRecordRequestService,
    getAllMedicalRecordRequestsService,
    getMedicalRecordRequestByIdService,
    deleteMedicalRecordRequestService,
    shareMedicalRecordRequestViaEmailService
} from "../service/medicalRecordRequest.service.js";

import { getMedicalRecordRequestsQuerySchema } from "../validators/medicalRecordRequest.validator.js";

export const createMedicalRecordRequest =
    async (req, res) => {

        try {

            const request =
                await createMedicalRecordRequestService(
                    req.body,
                    req.files
                );

            return res.status(201).json({
                success: true,
                message:
                    "Medical record request created successfully",
                data: request
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

export const getAllMedicalRecordRequests =
    async (req, res) => {

        try {

            const { error, value } = getMedicalRecordRequestsQuerySchema.validate(
                req.query,
                { abortEarly: false },
            );

            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details.map((detail) => detail.message).join(", "),
                });
            }

            const { requests, meta } =
                await getAllMedicalRecordRequestsService(value);

            return res.status(200).json({
                success: true,
                message: "Medical record requests fetched successfully",
                data: requests,
                meta,
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

export const getMedicalRecordRequestById =
    async (req, res) => {

        try {

            const request =
                await getMedicalRecordRequestByIdService(
                    req.params.id
                );

            return res.status(200).json({
                success: true,
                data: request
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

export const deleteMedicalRecordRequest =
    async (req, res) => {

        try {

            await deleteMedicalRecordRequestService(
                req.params.id
            );

            return res.status(200).json({
                success: true,
                message:
                    "Medical record request deleted successfully"
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

export const shareMedicalRecordRequestViaEmail =
    (async (req, res) => {
        const response =
            await shareMedicalRecordRequestViaEmailService(
                req.params.id,
                req.body
            );

        res.status(httpStatus.OK).json({
            success: true,
            message: response.message,
        });
    });