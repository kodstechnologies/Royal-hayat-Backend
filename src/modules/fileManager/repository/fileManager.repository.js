import FileManager from "../model/fileManager.model.js";

export const createFolderRepo = (payload) => FileManager.create(payload);

export const findFoldersRepo = (filter = {}) =>
  FileManager.find(filter).sort({ name: 1 }).lean();

export const findFolderByIdRepo = (id) => FileManager.findById(id).lean();

export const updateFolderRepo = (id, payload) =>
  FileManager.findByIdAndUpdate(id, payload, { new: true }).lean();

export const deleteFolderRepo = (id) => FileManager.findByIdAndDelete(id).lean();

export const addFileToFolderRepo = (folderId, fileDoc) =>
  FileManager.findByIdAndUpdate(
    folderId,
    { $push: { files: fileDoc } },
    { new: true }
  ).lean();

export const removeFileFromFolderRepo = (folderId, fileId) =>
  FileManager.findByIdAndUpdate(
    folderId,
    { $pull: { files: { _id: fileId } } },
    { new: true }
  ).lean();

export const updateFileInFolderRepo = (folderId, fileId, updates) =>
  FileManager.findOneAndUpdate(
    { _id: folderId, "files._id": fileId },
    { $set: updates },
    { new: true }
  ).lean();
