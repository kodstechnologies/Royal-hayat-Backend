
import express from "express";
import { upload } from "../../../utils/multer.js";
import {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  resolvePublicDocumentMeta,
} from "../controller/document.controller.js";
import { verifyJWT } from "../../../middlewares/authMiddleware.js";
import checkPermission from "../../../middlewares/checkPermission.js";
import { PERMISSIONS } from "../../../constants/permission.js";

const router = express.Router();

router.get("/public/resolve", resolvePublicDocumentMeta);

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

const updateDocumentHandlers = [
  verifyJWT,
  checkPermission([PERMISSIONS.DOCUMENT_UPDATE, PERMISSIONS.DOCUMENT_VIEW]),
  upload.single("file"),
  updateDocument,
];

router.put("/update/:id", ...updateDocumentHandlers);
router.post("/update/:id", ...updateDocumentHandlers);

router.delete(
  "/delete/:id",
  verifyJWT,
  checkPermission([PERMISSIONS.DOCUMENT_DELETE, PERMISSIONS.DOCUMENT_VIEW]),
  deleteDocument,
);

export default router;
