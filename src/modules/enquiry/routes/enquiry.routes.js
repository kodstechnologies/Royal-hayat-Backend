import { Router } from 'express';
import {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry
} from '../controller/enquiry.controller.js';
import { verifyJWT } from '../../../middlewares/authMiddleware.js';
import checkPermission from '../../../middlewares/checkPermission.js';
import { PERMISSIONS } from '../../../constants/permission.js';

const router = Router();

// Public — patient / website enquiry form
router.post('/', createEnquiry);

router.get(
  '/',
  verifyJWT,
  checkPermission(PERMISSIONS.ENQUIRY_VIEW),
  getAllEnquiries
);

router.get(
  '/:id',
  verifyJWT,
  checkPermission(PERMISSIONS.ENQUIRY_VIEW),
  getEnquiryById
);

router.put(
  '/:id',
  verifyJWT,
  checkPermission([PERMISSIONS.ENQUIRY_UPDATE,PERMISSIONS.ENQUIRY_VIEW]),
  updateEnquiry
);

router.delete(
  '/:id',
  verifyJWT,
  checkPermission([PERMISSIONS.ENQUIRY_DELETE, PERMISSIONS.ENQUIRY_VIEW]),  
  deleteEnquiry
);

export default router;
