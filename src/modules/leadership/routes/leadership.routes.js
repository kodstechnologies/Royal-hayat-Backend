
import express from "express";

import {
  createLeadership,
  getAllLeadership,
  getLeadershipById,
  updateLeadership,
  deleteLeadership,
} from "../controllers/leadership.controller.js";

import validate from "../../../middlewares/validate.js";
import { verifyJWT } from "../../../middlewares/authMiddleware.js";
import checkPermission from "../../../middlewares/checkPermission.js";
import { PERMISSIONS } from "../../../constants/permission.js";

import {
  createLeadershipValidator,
  updateLeadershipValidator,
} from "../validators/leadership.validator.js";

import { upload } from "../../../utils/multer.js";
import { uploadToS3 } from "../../../utils/uploadToS3.js";

const ARRAY_FIELDS = ["description", "descriptionArabic"];

const normalizeLeadershipBody = (req, res, next) => {
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

router.get("/", getAllLeadership);
router.get("/:id", getLeadershipById);

router.post(
  "/",
  verifyJWT,
  checkPermission(PERMISSIONS.LEADERSHIP_CREATE),
  upload.single("image"),
  normalizeLeadershipBody,
  validate(createLeadershipValidator),
  uploadToS3("leadership", { image: "image" }),
  createLeadership,
);

router.put(
  "/:id",
  verifyJWT,
  checkPermission([PERMISSIONS.LEADERSHIP_UPDATE, PERMISSIONS.LEADERSHIP_VIEW]),
  upload.single("image"),
  normalizeLeadershipBody,
  validate(updateLeadershipValidator),
  uploadToS3("leadership", { image: "image" }),
  updateLeadership,
);

router.delete(
  "/:id",
  verifyJWT,
  checkPermission([PERMISSIONS.LEADERSHIP_DELETE, PERMISSIONS.LEADERSHIP_VIEW]),
  deleteLeadership,
);

export default router;
