import express from "express";
import { serveRuntimePdf } from "../controllers/runtimePdfViewer.controller.js";

const router = express.Router();

router.get("/*splat", serveRuntimePdf);

export default router;
