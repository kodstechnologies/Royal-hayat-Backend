import { Router } from 'express';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getLocations,
  getTypes,
} from '../controllers/job.controller.js';
import { createJobApplication } from '../controllers/jobApplication.controller.js';
import upload from '../../../utils/multer.js';
import { verifyJWT, optionalVerifyJWT } from '../../../middlewares/authMiddleware.js';
import checkPermission from '../../../middlewares/checkPermission.js';
import { PERMISSIONS } from '../../../constants/permission.js';

const router = Router();

router.get('/', getAllJobs);
router.get('/locations', getLocations);
router.get('/types', getTypes);
router.post('/apply', upload.single('resume'), createJobApplication);
router.get('/:id', optionalVerifyJWT, getJobById);

router.post(
  '/',
  verifyJWT,
  checkPermission(PERMISSIONS.JOB_CREATE),
  createJob,
);

router.put(
  '/:id',
  verifyJWT,
  checkPermission([PERMISSIONS.JOB_UPDATE, PERMISSIONS.JOB_VIEW]),
  updateJob,
);

router.delete(
  '/:id',
  verifyJWT,
  checkPermission([PERMISSIONS.JOB_DELETE, PERMISSIONS.JOB_VIEW]),
  deleteJob,
);

export default router;
