import jobApplicationRepository from '../repositories/jobApplication.repository.js';
import jobService from './job.service.js';
import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';
import { putObject } from '../../../utils/putObject.js';
import { sendJobApplicationNotificationEmail } from '../../../utils/jobApplicationNotificationMail.js';
import { sendJobApplicationConfirmationEmail } from '../../../utils/emailForJobApplicant.js';

class JobApplicationService {
  async createJobApplication(applicationData, resumeFile) {
    if (!resumeFile) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Resume is required');
    }

    let resumeUrl;
    try {
      const uploaded = await putObject(
        resumeFile,
        'job-applications/resumes'
      );
      resumeUrl = uploaded.url;
    } catch {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to upload resume'
      );
    }

    const payload = {
      ...applicationData,
      resume: resumeUrl,
      ...(applicationData.coverLetter === ''
        ? { coverLetter: undefined }
        : {})
    };

    const job = await jobService.getJobById(
      payload.jobId
    );

    if (!job) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Job not found'
      );
    }

    const existingApplication =
      await jobApplicationRepository.findRecentApplicationByPhoneOrEmail(
        payload.jobId,
        payload.phone,
        payload.email,
      );

    if (existingApplication) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'You have already applied for this job within the last 1 year'
      );
    }

    const application =
      await jobApplicationRepository.create(
        payload
      );

    await jobService.incrementApplicationsCount(
      payload.jobId
    );

    const applicationRecord = application.toObject?.() ?? application;

    try {
      await sendJobApplicationNotificationEmail(
        applicationRecord,
        job,
        resumeFile,
      );
      console.info(
        'Job application notification email sent:',
        application.applicationId,
      );
    } catch (mailError) {
      console.error(
        'Job application notification email failed:',
        mailError?.message || mailError,
        mailError?.stack || '',
      );
    }

    try {
      await sendJobApplicationConfirmationEmail(applicationRecord, job);
      console.info(
        'Job application confirmation email sent to applicant:',
        application.applicationId,
      );
    } catch (mailError) {
      console.error(
        'Job application confirmation email failed:',
        mailError?.message || mailError,
        mailError?.stack || '',
      );
    }

    return application;
  }
  async getAllJobApplications(filters = {}) {
    return await jobApplicationRepository.findAll(filters);
  }

  async getJobApplicationById(id) {
    const application = await jobApplicationRepository.findById(id);
    if (!application) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Job application not found');
    }
    return application;
  }

  async updateJobApplication(id, updateData) {
    const existingApplication = await jobApplicationRepository.exists(id);
    if (!existingApplication) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Job application not found');
    }

    return await jobApplicationRepository.updateById(id, updateData);
  }

  async deleteJobApplication(id) {
    const deletedApplication = await jobApplicationRepository.deleteById(id);
    if (!deletedApplication) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Job application not found');
    }

    if (deletedApplication.jobId) {
      await jobService.decrementApplicationsCount(deletedApplication.jobId);
    }

    return deletedApplication;
  }

  async getApplicationsByJobId(jobId, filters = {}) {
    const job = await jobService.getJobById(jobId);
    if (!job) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
    }

    const [applications, counts] = await Promise.all([
      jobApplicationRepository.findByJobId(jobId, filters),
      jobApplicationRepository.getStatusCountsByJobId(jobId)
    ]);

    return {
      applications,
      counts
    };
  }

  async getApplicationsByEmail(email) {
    return await jobApplicationRepository.findByEmail(email);
  }

  async getStatusCounts() {
    return await jobApplicationRepository.getStatusCounts();
  }
}

export default new JobApplicationService();
