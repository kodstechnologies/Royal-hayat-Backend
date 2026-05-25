import { putObject } from "./putObject.js";
import ApiError from "./ApiError.js";

/**
 * Middleware: upload multer files to S3 and attach URLs to req.body.
 *
 * @param {string} folder          - S3 folder/prefix
 * @param {Object} fieldMap        - maps multer fieldname → req.body key  e.g. { file: "file", img: "img" }
 * @param {Object} options
 * @param {string[]} options.arrayTargets - fieldnames that should accumulate as arrays
 */
export const uploadToS3 =
  (folder = "uploads", fieldMap = { img: "img" }, options = {}) =>
  async (req, res, next) => {
    try {
      if (!req.file && !req.files) return next();

      // ── single file ──────────────────────────────────────────────────────
      if (req.file) {
        const { url, key } = await putObject(req.file, folder);
        const targetField = fieldMap[req.file.fieldname] || req.file.fieldname;
        req.body[targetField] = url;
        req.body[`${targetField}Key`] = key;
        return next();
      }

      // ── multiple files ───────────────────────────────────────────────────
      const arrayTargets = new Set(options.arrayTargets || []);
      const files = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files).flat();

      for (const file of files) {
        const { url, key } = await putObject(file, folder);
        const targetField = fieldMap[file.fieldname] || file.fieldname;

        // documents / rosDocuments → array of objects
        if (targetField === "documents" || targetField === "rosDocuments") {
          if (!Array.isArray(req.body[targetField])) req.body[targetField] = [];
          req.body[targetField].push({
            url,
            name: file.originalname || "document",
            uploadedAt: new Date(),
          });
          continue;
        }

        // single img (not in arrayTargets)
        if (targetField === "img" && !arrayTargets.has(targetField)) {
          req.body[targetField] = url;
          req.body[`${targetField}Key`] = key;
          continue;
        }

        // img or any arrayTarget → accumulate as URL array
        if (targetField === "img" || arrayTargets.has(targetField)) {
          if (!Array.isArray(req.body[targetField])) {
            req.body[targetField] =
              req.body[targetField] == null || req.body[targetField] === ""
                ? []
                : [req.body[targetField]];
          }
          req.body[targetField].push(url);
          continue;
        }

        // relatedInformationImages → URL array
        if (targetField === "relatedInformationImages") {
          if (!Array.isArray(req.body.relatedInformationImages)) {
            req.body.relatedInformationImages =
              req.body.relatedInformationImages == null ||
              req.body.relatedInformationImages === ""
                ? []
                : [req.body.relatedInformationImages];
          }
          req.body.relatedInformationImages.push(url);
          continue;
        }

        // default → single value
        req.body[targetField] = url;
        req.body[`${targetField}Key`] = key;
      }

      next();
    } catch (err) {
      next(new ApiError(500, err?.message || "Failed to upload file"));
    }
  };
