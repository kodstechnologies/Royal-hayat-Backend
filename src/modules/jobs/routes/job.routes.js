import { Router } from 'express';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  
  getLocations,
  getTypes
} from '../controllers/job.controller.js';
import { createJobApplication } from '../controllers/jobApplication.controller.js';
import upload from '../../../utils/multer.js';

const router = Router();

// Public routes
router.get('/', getAllJobs);
// router.get('/departments', getDepartments);
router.get('/locations', getLocations);
router.get('/types', getTypes);
router.post('/apply', upload.single('resume'), createJobApplication);
router.get('/:id', getJobById);

// Admin routes (add middleware later for authentication)
router.post('/', createJob);
router.put('/:id', updateJob);  
router.delete('/:id', deleteJob);

export default router;
