import { Router } from 'express';
import {
  createCatagory,
  getAllCatagories,
  getCatagoriesWithDepartmentsAndDoctors,
  getCatagoryById,
  updateCatagory,
  deleteCatagory,
} from '../controller/catagory.controller.js';

const router = Router();

router.post('/', createCatagory);
router.get('/', getAllCatagories);
router.get('/with-departments-doctors', getCatagoriesWithDepartmentsAndDoctors);
router.get('/:id', getCatagoryById);
router.put('/:id', updateCatagory);
router.delete('/:id', deleteCatagory);

export default router;
