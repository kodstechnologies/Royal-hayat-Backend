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
import { verifyJWT } from '../../../middlewares/authMiddleware.js';
import checkPermission from '../../../middlewares/checkPermission.js';
import { PERMISSIONS } from '../../../constants/permission.js';

const router = Router();
  
router.get('/', getAllDepartments);
router.get('/:id/subspecialities-doctors', getDepartmentSubspecialitiesAndDoctors);
router.get('/:id', getDepartmentById);

router.post(
  '/',
  verifyJWT,
  checkPermission(PERMISSIONS.DEPARTMENT),
  upload.single("image"),
  createDepartment,
);

router.put(
  '/:id',
  verifyJWT,
  checkPermission([PERMISSIONS.DEPARTMENT_UPDATE, PERMISSIONS.DEPARTMENT_VIEW]),
  upload.single("image"),
  updateDepartment,
);

router.delete(
  '/:id',
  verifyJWT,
  checkPermission([PERMISSIONS.DEPARTMENT_DELETE, PERMISSIONS.DEPARTMENT_VIEW]),
  deleteDepartment,
);

export default router;
