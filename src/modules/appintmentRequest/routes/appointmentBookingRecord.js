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

const appointmentBookingListPermissions = [
  PERMISSIONS.APPOINTMENT_BOOKING_VIEW_ALL,
  PERMISSIONS.APPOINTMENT_BOOKING_VIEW,
  PERMISSIONS.APPOINTMENT_VIEW_ALL,
  PERMISSIONS.APPOINTMENT_VIEW,
];

const appointmentBookingViewPermissions = [
  PERMISSIONS.APPOINTMENT_BOOKING_VIEW,
  PERMISSIONS.APPOINTMENT_BOOKING_VIEW_ALL,
  PERMISSIONS.APPOINTMENT_VIEW,
  PERMISSIONS.APPOINTMENT_VIEW_ALL,
];

router.use(verifyJWT);

router.post(
  '/',
  checkPermission(PERMISSIONS.APPOINTMENT_BOOKING),
  createAppointmentBookingRecord,
);

router.get(
  '/',
  checkPermission(appointmentBookingListPermissions),
  getAllAppointmentBookingRecords,
);

router.get(
  '/counts',
  checkPermission(appointmentBookingListPermissions),
  getAppointmentCounts,
);

router.get(
  '/:id',
  checkPermission(appointmentBookingViewPermissions),
  getAppointmentBookingRecordById,
);

router.put(
  '/:id',
  checkPermission(PERMISSIONS.APPOINTMENT_BOOKING),
  updateAppointmentBookingRecord,
);

router.delete(
  '/:id',
  checkPermission(PERMISSIONS.APPOINTMENT_CANCEL),
  deleteAppointmentBookingRecord,
);

export default router;
