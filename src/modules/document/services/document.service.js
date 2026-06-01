
import {
    createDocumentRepo,
    getAllDocumentsRepo,
    getDocumentByIdRepo,
    updateDocumentRepo,
    deleteDocumentRepo
} from "../repository/document.repository.js";

import { uploadToS3 } from "../../../utils/s3Upload.js";
import { getFileUrl } from "../../../utils/s3Fetch.js";
import toPlainObject from "../../../utils/toPlainObject.js";

export const createDocumentService = async (body, file) => {

    if (!file) {
        throw new Error("File is required");
    }

    const uploadedFile = await uploadToS3(file);

    const payload = {
        title: body.title,
        catagory: body.catagory,
        description: body.description,
        file: uploadedFile.key,
        status: body.status || "active"
    };

    return await createDocumentRepo(payload);
};

export const getAllDocumentsService = async () => {

    const documents = await getAllDocumentsRepo();

    const updatedDocuments = await Promise.all(
        documents.map(async (doc) => {

            const signedUrl = await getFileUrl(doc.file);

            return {
                ...toPlainObject(doc),
                file: signedUrl
            };
        })
    );

    return updatedDocuments;
};

export const getDocumentByIdService = async (id) => {

    const document = await getDocumentByIdRepo(id);

    if (!document) {
        throw new Error("Document not found");
    }

    const signedUrl = await getFileUrl(document.file);

    return {
        ...toPlainObject(document),
        file: signedUrl
    };
};

export const updateDocumentService = async (id, body, file) => {

    const existingDocument = await getDocumentByIdRepo(id);

    if (!existingDocument) {
        throw new Error("Document not found");
    }

    let updatedFile = existingDocument.file;

    if (file) {
        const uploadedFile = await uploadToS3(file);
        updatedFile = uploadedFile.key;
    }

    const payload = {
        title: body.title || existingDocument.title,
        catagory: body.catagory || existingDocument.catagory,
        description: body.description || existingDocument.description,
        status: body.status || existingDocument.status,
        file: updatedFile
    };

    return await updateDocumentRepo(id, payload);
};

export const deleteDocumentService = async (id) => {

    const document = await getDocumentByIdRepo(id);

    if (!document) {
        throw new Error("Document not found");
    }

    return await deleteDocumentRepo(id);
};