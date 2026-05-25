// routes/document.routes.js

import express from "express";

const router = express.Router();

import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage });

import {
    createDocument,
    getAllDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument
} from "../controller/document.controller.js";

router.post(
    "/create",
    upload.single("file"),
    createDocument
);

router.get(
    "/all",
    getAllDocuments
);

router.get(
    "/:id",
    getDocumentById
);

router.put(
    "/update/:id",
    upload.single("file"),
    updateDocument
);

router.delete(
    "/delete/:id",
    deleteDocument
);

export default router;