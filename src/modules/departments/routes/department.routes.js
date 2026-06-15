import { Router } from 'express';
import {
  createDepartment,
  getAllDepartments,
  getDepartmentSubspecialitiesAndDoctors,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} from '../controllers/department.controller.js';
import upload from "../../../utils/multer.js";

const router = Router();
  
router.get('/', getAllDepartments);
router.get('/:id/subspecialities-doctors', getDepartmentSubspecialitiesAndDoctors);
router.get('/:id', getDepartmentById);

router.post('/', upload.single("image"), createDepartment);
router.put('/:id', upload.single("image"), updateDepartment);
router.delete('/:id', deleteDepartment);

export default router;
