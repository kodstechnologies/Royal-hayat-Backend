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

  PERMISSIONS.APPOINTMENT_REQUEST_VIEW,
 
];

const appointmentRequestViewPermissions = [
  PERMISSIONS.APPOINTMENT_REQUEST_VIEW,

];

// Public — patient / website booking flow
router.post('/', createAppointmentRequest);

router.get(
  '/',
  verifyJWT,
  checkPermission( PERMISSIONS.APPOINTMENT_REQUEST_VIEW),
  getAllAppointmentRequests,
);

router.patch(
  '/accept/:id',
  verifyJWT,
  checkPermission([PERMISSIONS.APPOINTMENT_REQUEST_ACCEPT, PERMISSIONS.APPOINTMENT_REQUEST_VIEW]),
  acceptAppointmentRequest,
);

router.patch(
  '/cancel/:id',
  verifyJWT,
  checkPermission([
   
    PERMISSIONS.APPOINTMENT_REQUEST_REJECT, 
    PERMISSIONS.APPOINTMENT_REQUEST_VIEW,
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
    PERMISSIONS.APPOINTMENT_REQUEST_VIEW,
    PERMISSIONS.APPOINTMENT_REQUEST_ACCEPT,
  ]),
  updateAppointmentRequest,
);

router.delete(
  '/:id',
  verifyJWT,
  checkPermission([PERMISSIONS.APPOINTMENT_REQUEST_REJECT, PERMISSIONS.APPOINTMENT_REQUEST_VIEW]),
  deleteAppointmentRequest,
);

export default router;
