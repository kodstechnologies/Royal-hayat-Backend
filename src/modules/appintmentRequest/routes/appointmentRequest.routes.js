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

const router = Router();

router.post('/', createAppointmentRequest);
router.get('/', getAllAppointmentRequests);
router.get('/:id', getAppointmentRequestById);
router.put('/:id', updateAppointmentRequest);
router.delete('/:id', deleteAppointmentRequest);
router.patch(
  '/accept/:id',
  acceptAppointmentRequest,
);

router.patch(
  '/cancel/:id',
  cancelAppointmentRequest,
);
export default router;
