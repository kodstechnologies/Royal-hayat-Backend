import jobApplicationRepository from '../repositories/jobApplication.repository.js';
import jobService from './job.service.js';
import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';

class JobApplicationService {
  async createJobApplication(applicationData) {

    // Check if job exists
    const job = await jobService.getJobById(
      applicationData.jobId
    );

    if (!job) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Job not found'
      );
    }

    // CHECK EXISTING APPLICATION
    const existingApplication =
      await jobApplicationRepository.findRecentApplicationByPhone(
        applicationData.jobId,
        applicationData.phone
      );

    if (existingApplication) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'You have already applied for this job within the last 1 year'
      );
    }

    // CREATE APPLICATION
    const application =
      await jobApplicationRepository.create(
        applicationData
      );

    // INCREMENT COUNT
    await jobService.incrementApplicationsCount(
      applicationData.jobId
    );

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
    // Check if application exists
    const existingApplication = await jobApplicationRepository.exists(id);
    if (!existingApplication) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Job application not found');
    }

    return await jobApplicationRepository.updateById(id, updateData);
  }

  async deleteJobApplication(id) {
    // Check if application exists
    const existingApplication = await jobApplicationRepository.exists(id);
    if (!existingApplication) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Job application not found');
    }

    return await jobApplicationRepository.deleteById(id);
  }

  async getApplicationsByJobId(jobId) {
    // Check if job exists
    const job = await jobService.getJobById(jobId);
    if (!job) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
    }

    return await jobApplicationRepository.findByJobId(jobId);
  }

  async getApplicationsByEmail(email) {
    return await jobApplicationRepository.findByEmail(email);
  }

  async getStatusCounts() {
    return await jobApplicationRepository.getStatusCounts();
  }
}

export default new JobApplicationService();
