import fs from "fs";
import path from "path";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import { joinPublicPath, isPublicDocumentPath } from "../../../utils/documentStorage.js";
import { resolveUploadedDocumentByPublicPath } from "../../document/utils/resolveUploadedDocument.js";
import {
  listRuntimePdfs,
  resolveRuntimePdfPath,
  resolveWpContentPdfPath,
  RUNTIME_PDF_MAP,
  WP_CONTENT_PDF_MAP,
} from "../config/runtimePdfMap.js";

const getRelativePath = (req) => {
  const fromWildcard = req.params.splat ?? req.params[0];
  if (fromWildcard !== undefined && fromWildcard !== null) {
    const parts = Array.isArray(fromWildcard) ? fromWildcard : [fromWildcard];
    return decodeURIComponent(parts.join("/")).trim();
  }
  return decodeURIComponent(req.path.replace(/^\//, "")).trim();
};

const sendFileBuffer = (res, { buffer, filename, contentType, etag, fromUpload }) => {
  res.setHeader("Content-Type", contentType || "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${path.basename(filename || "file")}"`,
  );
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (fromUpload) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    if (etag) {
      res.setHeader("ETag", etag);
    }
  } else {
    res.setHeader("Cache-Control", "public, max-age=3600");
  }

  return res.send(buffer);
};

const sendPdfFile = (res, filePath, filename) => {
  const absolutePath = path.resolve(filePath);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${path.basename(filename || absolutePath)}"`,
  );
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.sendFile(absolutePath);
};

export async function serveRuntimePdf(req, res, next) {
  try {
    const relativePath = getRelativePath(req);
    const publicPath = joinPublicPath("Runtime/uploads", relativePath);

    const uploadedDocument = await resolveUploadedDocumentByPublicPath(publicPath);
    if (uploadedDocument) {
      return sendFileBuffer(res, uploadedDocument);
    }

    const filePath = resolveRuntimePdfPath(relativePath);
    if (filePath && fs.existsSync(filePath)) {
      return sendPdfFile(res, filePath, relativePath);
    }

    throw new ApiError(404, `PDF not found: ${relativePath}`);
  } catch (error) {
    return next(error);
  }
}

export async function serveWpContentPdf(req, res, next) {
  try {
    const relativePath = getRelativePath(req);
    const publicPath = joinPublicPath("wp-content/uploads", relativePath);

    const uploadedDocument = await resolveUploadedDocumentByPublicPath(publicPath);
    if (uploadedDocument) {
      return sendFileBuffer(res, uploadedDocument);
    }

    const filePath = resolveWpContentPdfPath(relativePath);
    if (filePath && fs.existsSync(filePath)) {
      return sendPdfFile(res, filePath, relativePath);
    }

    throw new ApiError(404, `PDF not found: ${relativePath}`);
  } catch (error) {
    return next(error);
  }
}

const getStreamRelativePath = (req) => {
  const marker = "/api/v1/runtime-pdf-viewer/file/";
  const originalUrl = String(req.originalUrl || req.url || "");
  const markerIndex = originalUrl.indexOf(marker);

  if (markerIndex !== -1) {
    return decodeURIComponent(originalUrl.slice(markerIndex + marker.length).split("?")[0])
      .trim()
      .replace(/^\/+/, "");
  }

  const fromWildcard = req.params.splat ?? req.params[0];
  const parts = Array.isArray(fromWildcard)
    ? fromWildcard
    : fromWildcard !== undefined && fromWildcard !== null
      ? [fromWildcard]
      : [];

  return decodeURIComponent(parts.join("/")).trim().replace(/^\/+/, "");
};

/** Same-origin stream under /api/v1/runtime-pdf-viewer/file/... (hides backend host in the viewer). */
export async function serveLegacyPdfFile(req, res, next) {
  try {
    const fullPath = getStreamRelativePath(req);

    if (!fullPath) {
      throw new ApiError(404, "PDF not found");
    }

    const publicPath = `/${fullPath}`;
    const uploadedDocument = await resolveUploadedDocumentByPublicPath(publicPath);
    if (uploadedDocument) {
      return sendFileBuffer(res, uploadedDocument);
    }

    let filePath = null;
    let filename = fullPath;

    if (fullPath.startsWith("Runtime/uploads/")) {
      const relativePath = fullPath.slice("Runtime/uploads/".length);
      filePath = resolveRuntimePdfPath(relativePath);
      filename = relativePath;
    } else if (fullPath.startsWith("wp-content/uploads/")) {
      const relativePath = fullPath.slice("wp-content/uploads/".length);
      filePath = resolveWpContentPdfPath(relativePath);
      filename = relativePath;
    }

    if (filePath && fs.existsSync(filePath)) {
      return sendPdfFile(res, filePath, filename);
    }

    throw new ApiError(404, `PDF not found: ${fullPath}`);
  } catch (error) {
    return next(error);
  }
}

export async function servePublicDocument(req, res, next) {
  try {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }

    const pathname = String(req.path || "").split("?")[0];
    if (
      pathname.startsWith("/api") ||
      pathname === "/health" ||
      !isPublicDocumentPath(pathname)
    ) {
      return next();
    }

    const uploadedDocument = await resolveUploadedDocumentByPublicPath(pathname);
    if (!uploadedDocument) {
      return next();
    }

    if (req.method === "HEAD") {
      res.setHeader("Content-Type", uploadedDocument.contentType || "application/octet-stream");
      res.setHeader("Content-Length", uploadedDocument.buffer.length);
      return res.status(200).end();
    }

    return sendFileBuffer(res, uploadedDocument);
  } catch (error) {
    return next(error);
  }
}

export function resolveRuntimePdf(req, res, next) {
  try {
    const relativePath = decodeURIComponent(req.params.filename || "").trim();
    const filePath =
      resolveRuntimePdfPath(relativePath) ??
      resolveWpContentPdfPath(relativePath);

    if (!filePath || !fs.existsSync(filePath)) {
      throw new ApiError(404, `PDF not found: ${relativePath}`);
    }

    const mount = resolveRuntimePdfPath(relativePath)
      ? "/Runtime/uploads"
      : "/wp-content/uploads";

    return res.json(
      ApiResponse.success(
        {
          publicPath: relativePath,
          url: `${mount}/${relativePath.split("/").map(encodeURIComponent).join("/")}`,
        },
        "Runtime PDF resolved",
      ),
    );
  } catch (error) {
    return next(error);
  }
}

export function listRuntimePdfsHandler(req, res) {
  return res.json(ApiResponse.success(listRuntimePdfs(), "Runtime PDF mappings"));
}

export function getRuntimePdfMapStats(req, res) {
  return res.json(
    ApiResponse.success(
      {
        runtimeCount: Object.keys(RUNTIME_PDF_MAP).length,
        wpContentCount: Object.keys(WP_CONTENT_PDF_MAP).length,
      },
      "Runtime PDF map stats",
    ),
  );
}
