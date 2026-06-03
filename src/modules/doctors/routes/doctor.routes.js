import { Router } from 'express';
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  getDoctorsByDepartment,
  getDoctorsBySubspeciality,
  updateDoctor,
  deleteDoctor,
  getDepartments,
} from '../controllers/doctor.controller.js';
import upload from "../../../utils/multer.js";

const router = Router();

router.get('/', getAllDoctors);
router.get('/departments/list', getDepartments);
router.get('/department/:department', getDoctorsByDepartment);
router.get('/subspeciality/:subspecialityId', getDoctorsBySubspeciality);

router.post('/', upload.single("image"), createDoctor);
router.put('/:id', upload.single("image"), updateDoctor);
router.delete('/:id', deleteDoctor);
router.get('/:id', getDoctorById);
export default router;
