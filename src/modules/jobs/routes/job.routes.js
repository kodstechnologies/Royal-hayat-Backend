import { Router } from 'express';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getDepartments,
  getLocations,
  getTypes,
  getClassifications
} from '../controllers/job.controller.js';

const router = Router();

// Public routes
router.get('/', getAllJobs);
router.get('/departments', getDepartments);
router.get('/locations', getLocations);
router.get('/types', getTypes);
router.get('/classifications', getClassifications);
router.get('/:id', getJobById);

// Admin routes (add middleware later for authentication)
router.post('/', createJob);
router.put('/:id', updateJob);  
router.delete('/:id', deleteJob);

export default router;
