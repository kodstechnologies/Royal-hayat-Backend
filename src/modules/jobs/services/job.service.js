import jobRepository from '../repositories/job.repository.js';
import jobApplicationRepository from '../repositories/jobApplication.repository.js';

import ApiError from '../../../utils/ApiError.js';

import httpStatus from 'http-status';

class JobService {

  async createJob(jobData) {

    const arabicTitle =
      jobData.arabicTitle?.trim() || undefined;

    const existingJob =
      await jobRepository.existsByTitle(
        jobData.title,
        arabicTitle
      );

    if (existingJob) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'Job with this English or Arabic title already exists'
      );
    }

    if (jobData.jobId) {

      const existingJobId =
        await jobRepository.existsByJobId(
          jobData.jobId
        );

      if (existingJobId) {
        throw new ApiError(
          httpStatus.CONFLICT,
          'Job with this Job ID already exists'
        );
      }
    }

    return await jobRepository.create(
      jobData
    );
  }

  async getAllJobs(
    filters = {}
  ) {
    return await jobRepository.findAll(
      filters
    );
  }

  async getJobById(id) {

    const job =
      await jobRepository.findById(id);

    if (!job) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Job not found'
      );
    }

    const unviewedByJobId =
      await jobApplicationRepository.countUnviewedByJobIds([job._id]);

    const jobData = job.toObject();
    jobData.unviewedApplicationsCount =
      unviewedByJobId.get(String(job._id)) ?? 0;

    return jobData;
  }

  async updateJob(
    id,
    updateData
  ) {

    const existingJob =
      await jobRepository.exists(id);

    if (!existingJob) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Job not found'
      );
    }

    const arabicTitle =
      updateData.arabicTitle?.trim() || undefined;

    if (updateData.title || arabicTitle) {

      const titleExists =
        await jobRepository.existsByTitle(
          updateData.title,
          arabicTitle,
          id
        );

      if (titleExists) {
        throw new ApiError(
          httpStatus.CONFLICT,
          'Job with this English or Arabic title already exists'
        );
      }
    }

    if (updateData.jobId) {

      const existing =
        await jobRepository.findById(
          id
        );

      if (
        existing?.jobId !==
        updateData.jobId
      ) {

        const jobIdExists =
          await jobRepository.existsByJobId(
            updateData.jobId,
            id
          );

        if (jobIdExists) {
          throw new ApiError(
            httpStatus.CONFLICT,
            'Job with this Job ID already exists'
          );
        }
      }
    }

    return await jobRepository.updateById(
      id,
      updateData
    );
  }

  async deleteJob(id) {

    const existingJob =
      await jobRepository.exists(id);

    if (!existingJob) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Job not found'
      );
    }

    return await jobRepository.deleteById(
      id
    );
  }

  async getLocations() {
    return await jobRepository.getLocations();
  }

  async getArabicLocations() {
    return await jobRepository.getArabicLocations();
  }

  async getTypes() {
    return await jobRepository.getTypes();
  }

  async incrementApplicationsCount(
    id
  ) {
    return await jobRepository.incrementApplicationsCount(
      id
    );
  }
}

export default new JobService();