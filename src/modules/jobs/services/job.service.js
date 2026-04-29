import jobRepository from '../repositories/job.repository.js';
import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';

class JobService {
  async createJob(jobData) {
    // Check if job title already exists
    const existingJob = await jobRepository.existsByTitle(jobData.title);
    if (existingJob) {
      throw new ApiError(httpStatus.CONFLICT, 'Job with this title already exists');
    }

    if (jobData.jobId) {
      const existingJobId = await jobRepository.existsByJobId(jobData.jobId);
      if (existingJobId) {
        throw new ApiError(httpStatus.CONFLICT, 'Job with this Job ID already exists');
      }
    }

    return await jobRepository.create(jobData);
  }

  async getAllJobs(filters = {}) {
    return await jobRepository.findAll(filters);
  }

  async getJobById(id) {
    const job = await jobRepository.findById(id);
    if (!job) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
    }
    return job;
  }

  async updateJob(id, updateData) {
    // Check if job exists
    const existingJob = await jobRepository.exists(id);
    if (!existingJob) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
    }

    // Check if title is being updated and if it already exists
    if (updateData.title) {
      const titleExists = await jobRepository.existsByTitle(updateData.title);
      if (titleExists) {
        throw new ApiError(httpStatus.CONFLICT, 'Job with this title already exists');
      }
    }

    if (updateData.jobId) {
      const existing = await jobRepository.findById(id);
      if (existing?.jobId !== updateData.jobId) {
        const jobIdExists = await jobRepository.existsByJobId(updateData.jobId);
        if (jobIdExists) {
          throw new ApiError(httpStatus.CONFLICT, 'Job with this Job ID already exists');
        }
      }
    }

    return await jobRepository.updateById(id, updateData);
  }

  async deleteJob(id) {
    // Check if job exists
    const existingJob = await jobRepository.exists(id);
    if (!existingJob) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
    }

    return await jobRepository.deleteById(id);
  }

  async getDepartments() {
    return await jobRepository.getDepartments();
  }

  async getLocations() {
    return await jobRepository.getLocations();
  }

  async getTypes() {
    return await jobRepository.getTypes();
  }

  async getClassifications() {
    return await jobRepository.getClassifications();
  }

  async incrementApplicationsCount(id) {
    return await jobRepository.incrementApplicationsCount(id);
  }
}

export default new JobService();
