
import express from "express";

import {
  createFeaturedDoctor,
  getFeaturedDoctors,
  updateFeaturedDoctor,
  deleteFeaturedDoctor,
} from "../controllers/featuredDoctor.controller.js";

import validate from "../../../middlewares/validate.js";

import {
  createFeaturedDoctorValidator,
  updateFeaturedDoctorValidator,
} from "../validators/featuredDoctor.validators.js";

const router = express.Router();

router.post(
  "/",
  validate(createFeaturedDoctorValidator),
  createFeaturedDoctor
);

router.get("/", getFeaturedDoctors);

router.put(
  "/:id",
  validate(updateFeaturedDoctorValidator),
  updateFeaturedDoctor
);

router.delete("/:id", deleteFeaturedDoctor);

export default router;