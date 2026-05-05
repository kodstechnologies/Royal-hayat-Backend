import { Router } from 'express';
import {
  createAppointmentRequest,
  getAllAppointmentRequests,
  getAppointmentRequestById,
  updateAppointmentRequest,
  deleteAppointmentRequest,
} from '../controller/appointmentRequest.controller.js';

const router = Router();

router.post('/', createAppointmentRequest);
router.get('/', getAllAppointmentRequests);
router.get('/:id', getAppointmentRequestById);
router.put('/:id', updateAppointmentRequest);
router.delete('/:id', deleteAppointmentRequest);

export default router;
