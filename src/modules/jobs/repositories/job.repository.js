import Job from '../models/job.model.js';

class JobRepository {
  async create(jobData) {
    const job = new Job(jobData);
    return await job.save();
  }

  async findById(id) {
    return await Job.findById(id);
  }

  async findAll(filters = {}) {
    const {
      page = 1,
      limit = 10,
      department,
      location,
      type,
      classification,
      urgency,
      isActive,
      sortBy = 'postedDate',
      sortOrder = 'desc'
    } = filters;

    const query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (type) {
      query.type = type;
    }
    if (classification) {
      query.classification = { $regex: classification, $options: 'i' };
    }
    if (urgency) {
      query.urgency = urgency;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const jobs = await Job.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    return {
      jobs,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateById(id, updateData) {
    return await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  async deleteById(id) {
    return await Job.findByIdAndDelete(id);
  }

  async exists(id) {
    return await Job.exists({ _id: id });
  }

  async existsByTitle(title) {
    return await Job.exists({ title });
  }

  async existsByJobId(jobId) {
    return await Job.exists({ jobId });
  }

  async incrementApplicationsCount(id) {
    return await Job.findByIdAndUpdate(
      id,
      { $inc: { applicationsCount: 1 } },
      { new: true }
    );
  }

  async getDepartments() {
    const departments = await Job.distinct('department');
    return departments.filter(dept => dept && dept.trim() !== '');
  }

  async getLocations() {
    const locations = await Job.distinct('location');
    return locations.filter(loc => loc && loc.trim() !== '');
  }

  async getTypes() {
    return ['Full-time', 'Part-time', 'Contract'];
  }

  async getClassifications() {
    const classifications = await Job.distinct('classification');
    return classifications.filter(classification => classification && classification.trim() !== '');
  }
}

export default new JobRepository();
