import { Router } from 'express';
import {
  createSubspeciality,
  getAllSubspecialities,
  getSubspecialityById,
  updateSubspeciality,
  deleteSubspeciality,
} from '../controller/subspeciality.controller.js';
import { verifyJWT } from '../../../middlewares/authMiddleware.js';
import checkPermission from '../../../middlewares/checkPermission.js';
import { PERMISSIONS } from '../../../constants/permission.js';

const router = Router();

router.get('/', getAllSubspecialities);
router.get('/:id', getSubspecialityById);

router.post(
  '/',
  verifyJWT,
  checkPermission(PERMISSIONS.SUBSPECIALITY),
  createSubspeciality,
);

router.put(
  '/:id',
  verifyJWT,
  checkPermission([PERMISSIONS.SUBSPECIALITY_UPDATE, PERMISSIONS.SUBSPECIALITY_VIEW]),
  updateSubspeciality,
);

router.delete(
  '/:id',
  verifyJWT,
  checkPermission([PERMISSIONS.SUBSPECIALITY_DELETE, PERMISSIONS.SUBSPECIALITY_VIEW]),
  deleteSubspeciality,
);

export default router;
