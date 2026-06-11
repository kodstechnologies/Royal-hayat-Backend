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
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${path.basename(filename || filePath)}"`,
  );
  return res.sendFile(filePath);
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
