import { Router } from 'express';
import {
  createJobApplication,
  getAllJobApplications,
  getJobApplicationById,
  getApplicationsByJobId,
  updateJobApplication,
  deleteJobApplication
} from '../controllers/jobApplication.controller.js';
import upload from '../../../utils/multer.js';
import { verifyJWT } from '../../../middlewares/authMiddleware.js';
import checkPermission from '../../../middlewares/checkPermission.js';
import { PERMISSIONS } from '../../../constants/permission.js';

const router = Router();

const jobApplicationViewPermissions = [
  PERMISSIONS.JOB_APPLICATION_VIEW,
  PERMISSIONS.JOB_VIEW,
];

// Public — candidate / website application
router.post('/', upload.single('resume'), createJobApplication);

router.get(
  '/',
  verifyJWT,
  checkPermission(jobApplicationViewPermissions),
  getAllJobApplications
);

router.get(
  '/job/:jobId',
  verifyJWT,
  checkPermission(jobApplicationViewPermissions),
  getApplicationsByJobId
);

router.get(
  '/:id',
  verifyJWT,
  checkPermission(jobApplicationViewPermissions),
  getJobApplicationById
);

router.put(
  '/:id',
  verifyJWT,
  checkPermission([PERMISSIONS.JOB_APPLICATION_UPDATE, PERMISSIONS.JOB_APPLICATION_VIEW]),
  updateJobApplication
);

router.delete(
  '/:id',
  verifyJWT,
  checkPermission([PERMISSIONS.JOB_APPLICATION_DELETE, PERMISSIONS.JOB_APPLICATION_VIEW]),
  deleteJobApplication
);

export default router;
