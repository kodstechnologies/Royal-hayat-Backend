import mongoose from 'mongoose';
import JobApplication from '../models/jobApplication.model.js';

class JobApplicationRepository {
  async create(applicationData) {
    const application = new JobApplication(applicationData);
    return await application.save();
  }

  async findRecentApplicationByPhone(jobId, phone) {
    const oneYearAgo = new Date();

    oneYearAgo.setFullYear(
      oneYearAgo.getFullYear() - 1
    );

    return await JobApplication.findOne({
      jobId,
      phone,
      appliedDate: {
        $gte: oneYearAgo
      }
    });
  }

  async findById(id) {
    return await JobApplication.findByIdAndUpdate(
      id,
      { isViewed: true },
      { new: true }
    ).populate('jobId');
  }

  async findAll(filters = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      jobId,
      sortBy = 'appliedDate',
      sortOrder = 'desc'
    } = filters;

    const query = {};

    if (status) {
      query.status = status;
    }
    if (jobId) {
      query.jobId = jobId;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const applications = await JobApplication.find(query)
      .populate('jobId', 'title classification location type')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await JobApplication.countDocuments(query);

    return {
      applications,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateById(id, updateData) {
    return await JobApplication.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  async deleteById(id) {
    return await JobApplication.findByIdAndDelete(id);
  }

  async exists(id) {
    return await JobApplication.exists({ _id: id });
  }

  async findByJobId(jobId, filters = {}) {
    const query = { jobId };

    if (filters.status) {
      query.status = filters.status;
    }

    return await JobApplication.find(query)
      .populate('jobId', 'title classification location type')
      .sort({ appliedDate: -1 });
  }

  async getStatusCountsByJobId(jobId) {
    const grouped = await JobApplication.aggregate([
      { $match: { jobId: new mongoose.Types.ObjectId(jobId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const counts = {
      pending: 0,
      reviewed: 0
    };

    grouped.forEach((item) => {
      if (item._id === 'pending' || item._id === 'reviewed') {
        counts[item._id] = item.count;
      }
    });

    return {
      all: counts.pending + counts.reviewed,
      pending: counts.pending,
      reviewed: counts.reviewed
    };
  }

  async findByEmail(email) {
    return await JobApplication.find({ email })
      .populate('jobId', 'title classification location type')
      .sort({ appliedDate: -1 });
  }

  async getStatusCounts() {
    const counts = await JobApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    return counts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  }

  async countUnviewedByJobIds(jobIds = []) {
    if (!jobIds.length) {
      return new Map();
    }

    const grouped = await JobApplication.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
          isViewed: false,
        },
      },
      {
        $group: {
          _id: '$jobId',
          count: { $sum: 1 },
        },
      },
    ]);

    return new Map(
      grouped.map((item) => [String(item._id), item.count])
    );
  }

  async countAllUnviewed() {
    return JobApplication.countDocuments({ isViewed: false });
  }
}

export default new JobApplicationRepository();
