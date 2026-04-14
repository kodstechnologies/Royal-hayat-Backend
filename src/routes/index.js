import { Router } from 'express';
import authRoutes from '../modules/auth/routes/auth.routes.js';
import doctorRoutes from '../modules/doctors/routes/doctor.routes.js';

const router = Router();

router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/doctors', doctorRoutes);

export default router;
