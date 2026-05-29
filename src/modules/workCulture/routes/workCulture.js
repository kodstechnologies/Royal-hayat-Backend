// routes/workCulture.routes.js

import express from "express";

import {
  createWorkCulture,
  getAllWorkCultures,
  getWorkCultureById,
  updateWorkCulture,
  deleteWorkCulture,
} from "../controllers/workCulture.controller.js";

import validate from "../../../middlewares/validate.js";

import {
  createWorkCultureValidator,
  updateWorkCultureValidator,
} from "../validators/workCulture.validators.js";

import { upload } from "../../../utils/multer.js";
import { uploadToS3 } from "../../../utils/uploadToS3.js";

const router = express.Router();

// Create
router.post(
  "/",
  upload.array("images"),
  uploadToS3("work-culture", { images: "images" }, { arrayTargets: ["images"] }),
  validate(createWorkCultureValidator),
  createWorkCulture
);
  
// Get All
router.get("/", getAllWorkCultures);

// Get By ID
router.get("/:id", getWorkCultureById);

// Update
router.put(
  "/:id",
  upload.array("images"),
  uploadToS3("work-culture", { images: "images" }, { arrayTargets: ["images"] }),
  validate(updateWorkCultureValidator),
  updateWorkCulture
);

// Delete
router.delete("/:id", deleteWorkCulture);

export default router;