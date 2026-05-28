import { Router } from 'express';
import {
  createAppointmentBookingRecord,
  getAllAppointmentBookingRecords,
  getAppointmentBookingRecordById,
  updateAppointmentBookingRecord,
  deleteAppointmentBookingRecord,
} from '../controller/appointmentBookingRecord.controller.js';

const router = Router();

router.post('/', createAppointmentBookingRecord);
router.get('/', getAllAppointmentBookingRecords);
router.get('/:id', getAppointmentBookingRecordById);
router.put('/:id', updateAppointmentBookingRecord);
router.delete('/:id', deleteAppointmentBookingRecord);

export default router;
