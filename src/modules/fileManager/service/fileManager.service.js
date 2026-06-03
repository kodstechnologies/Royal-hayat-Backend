import mongoose from "mongoose";
import path from "path";
import { putObject } from "../../../utils/putObject.js";
import { getFileUrl } from "../../../utils/s3Fetch.js";
import toPlainObject from "../../../utils/toPlainObject.js";
import {
  addFileToFolderRepo,
  createFolderRepo,
  deleteFolderRepo,
  findFolderByIdRepo,
  findFoldersRepo,
  removeFileFromFolderRepo,
  updateFileInFolderRepo,
  updateFolderRepo,
} from "../repository/fileManager.repository.js";

const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const buildPermanentS3Url = (key) => {
  if (!key) return "";
  if (key.startsWith("http")) return key;
  const bucket = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  if (!bucket || !region) return key;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

const nextSlno = (files = []) => {
  if (!files.length) return 1;
  return Math.max(...files.map((f) => Number(f.slno) || 0)) + 1;
};

/** If requested slno is taken, use the next free number. */
export const resolveSlno = (files = [], requested, excludeFileId = null) => {
  const used = new Set(
    (files || [])
      .filter((f) => String(f._id) !== String(excludeFileId))
      .map((f) => Number(f.slno))
      .filter((n) => !Number.isNaN(n))
  );

  if (requested !== undefined && requested !== null && requested !== "") {
    let candidate = Number(requested);
    if (Number.isNaN(candidate) || candidate < 1) {
      candidate = nextSlno(files);
    }
    while (used.has(candidate)) {
      candidate += 1;
    }
    return candidate;
  }

  let candidate = nextSlno(files);
  while (used.has(candidate)) {
    candidate += 1;
  }
  return candidate;
};

const mapFilesWithSignedUrls = async (files = []) => {
  const mapped = await Promise.all(
    files.map(async (file) => {
      const plain = toPlainObject(file);
      const signedUrl = await getFileUrl(plain.s3Key);
      const permanentUrl = plain.s3Url || buildPermanentS3Url(plain.s3Key);
      return {
        ...plain,
        s3Url: permanentUrl,
        previewUrl: signedUrl || permanentUrl,
        sizeFormatted: formatBytes(plain.size),
      };
    })
  );
  return mapped.sort((a, b) => a.slno - b.slno);
};

const mapFolder = async (folder) => {
  if (!folder) return null;
  const plain = toPlainObject(folder);
  const files = await mapFilesWithSignedUrls(plain.files || []);
  return {
    ...plain,
    files,
    fileCount: files.length,
    totalSize: files.reduce((sum, f) => sum + (f.size || 0), 0),
    totalSizeFormatted: formatBytes(
      files.reduce((sum, f) => sum + (f.size || 0), 0)
    ),
  };
};

const parseUploadMeta = (raw) => {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const applyDisplayName = (file, displayName) => {
  if (!displayName?.trim()) return file;
  const ext = path.extname(file.originalname) || "";
  const base = displayName.trim().replace(/[/\\]/g, "");
  const finalName = base.toLowerCase().endsWith(ext.toLowerCase())
    ? base
    : `${base}${ext}`;
  return { ...file, originalname: finalName };
};

export const createFolderService = async ({ name, parent }) => {
  const parentId =
    parent && mongoose.Types.ObjectId.isValid(parent) ? parent : null;

  const existing = await findFoldersRepo({
    name: name.trim(),
    parent: parentId,
  });
  if (existing.length > 0) {
    throw new Error("A folder with this name already exists");
  }

  const folder = await createFolderRepo({
    name: name.trim(),
    parent: parentId,
    files: [],
  });

  return mapFolder(folder);
};

export const listFoldersService = async (parent) => {
  const filter = {};
  if (parent === "root" || parent === "" || parent === undefined) {
    filter.parent = null;
  } else if (parent && mongoose.Types.ObjectId.isValid(parent)) {
    filter.parent = parent;
  }

  const folders = await findFoldersRepo(filter);
  const mapped = await Promise.all(
    folders.map(async (folder) => {
      const plain = toPlainObject(folder);
      const fileCount = (plain.files || []).length;
      const totalSize = (plain.files || []).reduce(
        (sum, f) => sum + (f.size || 0),
        0
      );
      return {
        ...plain,
        fileCount,
        totalSize,
        totalSizeFormatted: formatBytes(totalSize),
      };
    })
  );
  return mapped;
};

export const getFolderByIdService = async (id) => {
  const folder = await findFolderByIdRepo(id);
  if (!folder) throw new Error("Folder not found");
  return mapFolder(folder);
};

export const renameFolderService = async (id, name) => {
  const folder = await findFolderByIdRepo(id);
  if (!folder) throw new Error("Folder not found");

  const duplicate = await findFoldersRepo({
    name: name.trim(),
    parent: folder.parent ?? null,
  });
  if (duplicate.some((f) => String(f._id) !== String(id))) {
    throw new Error("A folder with this name already exists");
  }

  const updated = await updateFolderRepo(id, { name: name.trim() });
  return mapFolder(updated);
};

export const deleteFolderService = async (id) => {
  const folder = await findFolderByIdRepo(id);
  if (!folder) throw new Error("Folder not found");

  const childFolders = await findFoldersRepo({ parent: id });
  if (childFolders.length > 0) {
    throw new Error("Delete subfolders first");
  }

  await deleteFolderRepo(id);
  return { deleted: true, fileCount: (folder.files || []).length };
};

export const uploadFilesToFolderService = async (
  folderId,
  uploadedFiles,
  metaRaw
) => {
  let folder = await findFolderByIdRepo(folderId);
  if (!folder) throw new Error("Folder not found");

  if (!uploadedFiles?.length) {
    throw new Error("At least one file is required");
  }

  const metaList = parseUploadMeta(metaRaw);
  const s3Folder = `file-manager/${folderId}`;

  for (let i = 0; i < uploadedFiles.length; i += 1) {
    const meta = metaList[i] || {};
    const file = applyDisplayName(uploadedFiles[i], meta.fileName);
    const slno = resolveSlno(folder.files, meta.slno);
    const { key, url } = await putObject(file, s3Folder);

    const fileDoc = {
      slno,
      s3Key: key,
      s3Url: url,
      size: file.size || file.buffer?.length || 0,
      originalName: file.originalname,
      mimeType: file.mimetype || "",
    };

    folder = await addFileToFolderRepo(folderId, fileDoc);
  }

  return getFolderByIdService(folderId);
};

export const updateFileInFolderService = async (
  folderId,
  fileId,
  body,
  replacementFile
) => {
  const folder = await findFolderByIdRepo(folderId);
  if (!folder) throw new Error("Folder not found");

  const existing = (folder.files || []).find(
    (f) => String(f._id) === String(fileId)
  );
  if (!existing) throw new Error("File not found in folder");

  const updates = {};

  if (body.originalName !== undefined) {
    updates["files.$.originalName"] = body.originalName.trim();
  }

  if (body.slno !== undefined) {
    updates["files.$.slno"] = resolveSlno(
      folder.files,
      body.slno,
      fileId
    );
  }

  if (replacementFile) {
    const s3Folder = `file-manager/${folderId}`;
    const file = applyDisplayName(
      replacementFile,
      body.originalName || existing.originalName
    );
    const { key, url } = await putObject(file, s3Folder);
    updates["files.$.s3Key"] = key;
    updates["files.$.s3Url"] = url;
    updates["files.$.size"] =
      replacementFile.size || replacementFile.buffer?.length || 0;
    updates["files.$.mimeType"] = replacementFile.mimetype || "";
    if (!updates["files.$.originalName"]) {
      updates["files.$.originalName"] = file.originalname;
    }
  }

  if (!Object.keys(updates).length) {
    throw new Error("No updates provided");
  }

  const updated = await updateFileInFolderRepo(folderId, fileId, updates);
  return mapFolder(updated);
};

export const deleteFileFromFolderService = async (folderId, fileId) => {
  const folder = await findFolderByIdRepo(folderId);
  if (!folder) throw new Error("Folder not found");

  const exists = (folder.files || []).some(
    (f) => String(f._id) === String(fileId)
  );
  if (!exists) throw new Error("File not found in folder");

  const updated = await removeFileFromFolderRepo(folderId, fileId);
  return mapFolder(updated);
};
