import express from "express";
import { serveWpContentPdf } from "../controllers/runtimePdfViewer.controller.js";

const router = express.Router();

router.get("/*splat", serveWpContentPdf);

export default router;
