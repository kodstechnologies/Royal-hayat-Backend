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
import { verifyJWT } from "../../../middlewares/authMiddleware.js";
import checkPermission from "../../../middlewares/checkPermission.js";
import { PERMISSIONS } from "../../../constants/permission.js";

const router = express.Router();

router.use(verifyJWT);

router.post(
  "/",
  checkPermission(PERMISSIONS.ACHIEVEMENT_CREATE),
  upload.single("image"),
  validate(createAchievementValidator),
  uploadToS3("achievements", { image: "image" }),
  createAchievement
);

router.get(
  "/",
  checkPermission(PERMISSIONS.ACHIEVEMENT_VIEW_ALL),
  getAllAchievements
);

router.get(
  "/:id",
  checkPermission([
    PERMISSIONS.ACHIEVEMENT_VIEW,
    PERMISSIONS.ACHIEVEMENT_VIEW_ALL,
  ]),
  getAchievementById
);

router.put(
  "/:id",
  checkPermission(PERMISSIONS.ACHIEVEMENT_UPDATE),
  upload.single("image"),
  validate(updateAchievementValidator),
  uploadToS3("achievements", { image: "image" }),
  updateAchievement
);

router.delete(
  "/:id",
  checkPermission(PERMISSIONS.ACHIEVEMENT_DELETE),
  deleteAchievement
);

export default router;
