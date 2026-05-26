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
    return await JobApplication.findById(id).populate('jobId');
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

  async findByJobId(jobId) {
    return await JobApplication.find({ jobId })
      .populate('jobId', 'title classification location type')
      .sort({ appliedDate: -1 });
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



}

export default new JobApplicationRepository();
