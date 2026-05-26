import express from "express";
import {
  createAchievement,
  getAllAchievements,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
} from "../controllers/achievement.controller.js";
import validate from "../../../middlewares/validate.js";
import {
  createAchievementValidator,
  updateAchievementValidator,
} from "../validators/achievement.validators.js";
import { upload } from "../../../utils/multer.js";
import { uploadToS3 } from "../../../utils/uploadToS3.js";

const router = express.Router();

router.post(
  "/",
  upload.single("image"),
  validate(createAchievementValidator),
  uploadToS3("achievements", { image: "image" }),
  createAchievement
);

router.get("/", getAllAchievements);

router.get("/:id", getAchievementById);

router.put(
  "/:id",
  upload.single("image"),
  validate(updateAchievementValidator),
  uploadToS3("achievements", { image: "image" }),
  updateAchievement
);

router.delete("/:id", deleteAchievement);

export default router;
