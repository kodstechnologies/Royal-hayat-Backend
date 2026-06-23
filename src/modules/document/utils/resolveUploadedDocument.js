import path from "path";
import { getS3ObjectBuffer } from "../../../utils/s3Fetch.js";
import {
  buildDocumentStorageKeyCandidates,
  getDocumentPublicPath,
} from "../../../utils/documentStorage.js";
import { getDocumentByPublicPathService } from "../../document/services/document.service.js";

export async function resolveUploadedDocumentByPublicPath(publicPath) {
  const normalizedPath = getDocumentPublicPath(publicPath);
  if (!normalizedPath) return null;

  const document = await getDocumentByPublicPathService(normalizedPath);
  if (!document?.file) return null;

  const storageKeys = buildDocumentStorageKeyCandidates(document.file);
  let s3File = null;

  for (const storageKey of storageKeys) {
    s3File = await getS3ObjectBuffer(storageKey);
    if (s3File?.buffer?.length) break;
  }

  if (!s3File?.buffer?.length) return null;

  const version = document.contentVersion || document.updatedAt || document._id;

  return {
    buffer: s3File.buffer,
    filename: path.basename(normalizedPath),
    contentType: s3File.contentType || "application/octet-stream",
    etag: `"${String(version)}"`,
    fromUpload: true,
  };
}
