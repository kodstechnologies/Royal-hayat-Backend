import { Router } from 'express';
import {
  createSubspeciality,
  getAllSubspecialities,
  getSubspecialityById,
  updateSubspeciality,
  deleteSubspeciality,
} from '../controller/subspeciality.controller.js';

const router = Router();

router.post('/', createSubspeciality);
router.get('/', getAllSubspecialities);
router.get('/:id', getSubspecialityById);
router.put('/:id', updateSubspeciality);
router.delete('/:id', deleteSubspeciality);

export default router;
