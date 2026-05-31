// routes/leadership.routes.js

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

const router = express.Router();

// Public — website
router.get("/", getAllLeadership);
router.get("/:id", getLeadershipById);

router.post(
  "/",
  verifyJWT,
  checkPermission(PERMISSIONS.LEADERSHIP_CREATE),
  upload.single("image"),
  validate(createLeadershipValidator),
  uploadToS3("leadership", { image: "image" }),
  createLeadership,
);

router.put(
  "/:id",
  verifyJWT,
  checkPermission([PERMISSIONS.LEADERSHIP_UPDATE, PERMISSIONS.LEADERSHIP_VIEW]),
  upload.single("image"),
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
