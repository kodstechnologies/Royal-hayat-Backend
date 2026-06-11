import express from "express";
import {
  listRuntimePdfsHandler,
  resolveRuntimePdf,
  serveLegacyPdfFile,
} from "../controllers/runtimePdfViewer.controller.js";

const router = express.Router();

router.get("/", listRuntimePdfsHandler);
router.get("/file/*splat", serveLegacyPdfFile);
router.get("/resolve/*splat", (req, res, next) => {
  req.params.filename = req.params.splat ?? "";
  return resolveRuntimePdf(req, res, next);
});

export default router;
