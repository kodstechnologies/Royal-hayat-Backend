import express from "express";
import multer from "multer";
import { verifyJWT } from "../../../middlewares/authMiddleware.js";
import {
  createFolder,
  deleteFile,
  deleteFolder,
  getFolderById,
  listFolders,
  renameFolder,
  updateFile,
  uploadFiles,
} from "../controller/fileManager.controller.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype?.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed"));
  },
});

router.use(verifyJWT);

router.get("/folders", listFolders);
router.post("/folders", createFolder);
router.get("/folders/:id", getFolderById);
router.patch("/folders/:id", renameFolder);
router.delete("/folders/:id", deleteFolder);

router.post(
  "/folders/:id/files",
  upload.array("files", 20),
  uploadFiles
);

router.patch(
  "/folders/:id/files/:fileId",
  upload.single("file"),
  updateFile
);

router.delete("/folders/:id/files/:fileId", deleteFile);

export default router;
