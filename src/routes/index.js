import { Router } from 'express';
import authRoutes from '../modules/auth/routes/auth.routes.js';
import doctorRoutes from '../modules/doctors/routes/doctor.routes.js';
import enquiryRoutes from '../modules/enquiry/routes/enquiry.routes.js';
import departmentRoutes from '../modules/departments/routes/department.routes.js';
import jobRoutes from '../modules/jobs/routes/job.routes.js';
import jobApplicationRoutes from '../modules/jobs/routes/jobApplication.routes.js';
import identityRoutes from '../modules/identity/routes/identity.routes.js';
import catagoryRoutes from '../modules/catagory/routes/catagory.routes.js';
import subspecialityRoutes from '../modules/subspeciality/routes/subspeciality.routes.js';
import appointmentRequestRoutes from '../modules/appintmentRequest/routes/appointmentRequest.routes.js';
import { identityCallback } from '../modules/identity/controllers/identity.controller.js';

const router = Router();

router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/doctors', doctorRoutes);
router.use('/api/v1/enquiries', enquiryRoutes);
router.use('/api/v1/departments', departmentRoutes);
router.use('/api/v1/jobs', jobRoutes);
router.use('/api/v1/job-applications', jobApplicationRoutes);
router.use('/api/v1/identity', identityRoutes);
router.use('/api/v1/catagories', catagoryRoutes);
router.use('/api/v1/subspecialities', subspecialityRoutes);
router.use('/api/v1/appointment-requests', appointmentRequestRoutes);
router.post('/api/callback', identityCallback);

export default router;
