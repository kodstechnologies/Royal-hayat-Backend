import { Router } from 'express';
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  getDepartmentBySlug,
  updateDepartment,
  deleteDepartment
} from '../controllers/department.controller.js';
import upload from "../../../utils/multer.js";

const router = Router();

// Public routes
router.get('/', getAllDepartments);
router.get('/slug/:slug', getDepartmentBySlug);
router.get('/:id', getDepartmentById);

// Admin routes (add middleware later for authentication)
router.post('/', upload.single("image"), createDepartment);
router.put('/:id', upload.single("image"), updateDepartment);
router.delete('/:id', deleteDepartment);

export default router;
