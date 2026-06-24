
import {
    createDocumentRepo,
    getAllDocumentsRepo,
    getDocumentByIdRepo,
    updateDocumentRepo,
    deleteDocumentRepo,
    getDocumentByPublicPathRepo,
    getDocumentByPublicPathAnyStatusRepo,
    deleteAliasDocumentDuplicatesRepo,
} from "../repository/document.repository.js";

import { getFileUrl } from "../../../utils/s3Fetch.js";
import {
    buildDocumentPublicPath,
    buildDocumentS3Key,
    copyS3ObjectToKey,
    getDocumentPublicPath,
    normalizeDocumentPublicPath,
    uploadDocumentToS3,
} from "../../../utils/documentStorage.js";
import toPlainObject from "../../../utils/toPlainObject.js";

const formatDocumentResponse = async (doc) => {
    const plain = toPlainObject(doc);

    if (plain.publicPath) {
        const publicPath = getDocumentPublicPath(plain.publicPath);
        return {
            ...plain,
            publicPath,
            storageKey: plain.file,
            file: publicPath,
            fileUrl: publicPath,
        };
    }

    const signedUrl = await getFileUrl(plain.file);
    return {
        ...plain,
        file: signedUrl,
        fileUrl: signedUrl,
    };
};

const assertUniquePublicPath = async (publicPath, excludeId) => {
    await deleteAliasDocumentDuplicatesRepo(publicPath, excludeId);

    const existingDocument = await getDocumentByPublicPathAnyStatusRepo(publicPath);
    if (existingDocument && String(existingDocument._id) !== String(excludeId ?? "")) {
        throw new Error(`A document already exists at ${getDocumentPublicPath(publicPath)}`);
    }
};

const resolvePublicPath = (body, file, existingPublicPath) => {
    if (body.publicPath !== undefined && body.publicPath !== null && String(body.publicPath).trim()) {
        return normalizeDocumentPublicPath(body.publicPath, file?.originalname);
    }

    if (existingPublicPath) {
        return getDocumentPublicPath(existingPublicPath);
    }

    if (file) {
        return buildDocumentPublicPath(file.originalname);
    }

    return null;
};

export const createDocumentService = async (body, file) => {

    if (!file) {
        throw new Error("File is required");
    }

    const publicPath = resolvePublicPath(body, file);
    const existingDocument = await getDocumentByPublicPathAnyStatusRepo(publicPath);

    if (existingDocument) {
        await deleteAliasDocumentDuplicatesRepo(publicPath, existingDocument._id);
        const updated = await updateDocumentService(String(existingDocument._id), body, file);
        return { ...updated, replacedExisting: true };
    }

    const uploadedFile = await uploadDocumentToS3(file, publicPath);

    const payload = {
        title: body.title,
        catagory: body.catagory,
        description: body.description,
        file: uploadedFile.key,
        publicPath,
        contentVersion: Date.now(),
        qrEnabled: true,
        status: body.status || "active"
    };

    const document = await createDocumentRepo(payload);
    return formatDocumentResponse(document);
};

export const getAllDocumentsService = async () => {

    const documents = await getAllDocumentsRepo();

    return Promise.all(documents.map((doc) => formatDocumentResponse(doc)));
};

export const getDocumentByIdService = async (id) => {

    const document = await getDocumentByIdRepo(id);

    if (!document) {
        throw new Error("Document not found");
    }

    return formatDocumentResponse(document);
};

export const updateDocumentService = async (id, body, file) => {

    const existingDocument = await getDocumentByIdRepo(id);

    if (!existingDocument) {
        throw new Error("Document not found");
    }

    const updatedPublicPath = resolvePublicPath(
        body,
        file,
        existingDocument.publicPath,
    );

    if (!updatedPublicPath) {
        throw new Error("Public path is required");
    }

    await assertUniquePublicPath(updatedPublicPath, id);

    let updatedFile = existingDocument.file;
    const targetS3Key = buildDocumentS3Key(updatedPublicPath);
    let fileReplaced = false;

    if (file) {
        if (!file.buffer?.length) {
            throw new Error("Uploaded file is empty");
        }

        const uploadedFile = await uploadDocumentToS3(file, updatedPublicPath);
        updatedFile = uploadedFile.key;
        fileReplaced = true;
    } else if (
        targetS3Key !== String(existingDocument.file || "").trim().replace(/^\/+/, "") &&
        existingDocument.file
    ) {
        await copyS3ObjectToKey(existingDocument.file, targetS3Key);
        updatedFile = targetS3Key;
    }

    const payload = {
        title: body.title ?? existingDocument.title,
        catagory: body.catagory ?? existingDocument.catagory,
        description: body.description ?? existingDocument.description,
        status: body.status ?? existingDocument.status,
        file: updatedFile,
        publicPath: updatedPublicPath,
        contentVersion: Date.now(),
    };

    const document = await updateDocumentRepo(id, payload);
    const formatted = await formatDocumentResponse(document);
    return { ...formatted, fileReplaced };
};

export const deleteDocumentService = async (id) => {

    const document = await getDocumentByIdRepo(id);

    if (!document) {
        throw new Error("Document not found");
    }

    return await deleteDocumentRepo(id);
};

export const getDocumentByPublicPathService = async (publicPath) => {
    return getDocumentByPublicPathRepo(publicPath);
};

export const getDocumentPublicMetaService = async (publicPath) => {
    const document = await getDocumentByPublicPathRepo(publicPath);
    if (!document) {
        return null;
    }

    const normalizedPath = getDocumentPublicPath(document.publicPath || publicPath);
    const contentVersion =
        document.contentVersion ||
        (document.updatedAt ? new Date(document.updatedAt).getTime() : null) ||
        String(document._id);

    return {
        publicPath: normalizedPath,
        contentVersion,
        updatedAt: document.updatedAt ?? null,
    };
};
