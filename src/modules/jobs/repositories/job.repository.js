import Job from '../models/job.model.js';
import jobApplicationRepository from './jobApplication.repository.js';

const escapeRegex = (value = '') =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class JobRepository {

  async create(jobData) {
    const job = new Job(jobData);

    return await job.save();
  }

  async findById(id) {
    return await Job.findById(id).select('-isViewed');
  }

  /** Set isActive=false for active jobs whose closingDate is before today (start of day). */
  async deactivateExpiredJobs() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return await Job.updateMany(
      {
        isActive: true,
        closingDate: { $exists: true, $ne: null, $lt: startOfToday },
      },
      { $set: { isActive: false } },
    );
  }

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
    const andConditions = [];

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (classification) {
      query.classification = {
        $regex: escapeRegex(classification),
        $options: 'i',
      };
    }

    if (location) {
      const locationPattern = escapeRegex(location);
      andConditions.push({
        $or: [
          {
            location: {
              $regex: locationPattern,
              $options: 'i',
            },
          },
          {
            arabicLocation: {
              $regex: locationPattern,
              $options: 'i',
            },
          },
        ],
      });
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      const searchPattern = escapeRegex(search.trim());
      andConditions.push({
        $or: [
          {
            jobId: {
              $regex: searchPattern,
              $options: 'i',
            },
          },
          {
            title: {
              $regex: searchPattern,
              $options: 'i',
            },
          },
          {
            arabicTitle: {
              $regex: searchPattern,
              $options: 'i',
            },
          },
        ],
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const sort = {};

    sort[sortBy] =
      sortOrder === 'desc'
        ? -1
        : 1;

    const jobs = await Job.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const jobIds = jobs.map((job) => job._id);
    const [unviewedByJobId, totalUnviewedApplications] = await Promise.all([
      jobApplicationRepository.countUnviewedByJobIds(jobIds),
      jobApplicationRepository.countAllUnviewed(),
    ]);

    const jobsWithUnviewedCounts = jobs.map((job) => ({
      ...job,
      unviewedApplicationsCount:
        unviewedByJobId.get(String(job._id)) ?? 0,
    }));

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

  async deleteById(id) {
    return await Job.findByIdAndDelete(
      id
    );
  }

  async exists(id) {
    return await Job.exists({
      _id: id,
    });
  }

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

  async decrementApplicationsCount(
    id
  ) {
    return await Job.findOneAndUpdate(
      { _id: id, applicationsCount: { $gt: 0 } },
      {
        $inc: {
          applicationsCount: -1,
        },
      },
      {
        new: true,
      }
    );
  }

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

  
  async getTypes() {
    return [
      'Full-time',
      'Part-time',
      'Contract',
    ];
  }
}

export default new JobRepository();