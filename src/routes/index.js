import { Router } from 'express';
import authRoutes from '../modules/auth/routes/auth.routes.js';
import doctorRoutes from '../modules/doctors/routes/doctor.routes.js';
import departmentRoutes from '../modules/departments/routes/department.routes.js';
import jobRoutes from '../modules/jobs/routes/job.routes.js';
import jobApplicationRoutes from '../modules/jobs/routes/jobApplication.routes.js';

const router = Router();

router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/doctors', doctorRoutes);
router.use('/api/v1/departments', departmentRoutes);
router.use('/api/v1/jobs', jobRoutes);
router.use('/api/v1/job-applications', jobApplicationRoutes);

export default router;
