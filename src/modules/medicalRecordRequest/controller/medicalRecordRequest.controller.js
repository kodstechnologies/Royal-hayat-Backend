import httpStatus from "http-status";

import {
    createMedicalRecordRequestService,
    getAllMedicalRecordRequestsService,
    getMedicalRecordRequestByIdService,
    deleteMedicalRecordRequestService,
    shareMedicalRecordRequestViaEmailService
} from "../service/medicalRecordRequest.service.js";

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

            const requests =
                await getAllMedicalRecordRequestsService();

            return res.status(200).json({
                success: true,
                data: requests
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