import express from "express";
import {
  listRuntimePdfsHandler,
  resolveRuntimePdf,
} from "../controllers/runtimePdfViewer.controller.js";

const router = express.Router();

router.get("/", listRuntimePdfsHandler);
router.get("/resolve/*splat", (req, res, next) => {
  req.params.filename = req.params.splat ?? "";
  return resolveRuntimePdf(req, res, next);
});

export default router;
