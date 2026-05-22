// repositories/document.repository.js

import Documents from "../model/document.model.js";

export const createDocumentRepo = async (payload) => {
    return await Documents.create(payload);
};

export const getAllDocumentsRepo = async () => {
    return await Documents.find().sort({ createdAt: -1 });
};

export const getDocumentByIdRepo = async (id) => {
    return await Documents.findById(id);
};

export const updateDocumentRepo = async (id, payload) => {
    return await Documents.findByIdAndUpdate(
        id,
        payload,
        { new: true }
    );
};

export const deleteDocumentRepo = async (id) => {
    return await Documents.findByIdAndDelete(id);
};