import jobRepository from '../repositories/job.repository.js';

import ApiError from '../../../utils/ApiError.js';

import httpStatus from 'http-status';

class JobService {

  /**
   * CREATE JOB
   */
  async createJob(jobData) {

    /**
     * CHECK TITLE
     * ENGLISH + ARABIC
     */
    const existingJob =
      await jobRepository.existsByTitle(
        jobData.title,
        jobData.arabicTitle
      );

    if (existingJob) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'Job with this English or Arabic title already exists'
      );
    }

    /**
     * CHECK JOB ID
     */
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

    /**
     * CREATE
     */
    return await jobRepository.create(
      jobData
    );
  }

  /**
   * GET ALL JOBS
   */
  async getAllJobs(
    filters = {}
  ) {
    return await jobRepository.findAll(
      filters
    );
  }

  /**
   * GET JOB BY ID
   */
  async getJobById(id) {

    const job =
      await jobRepository.findById(id);

    if (!job) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Job not found'
      );
    }

    return job;
  }

  /**
   * UPDATE JOB
   */
  async updateJob(
    id,
    updateData
  ) {

    /**
     * CHECK EXISTS
     */
    const existingJob =
      await jobRepository.exists(id);

    if (!existingJob) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Job not found'
      );
    }

    /**
     * CHECK TITLE
     */
    if (
      updateData.title ||
      updateData.arabicTitle
    ) {

      const titleExists =
        await jobRepository.existsByTitle(
          updateData.title,
          updateData.arabicTitle,
          id
        );

      if (titleExists) {
        throw new ApiError(
          httpStatus.CONFLICT,
          'Job with this English or Arabic title already exists'
        );
      }
    }

    /**
     * CHECK JOB ID
     */
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

    /**
     * UPDATE
     */
    return await jobRepository.updateById(
      id,
      updateData
    );
  }

  /**
   * DELETE JOB
   */
  async deleteJob(id) {

    /**
     * CHECK EXISTS
     */
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

  /**
   * GET LOCATIONS
   */
  async getLocations() {
    return await jobRepository.getLocations();
  }

  /**
   * GET ARABIC LOCATIONS
   */
  async getArabicLocations() {
    return await jobRepository.getArabicLocations();
  }

  /**
   * GET TYPES
   */
  async getTypes() {
    return await jobRepository.getTypes();
  }

  /**
   * INCREMENT APPLICATION COUNT
   */
  async incrementApplicationsCount(
    id
  ) {
    return await jobRepository.incrementApplicationsCount(
      id
    );
  }
}

export default new JobService();