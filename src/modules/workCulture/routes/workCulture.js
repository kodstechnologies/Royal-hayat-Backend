
import express from "express";

import {
  createWorkCulture,
  getAllWorkCultures,
  getWorkCultureById,
  updateWorkCulture,
  deleteWorkCulture,
} from "../controllers/workCulture.controller.js";

import validate from "../../../middlewares/validate.js";
import { verifyJWT } from "../../../middlewares/authMiddleware.js";
import checkPermission from "../../../middlewares/checkPermission.js";
import { PERMISSIONS } from "../../../constants/permission.js";

import {
  createWorkCultureValidator,
  updateWorkCultureValidator,
} from "../validators/workCulture.validators.js";

import { upload } from "../../../utils/multer.js";
import { uploadToS3 } from "../../../utils/uploadToS3.js";

const router = express.Router();

router.get("/", getAllWorkCultures);
router.get("/:id", getWorkCultureById);

router.post(
  "/",
  verifyJWT,
  checkPermission(PERMISSIONS.WORK_CULTURE_CREATE),
  upload.array("images"),
  uploadToS3("work-culture", { images: "images" }, { arrayTargets: ["images"] }),
  validate(createWorkCultureValidator),
  createWorkCulture,
);

router.put(
  "/:id",
  verifyJWT,
  checkPermission([PERMISSIONS.WORK_CULTURE_UPDATE, PERMISSIONS.WORK_CULTURE_VIEW]),
  upload.array("images"),
  uploadToS3("work-culture", { images: "images" }, { arrayTargets: ["images"] }),
  validate(updateWorkCultureValidator),
  updateWorkCulture,
);

router.delete(
  "/:id",
  verifyJWT,
  checkPermission([PERMISSIONS.WORK_CULTURE_DELETE, PERMISSIONS.WORK_CULTURE_VIEW]),
  deleteWorkCulture,
);

export default router;
