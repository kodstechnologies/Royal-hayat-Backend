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

router.get("/", getAllAchievements);
router.get("/:id", getAchievementById);

router.post(
  "/",
  verifyJWT,
  checkPermission([PERMISSIONS.ACHIEVEMENT_CREATE, PERMISSIONS.ACHIEVEMENT_VIEW]),
  upload.single("image"),
  validate(createAchievementValidator),
  uploadToS3("achievements", { image: "image" }),
  createAchievement,
);

router.put(
  "/:id",
  verifyJWT,
  checkPermission([PERMISSIONS.ACHIEVEMENT_UPDATE, PERMISSIONS.ACHIEVEMENT_VIEW]),
  upload.single("image"),
  validate(updateAchievementValidator),
  uploadToS3("achievements", { image: "image" }),
  updateAchievement,
);

router.delete(
  "/:id",
  verifyJWT,
  checkPermission([PERMISSIONS.ACHIEVEMENT_DELETE, PERMISSIONS.ACHIEVEMENT_VIEW]),
  deleteAchievement,
);

export default router;
