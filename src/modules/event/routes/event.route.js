import { Router } from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  deleteEvent,
} from "../controllers/event.controllers.js";
import { verifyJWT } from "../../../middlewares/authMiddleware.js";
import checkPermission from "../../../middlewares/checkPermission.js";
import { PERMISSIONS } from "../../../constants/permission.js";

const router = Router();

router.post("/", createEvent);

router.get(
  "/",
  verifyJWT,
  checkPermission(PERMISSIONS.EVENT_VIEW),
  getAllEvents,
);

router.get(
  "/:id",
  verifyJWT,
  checkPermission(PERMISSIONS.EVENT_VIEW),
  getEventById,
);

router.delete(
  "/:id",
  verifyJWT,
  checkPermission(PERMISSIONS.EVENT_DELETE),
  deleteEvent,
);

export default router;
