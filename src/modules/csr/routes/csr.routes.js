import express from "express";

import {
  createCSR,
  getAllCSR,
  getCSRById,
  updateCSR,
  deleteCSR,
} from "../controllers/csr.controller.js";

import validate from "../../../middlewares/validate.js";

import {
  createCSRValidator,
  updateCSRValidator,
} from "../validators/csr.validator.js";

import { upload } from "../../../utils/multer.js";
import { uploadToS3 } from "../../../utils/uploadToS3.js";

const router = express.Router();

// Create
router.post(
  "/",
  upload.array("images"),
  uploadToS3("csr", { images: "images" }, { arrayTargets: ["images"] }),
  validate(createCSRValidator),
  createCSR
);

// Get All
router.get("/", getAllCSR);

// Get By ID
router.get("/:id", getCSRById);

// Update
router.put(
  "/:id",
  upload.array("images"),
  uploadToS3("csr", { images: "images" }, { arrayTargets: ["images"] }),
  validate(updateCSRValidator),
  updateCSR
);

// Delete
router.delete("/:id", deleteCSR);

export default router;