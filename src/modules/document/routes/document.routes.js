// routes/document.routes.js

import express from "express";
import multer from "multer";
import {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from "../controller/document.controller.js";
import { verifyJWT } from "../../../middlewares/authMiddleware.js";
import checkPermission from "../../../middlewares/checkPermission.js";
import { PERMISSIONS } from "../../../constants/permission.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/create",
  verifyJWT,
  checkPermission(PERMISSIONS.DOCUMENT_CREATE),
  upload.single("file"),
  createDocument,
);

router.get(
  "/all",
  verifyJWT,
  checkPermission(PERMISSIONS.DOCUMENT_VIEW),
  getAllDocuments,
);

router.get(
  "/:id",
  verifyJWT,
  checkPermission(PERMISSIONS.DOCUMENT_VIEW),
  getDocumentById,
);

router.put(
  "/update/:id",
  verifyJWT,
  checkPermission([PERMISSIONS.DOCUMENT_UPDATE, PERMISSIONS.DOCUMENT_VIEW]),
  upload.single("file"),
  updateDocument,
);

router.delete(
  "/delete/:id",
  verifyJWT,
  checkPermission([PERMISSIONS.DOCUMENT_DELETE, PERMISSIONS.DOCUMENT_VIEW]),
  deleteDocument,
);

export default router;
