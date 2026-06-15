import express from "express";

import {
  createCSR,
  getAllCSR,
  getCSRById,
  updateCSR,
  deleteCSR,
} from "../controllers/csr.controller.js";

import validate from "../../../middlewares/validate.js";
import { verifyJWT } from "../../../middlewares/authMiddleware.js";
import checkPermission from "../../../middlewares/checkPermission.js";
import { PERMISSIONS } from "../../../constants/permission.js";

import {
  createCSRValidator,
  updateCSRValidator,
} from "../validators/csr.validator.js";

import { upload } from "../../../utils/multer.js";
import { uploadToS3 } from "../../../utils/uploadToS3.js";

const ARRAY_FIELDS = ["description", "descriptionArabic"];

const normalizeCSRBody = (req, res, next) => {
  ARRAY_FIELDS.forEach((field) => {
    if (req.body[field] === undefined) return;

    const raw = req.body[field];

    if (Array.isArray(raw)) {
      req.body[field] = raw.map((s) => String(s).trim()).filter(Boolean);
      return;
    }

    if (typeof raw === "string") {
      const trimmed = raw.trim();

      if (!trimmed) {
        req.body[field] = [];
        return;
      }

      if (trimmed.startsWith("[")) {
        try {
          const parsed = JSON.parse(trimmed);
          req.body[field] = Array.isArray(parsed)
            ? parsed.map((s) => String(s).trim()).filter(Boolean)
            : [];
        } catch {
          req.body[field] = [trimmed];
        }
        return;
      }

      req.body[field] = [trimmed];
    }
  });

  next();
};

const router = express.Router();

router.get("/", getAllCSR);
router.get("/:id", getCSRById);

router.post(
  "/",
  verifyJWT,
  checkPermission(PERMISSIONS.CSR_CREATE),
  upload.array("images"),
  uploadToS3("csr", { images: "images" }, { arrayTargets: ["images"] }),
  normalizeCSRBody,
  validate(createCSRValidator),
  createCSR,
);

router.put(
  "/:id",
  verifyJWT,
  checkPermission([PERMISSIONS.CSR_UPDATE, PERMISSIONS.CSR_VIEW]),
  upload.array("images"),
  uploadToS3("csr", { images: "images" }, { arrayTargets: ["images"] }),
  normalizeCSRBody,
  validate(updateCSRValidator),
  updateCSR,
);

router.delete(
  "/:id",
  verifyJWT,
  checkPermission([PERMISSIONS.CSR_DELETE, PERMISSIONS.CSR_VIEW]),
  deleteCSR,
);

export default router;
