// controllers/document.controller.js

import {
    createDocumentService,
    getAllDocumentsService,
    getDocumentByIdService,
    updateDocumentService,
    deleteDocumentService
} from "../services/document.service.js";

import {
    createDocumentValidator,
    updateDocumentValidator
} from "../validators/document.validator.js";

export const createDocument = async (req, res) => {

    try {

        const { error } = createDocumentValidator.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const document = await createDocumentService(
            req.body,
            req.file
        );

        return res.status(201).json({
            success: true,
            message: "Document created successfully",
            data: document
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllDocuments = async (req, res) => {

    try {

        const documents = await getAllDocumentsService();

        return res.status(200).json({
            success: true,
            data: documents
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getDocumentById = async (req, res) => {

    try {

        const document = await getDocumentByIdService(req.params.id);

        return res.status(200).json({
            success: true,
            data: document
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateDocument = async (req, res) => {

    try {

        const { error } = updateDocumentValidator.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const document = await updateDocumentService(
            req.params.id,
            req.body,
            req.file
        );

        return res.status(200).json({
            success: true,
            message: "Document updated successfully",
            data: document
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteDocument = async (req, res) => {

    try {

        await deleteDocumentService(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Document deleted successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};