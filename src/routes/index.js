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
import royalHayatRoutes from '../modules/royalhayat/routes/royalhayat.routes.js';
import appointmentRequestRoutes from '../modules/appintmentRequest/routes/appointmentRequest.routes.js';
import appointmentBookingRecordRoutes from '../modules/appintmentRequest/routes/appointmentBookingRecord.js';
import HospitalFeedbackRoutes from "../modules/feedback/routes/hospitalFeedback.routes.js"
import DocumentRoutes from "../modules/document/routes/document.routes.js"
import MedicalRecordRoutes from "../modules/medicalRecordRequest/routes/medicalRecordRequest.routes.js"
import WorkCultureRoutes from "../modules/workCulture/routes/workCulture.js"
import CSRRoutes from "../modules/csr/routes/csr.routes.js"
import LeaderShipRoutes from "../modules/leadership/routes/leadership.routes.js"
import { identityCallback } from '../modules/identity/controllers/identity.controller.js';
import { callbackProbe } from '../modules/identity/middleware/callbackProbe.middleware.js';
import { logIdentityHttp } from '../modules/identity/utils/identity.logger.js';
import DoctorFeedbacks from "../modules/feedback/routes/doctorFeedback.routes.js"
import HospitalFeedbacks from "../modules/feedback/routes/hospitalFeedback.routes.js"
import achievementRoutes from "../modules/achievements/routes/achievement.routes.js"
import featuredDoctorRoutes from "../modules/doctors/routes/featuredDoctor.routes.js"
import dashboardRoutes from "../modules/dashborad/routes/dashboard.route.js"
import alSafwaRoutes from "../modules/al-safwa/routes/alSafwa.route.js"
import internationalPatientEnquiryRoutes from "../modules/international-patient/routes/internationalPatientEnquiry.route.js"

const router = Router();

router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/doctors', doctorRoutes);
router.use('/api/v1/featured-doctors', featuredDoctorRoutes);
router.use('/api/v1/enquiries', enquiryRoutes);
router.use('/api/v1/departments', departmentRoutes);
router.use('/api/v1/jobs', jobRoutes);
router.use('/api/v1/job-applications', jobApplicationRoutes);
router.use('/api/v1/identity', identityRoutes);
router.use('/api/v1/catagories', catagoryRoutes);
router.use('/api/v1/subspecialities', subspecialityRoutes);
router.use('/api/v1/royal-hayat', royalHayatRoutes);
router.use('/api/v1/appointment-requests', appointmentRequestRoutes);
router.use('/api/v1/appointment-booking-records', appointmentBookingRecordRoutes);
router.all('/api/callback', callbackProbe, logIdentityHttp('POST /api/callback'), identityCallback);
router.use("/api/v1/hsopital-feedback",HospitalFeedbackRoutes)
router.use("/api/v1/documents",DocumentRoutes)
router.use("/api/v1/medical-record-requests",MedicalRecordRoutes)
router.use("/api/v1/work-culture",WorkCultureRoutes)
router.use("/api/v1/csr",CSRRoutes)
router.use("/api/v1/leadership",LeaderShipRoutes)
router.use("/api/v1/doctor-feedback",DoctorFeedbacks)
router.use("/api/v1/hospital-feedback",HospitalFeedbacks)
router.use("/api/v1/achievements", achievementRoutes)
router.use("/api/v1/dashboard", dashboardRoutes)
router.use("/api/v1/al-safwa", alSafwaRoutes)
router.use("/api/v1/international-patient-enquiries", internationalPatientEnquiryRoutes)

export default router;
