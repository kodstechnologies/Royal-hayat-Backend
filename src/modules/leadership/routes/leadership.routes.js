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

import {
  createLeadershipValidator,
  updateLeadershipValidator,
} from "../validators/leadership.validator.js";

import upload from "../../../utils/multer.js";

const router = express.Router();

// Create
router.post(
  "/",
  upload.single("image"),
  validate(createLeadershipValidator),
  createLeadership
);

// Get All
router.get("/", getAllLeadership);

// Get By ID
router.get("/:id", getLeadershipById);

// Update
router.put(
  "/:id",
  upload.single("image"),
  validate(updateLeadershipValidator),
  updateLeadership
);

// Delete
router.delete("/:id", deleteLeadership);

export default router;