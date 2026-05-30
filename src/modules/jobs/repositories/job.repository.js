import Job from '../models/job.model.js';
import jobApplicationRepository from './jobApplication.repository.js';

class JobRepository {

  /**
   * CREATE
   */
  async create(jobData) {
    const job = new Job(jobData);

    return await job.save();
  }

  /**
   * GET BY ID
   */
  async findById(id) {
    return await Job.findById(id).select('-isViewed');
  }

  /**
   * GET ALL
   */
  async findAll(filters = {}) {
    const {
      page = 1,

      limit = 10,

      classification,

      location,

      type,

      isActive,

      search,

      sortBy = 'postedDate',

      sortOrder = 'desc',
    } = filters;

    const query = {};

    /**
     * ACTIVE FILTER
     */
    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    /**
     * CLASSIFICATION FILTER
     */
    if (classification) {
      query.classification = {
        $regex: classification,
        $options: 'i',
      };
    }

    /**
     * LOCATION FILTER
     */
    if (location) {
      query.$or = [
        {
          location: {
            $regex: location,
            $options: 'i',
          },
        },

        {
          arabicLocation: {
            $regex: location,
            $options: 'i',
          },
        },
      ];
    }

    /**
     * TYPE FILTER
     */
    if (type) {
      query.type = type;
    }

    /**
     * SEARCH FILTER
     */
    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: 'i',
          },
        },

        {
          arabicTitle: {
            $regex: search,
            $options: 'i',
          },
        },

        {
          description: {
            $regex: search,
            $options: 'i',
          },
        },

        {
          arabicDescription: {
            $regex: search,
            $options: 'i',
          },
        },

        {
          location: {
            $regex: search,
            $options: 'i',
          },
        },

        {
          arabicLocation: {
            $regex: search,
            $options: 'i',
          },
        },

        {
          jobId: {
            $regex: search,
            $options: 'i',
          },
        },

        {
          classification: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    /**
     * SORT
     */
    const sort = {};

    sort[sortBy] =
      sortOrder === 'desc'
        ? -1
        : 1;

    const jobs =
      await Job.find(query)

        .sort(sort)

        .limit(limit * 1)

        .skip((page - 1) * limit);

    const jobIds = jobs.map((job) => job._id);
    const [unviewedByJobId, totalUnviewedApplications] = await Promise.all([
      jobApplicationRepository.countUnviewedByJobIds(jobIds),
      jobApplicationRepository.countAllUnviewed(),
    ]);

    const jobsWithUnviewedCounts = jobs.map((job) => {
      const jobObject = job.toObject();
      jobObject.unviewedApplicationsCount =
        unviewedByJobId.get(String(job._id)) ?? 0;
      return jobObject;
    });

    const total =
      await Job.countDocuments(
        query
      );

    return {
      jobs: jobsWithUnviewedCounts,

      meta: {
        page,

        limit,

        total,

        pages: Math.ceil(
          total / limit
        ),

        totalUnviewedApplications,
      },
    };
  }

  /**
   * UPDATE
   */
  async updateById(id, updateData) {
    return await Job.findByIdAndUpdate(
      id,

      updateData,

      {
        new: true,

        runValidators: true,
      }
    );
  }

  /**
   * DELETE
   */
  async deleteById(id) {
    return await Job.findByIdAndDelete(
      id
    );
  }

  /**
   * EXISTS
   */
  async exists(id) {
    return await Job.exists({
      _id: id,
    });
  }

  /**
   * CHECK TITLE
   * ENGLISH OR ARABIC
   */
  async existsByTitle(
    title,
    arabicTitle,
    excludeId = null
  ) {
    const query = {
      $or: [
        ...(title
          ? [{ title }]
          : []),

        ...(arabicTitle
          ? [
              {
                arabicTitle,
              },
            ]
          : []),
      ],
    };

    if (excludeId) {
      query._id = {
        $ne: excludeId,
      };
    }

    return await Job.exists(
      query
    );
  }

  /**
   * CHECK JOB ID
   */
  async existsByJobId(
    jobId,
    excludeId = null
  ) {
    const query = {
      jobId,
    };

    if (excludeId) {
      query._id = {
        $ne: excludeId,
      };
    }

    return await Job.exists(
      query
    );
  }

  /**
   * INCREMENT APPLICATION COUNT
   */
  async incrementApplicationsCount(
    id
  ) {
    return await Job.findByIdAndUpdate(
      id,

      {
        $inc: {
          applicationsCount: 1,
        },
      },

      {
        new: true,
      }
    );
  }

  /**
   * GET LOCATIONS
   * ENGLISH
   */
  async getLocations() {
    const locations =
      await Job.distinct(
        'location'
      );

    return locations.filter(
      (loc) =>
        loc &&
        loc.trim() !== ''
    );
  }

  /**
   * GET ARABIC LOCATIONS
   */
  async getArabicLocations() {
    const locations =
      await Job.distinct(
        'arabicLocation'
      );

    return locations.filter(
      (loc) =>
        loc &&
        loc.trim() !== ''
    );
  }

  
  /**
   * GET TYPES
   */
  async getTypes() {
    return [
      'Full-time',
      'Part-time',
      'Contract',
    ];
  }
}

export default new JobRepository();