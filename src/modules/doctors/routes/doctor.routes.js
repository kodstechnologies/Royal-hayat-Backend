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
import { upload } from "../../../utils/multer.js";
import { uploadToS3 } from "../../../utils/uploadToS3.js";

const router = Router();

router.get('/', getAllDoctors);
router.get('/departments/list', getDepartments);
router.get('/department/:department', getDoctorsByDepartment);
router.get('/subspeciality/:subspecialityId', getDoctorsBySubspeciality);

router.post(
  '/',
  upload.single('image'),
  uploadToS3('doctors', { image: 'image' }),
  createDoctor,
);
router.put(
  '/:id',
  upload.single('image'),
  uploadToS3('doctors', { image: 'image' }),
  updateDoctor,
);
router.delete('/:id', deleteDoctor);
router.get('/:id', getDoctorById);
export default router;
