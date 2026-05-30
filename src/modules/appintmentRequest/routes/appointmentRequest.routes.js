import { Router } from 'express';
import {
  createAppointmentRequest,
  getAllAppointmentRequests,
  getAppointmentRequestById,
  updateAppointmentRequest,
  deleteAppointmentRequest,
  acceptAppointmentRequest,
  cancelAppointmentRequest,
} from '../controller/appointmentRequest.controller.js';
import { verifyJWT } from '../../../middlewares/authMiddleware.js';
import checkPermission from '../../../middlewares/checkPermission.js';
import { PERMISSIONS } from '../../../constants/permission.js';

const router = Router();

const appointmentRequestListPermissions = [
  PERMISSIONS.APPOINTMENT_REQUEST_VIEW_ALL,
  PERMISSIONS.APPOINTMENT_REQUEST_VIEW,
 
];

const appointmentRequestViewPermissions = [
  PERMISSIONS.APPOINTMENT_REQUEST_VIEW,
  PERMISSIONS.APPOINTMENT_REQUEST_VIEW_ALL,

];

// Public — patient / website booking flow
router.post('/', createAppointmentRequest);

router.get(
  '/',
  verifyJWT,
  checkPermission(appointmentRequestListPermissions),
  getAllAppointmentRequests,
);

router.patch(
  '/accept/:id',
  verifyJWT,
  checkPermission(PERMISSIONS.APPOINTMENT_REQUEST_ACCEPT),
  acceptAppointmentRequest,
);

router.patch(
  '/cancel/:id',
  verifyJWT,
  checkPermission([
   
    PERMISSIONS.APPOINTMENT_REQUEST_REJECT,
  ]),
  cancelAppointmentRequest,
);

router.get(
  '/:id',
  verifyJWT,
  checkPermission(appointmentRequestViewPermissions),
  getAppointmentRequestById,
);

router.put(
  '/:id',
  verifyJWT,
  checkPermission([
    PERMISSIONS.APPOINTMENT_VIEW_ALL,
 
  ]),
  updateAppointmentRequest,
);

router.delete(
  '/:id',
  verifyJWT,
  checkPermission(PERMISSIONS.APPOINTMENT_CANCEL),
  deleteAppointmentRequest,
);

export default router;
