import { Router } from 'express';
import {
  createCatagory,
  getAllCatagories,
  getCatagoriesWithDepartmentsAndDoctors,
  getCatagoryById,
  updateCatagory,
  deleteCatagory,
} from '../controller/catagory.controller.js';
import { verifyJWT } from '../../../middlewares/authMiddleware.js';
import checkPermission from '../../../middlewares/checkPermission.js';
import { PERMISSIONS } from '../../../constants/permission.js';

const router = Router();

router.get('/', getAllCatagories);
router.get('/with-departments-doctors', getCatagoriesWithDepartmentsAndDoctors);
router.get('/:id', getCatagoryById);

router.post(
  '/',
  verifyJWT,
  checkPermission(PERMISSIONS.CATAGORY_CREATE,),
  createCatagory,
);

router.put(
  '/:id',
  verifyJWT,
  checkPermission([PERMISSIONS.CATAGORY_UPDATE, PERMISSIONS.CATAGORY_VIEW]),
  updateCatagory,
);

router.delete(
  '/:id',
  verifyJWT,
  checkPermission([PERMISSIONS.CATAGORY_DELETE, PERMISSIONS.CATAGORY_VIEW]),
  deleteCatagory,
);

export default router;
