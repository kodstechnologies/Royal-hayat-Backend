import Department from '../models/department.model.js';

class DepartmentRepository {
  async create(departmentData) {
    const department = new Department(departmentData);
    return await department.save();
  }

  async findById(id) {
    return await Department.findById(id);
  }

  async findAll(filters = {}) {
    const {
      page = 1,
      limit = 10,
      isActive,
      sortBy = 'order',
      sortOrder = 'asc'
    } = filters;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const departments = await Department.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Department.countDocuments(query);

    return {
      departments,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateById(id, updateData) {
    return await Department.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }


  async deleteById(id) {
    return await Department.findByIdAndDelete(id);
  }


  async exists(id) {
    return await Department.exists({ _id: id });
  }

  async existsByName(name) {
    return await Department.exists({ name });
  }

  async existsByDepartmentId(departmentId) {
    return await Department.exists({ departmentId });
  }
}

export default new DepartmentRepository();
