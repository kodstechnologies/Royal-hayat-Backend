import { Router } from 'express';
import {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry
} from '../controller/enquiry.controller.js';

const router = Router();

router.post('/', createEnquiry);
router.get('/', getAllEnquiries);
router.get('/:id', getEnquiryById);
router.put('/:id', updateEnquiry);
router.delete('/:id', deleteEnquiry);

export default router;
