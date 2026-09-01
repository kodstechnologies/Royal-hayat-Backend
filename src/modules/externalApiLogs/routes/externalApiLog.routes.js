import { Router } from 'express';
import { verifyJWT } from '../../../middlewares/authMiddleware.js';
import checkPermission from '../../../middlewares/checkPermission.js';
import { PERMISSIONS } from '../../../constants/permission.js';
import {
  getAllApiLogs,
  getApiLogById,
  getApiLogsByCivilId,
  getApiLogsByPatientId,
  getStats,
} from '../controllers/externalApiLog.controller.js';

const router = Router();

// All routes require authentication and CHAT_LOG_VIEW permission (we're reusing this for API logs)
// You may want to create a new permission like API_LOG_VIEW
const apiLogAuth = [verifyJWT, checkPermission(PERMISSIONS.CHAT_LOG_VIEW)];

// Get all API logs with pagination and filters
router.get('/', ...apiLogAuth, getAllApiLogs);

// Get API log statistics
router.get('/stats', ...apiLogAuth, getStats);

// Get API logs by civil ID
router.get('/civil/:civilId', ...apiLogAuth, getApiLogsByCivilId);

// Get API logs by patient ID
router.get('/patient/:patientId', ...apiLogAuth, getApiLogsByPatientId);

// Get a single API log by ID
router.get('/:id', ...apiLogAuth, getApiLogById);

export default router;
