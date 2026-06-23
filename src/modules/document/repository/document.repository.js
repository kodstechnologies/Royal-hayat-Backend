import Documents from "../model/document.model.js";
import { buildPublicPathLookupCandidates } from "../../../utils/documentStorage.js";

export const createDocumentRepo = async (payload) => {
    return await Documents.create(payload);
};

export const getAllDocumentsRepo = async () => {
    return await Documents.find().sort({ createdAt: -1 }).lean();
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

export const getDocumentByPublicPathRepo = async (publicPath) => {
    const candidates = buildPublicPathLookupCandidates(publicPath);

    return await Documents.findOne({
        publicPath: { $in: candidates },
        status: "active",
    })
        .sort({ updatedAt: -1, contentVersion: -1 })
        .lean();
};
