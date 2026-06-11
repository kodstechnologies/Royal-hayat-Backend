import { Router } from 'express';
import {
  createAppointmentBookingRecord,
  getAllAppointmentBookingRecords,
  getAppointmentBookingRecordById,
  updateAppointmentBookingRecord,
  deleteAppointmentBookingRecord,
  getAppointmentCounts,
} from '../controller/appointmentBookingRecord.controller.js';
import { verifyJWT } from '../../../middlewares/authMiddleware.js';
import checkPermission from '../../../middlewares/checkPermission.js';
import { PERMISSIONS } from '../../../constants/permission.js';

const router = Router();

const appointmentBookingManagePermissions = [
  PERMISSIONS.APPOINTMENT_BOOKING_VIEW,
  PERMISSIONS.APPOINTMENT_REQUEST_ACCEPT,
  PERMISSIONS.APPOINTMENT_REQUEST_REJECT,
];

router.use(verifyJWT);

router.post(
  '/',

  createAppointmentBookingRecord,
);

router.get(
  '/',
  checkPermission( PERMISSIONS.APPOINTMENT_BOOKING_VIEW),
  getAllAppointmentBookingRecords,
);

router.get(
  '/counts',
  
  getAppointmentCounts,
);

router.get(
  '/:id',
  checkPermission( PERMISSIONS.APPOINTMENT_BOOKING_VIEW),
  getAppointmentBookingRecordById,
);

router.put(
  '/:id',
  checkPermission(appointmentBookingManagePermissions),
  updateAppointmentBookingRecord,
);

router.delete(
  '/:id',
  checkPermission([
    PERMISSIONS.APPOINTMENT_REQUEST_REJECT,
    PERMISSIONS.APPOINTMENT_BOOKING_VIEW,
  ]),
  deleteAppointmentBookingRecord,
);

export default router;
