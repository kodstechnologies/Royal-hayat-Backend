import {
  createFolderService,
  deleteFileFromFolderService,
  deleteFolderService,
  getFolderByIdService,
  listFoldersService,
  renameFolderService,
  updateFileInFolderService,
  uploadFilesToFolderService,
} from "../service/fileManager.service.js";
import {
  createFolderValidator,
  renameFolderValidator,
  updateFileValidator,
} from "../validators/fileManager.validator.js";

export const createFolder = async (req, res) => {
  try {
    const { error } = createFolderValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const folder = await createFolderService(req.body);
    return res.status(201).json({
      success: true,
      message: "Folder created successfully",
      data: folder,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const listFolders = async (req, res) => {
  try {
    const parent = req.query.parent;
    const folders = await listFoldersService(parent);
    return res.status(200).json({ success: true, data: folders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getFolderById = async (req, res) => {
  try {
    const folder = await getFolderByIdService(req.params.id);
    return res.status(200).json({ success: true, data: folder });
  } catch (err) {
    const status = err.message === "Folder not found" ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

export const renameFolder = async (req, res) => {
  try {
    const { error } = renameFolderValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const folder = await renameFolderService(req.params.id, req.body.name);
    return res.status(200).json({
      success: true,
      message: "Folder renamed successfully",
      data: folder,
    });
  } catch (err) {
    const status = err.message === "Folder not found" ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

export const deleteFolder = async (req, res) => {
  try {
    const result = await deleteFolderService(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Folder deleted successfully",
      data: result,
    });
  } catch (err) {
    const status = err.message === "Folder not found" ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

export const uploadFiles = async (req, res) => {
  try {
    const files = req.files?.length ? req.files : req.file ? [req.file] : [];
    const folder = await uploadFilesToFolderService(
      req.params.id,
      files,
      req.body.meta
    );
    return res.status(201).json({
      success: true,
      message: "Files uploaded successfully",
      data: folder,
    });
  } catch (err) {
    const status = err.message === "Folder not found" ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

export const updateFile = async (req, res) => {
  try {
    const { error } = updateFileValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const folder = await updateFileInFolderService(
      req.params.id,
      req.params.fileId,
      req.body,
      req.file
    );
    return res.status(200).json({
      success: true,
      message: "File updated successfully",
      data: folder,
    });
  } catch (err) {
    const status =
      err.message === "Folder not found" || err.message === "File not found in folder"
        ? 404
        : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const folder = await deleteFileFromFolderService(
      req.params.id,
      req.params.fileId
    );
    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
      data: folder,
    });
  } catch (err) {
    const status =
      err.message === "Folder not found" || err.message === "File not found in folder"
        ? 404
        : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};
