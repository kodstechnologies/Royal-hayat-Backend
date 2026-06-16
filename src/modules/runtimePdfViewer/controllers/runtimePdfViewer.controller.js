import fs from "fs";
import path from "path";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
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

export function serveRuntimePdf(req, res, next) {
  try {
    const relativePath = getRelativePath(req);
    const filePath = resolveRuntimePdfPath(relativePath);

    if (!filePath || !fs.existsSync(filePath)) {
      throw new ApiError(404, `PDF not found: ${relativePath}`);
    }

    return sendPdfFile(res, filePath, relativePath);
  } catch (error) {
    return next(error);
  }
}

export function serveWpContentPdf(req, res, next) {
  try {
    const relativePath = getRelativePath(req);
    const filePath = resolveWpContentPdfPath(relativePath);

    if (!filePath || !fs.existsSync(filePath)) {
      throw new ApiError(404, `PDF not found: ${relativePath}`);
    }

    return sendPdfFile(res, filePath, relativePath);
  } catch (error) {
    return next(error);
  }
}

/** Same-origin stream under /api/v1/runtime-pdf-viewer/file/... (hides backend host in the viewer). */
export function serveLegacyPdfFile(req, res, next) {
  try {
    const fromWildcard = req.params.splat ?? req.params[0];
    const parts = Array.isArray(fromWildcard)
      ? fromWildcard
      : fromWildcard !== undefined && fromWildcard !== null
        ? [fromWildcard]
        : [];
    const fullPath = decodeURIComponent(parts.join("/"))
      .trim()
      .replace(/^\/+/, "");

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

    if (!filePath || !fs.existsSync(filePath)) {
      throw new ApiError(404, `PDF not found: ${fullPath}`);
    }

    return sendPdfFile(res, filePath, filename);
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
