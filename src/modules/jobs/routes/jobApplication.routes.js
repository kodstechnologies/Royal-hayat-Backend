import { Router } from 'express';
import {
  createJobApplication,
  getAllJobApplications,
  getJobApplicationById,
  updateJobApplication,
  deleteJobApplication
} from '../controllers/jobApplication.controller.js';
import upload from "../../../utils/multer.js";

const router = Router();

// Public routes
router.post('/', upload.single("resume"), createJobApplication);

// Admin routes (add middleware later for authentication)
router.get('/', getAllJobApplications);
router.get('/:id', getJobApplicationById);
router.put('/:id', updateJobApplication);
router.delete('/:id', deleteJobApplication);

export default router;
