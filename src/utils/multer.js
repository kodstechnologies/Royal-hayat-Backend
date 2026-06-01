import multer from "multer";
import ApiError from "./ApiError.js";

const multerOptions = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 25,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      // images
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      // videos
      "video/mp4",
      "video/webm",
      "video/quicktime",
      // documents
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Only image, video, and document files are allowed"), false);
    }
  },
};

export const upload = multer(multerOptions);

export const uploadAny = multer(multerOptions).any();

const flattenUploadedFiles = (files) => {
  if (!files) return [];
  if (Array.isArray(files)) return files;
  return Object.values(files).flat();
};

export const restrictUploadedFileFields =
  (allowedFieldNames = []) =>
  (req, res, next) => {
    const allowed = new Set(allowedFieldNames);
    const invalid = flattenUploadedFiles(req.files).find(
      (file) => !allowed.has(file.fieldname)
    );
    if (invalid) {
      return next(new ApiError(400, `Unexpected file field: ${invalid.fieldname}`));
    }
    return next();
  };

export default upload;
