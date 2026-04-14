import multer from "multer";
import fs from "fs-extra";
import path from "path";

/**
 * Temp upload directory (service-owned)
 */
const TEMP_UPLOAD_DIR = "tmp/uploads";
fs.ensureDirSync(TEMP_UPLOAD_DIR);

/**
 * Disk storage (best for large files & KYC docs)
 */
const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, TEMP_UPLOAD_DIR);
    },
    filename: (_, file, cb) => {
        const safeName = file.originalname
            .replace(/\s+/g, "_")
            .replace(/[^\w.\-]/g, "")
            .toLowerCase();

        cb(null, `${Date.now()}-${safeName}`);
    },
});

/**
 * Multer instance
 * ❌ No fileFilter here
 * ✔ File validation happens in controller AFTER Joi
 */
const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB (adjust per service)
    },
});

export default upload;
