import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import {
  getAvailability,
  bookAppointment,
  getPatient,
  getSpecialities,
  getCareProviders,
  getAuthToken,
  initializeAppointmentFlow
} from '../controllers/royalhayat.controller.js';

const router = Router();

const availabilityLimiter = rateLimit({
  windowMs: Number(process.env.ROYAL_HAYAT_AVAILABILITY_RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.ROYAL_HAYAT_AVAILABILITY_RATE_LIMIT_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many availability requests. Please wait and try again.',
    data: null
  }
});

const bookingLimiter = rateLimit({
  windowMs: Number(process.env.ROYAL_HAYAT_BOOKING_RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.ROYAL_HAYAT_BOOKING_RATE_LIMIT_MAX || 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many booking requests. Please wait and try again.',
    data: null
  }
});

const authLimiter = rateLimit({
  windowMs: Number(process.env.ROYAL_HAYAT_AUTH_RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.ROYAL_HAYAT_AUTH_RATE_LIMIT_MAX || 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication requests. Please wait and try again.',
    data: null
  }
});

const generalLimiter = rateLimit({
  windowMs: Number(process.env.ROYAL_HAYAT_GENERAL_RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.ROYAL_HAYAT_GENERAL_RATE_LIMIT_MAX || 30),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again.',
    data: null
  }
});

router.get('/auth/token', authLimiter, getAuthToken);

router.post('/book-appointment', authLimiter, initializeAppointmentFlow);

router.get('/availability', availabilityLimiter, getAvailability);

router.post('/appointments/book', bookingLimiter, bookAppointment);

router.get('/patients', generalLimiter, getPatient);

router.get('/specialities', generalLimiter, getSpecialities);
router.get('/care-providers', generalLimiter, getCareProviders);

export default router;
