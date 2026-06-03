import Department from '../models/department.model.js';

const populateCustomExplainantions = {
  path: 'customExplainantions',

  select: `
    subHeading
    arabicSubHeading
    explaination
    arabicExplaination
  `,
};

class DepartmentRepository {

  async create(departmentData) {
    const department =
      new Department(departmentData);

    return await department.save();
  }

  async findById(id) {
    return await Department.findById(id)

      .populate(
        'catagory',
        'name arabicName'
      )

      .populate(
        populateCustomExplainantions
      );
  }

  async findAll(filters = {}) {
    const {
      page = 1,

      limit = 10,

      isActive,

      search,

      sortBy = 'order',

      sortOrder = 'asc',
    } = filters;

    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: 'i',
          },
        },

        {
          arabicName: {
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
          departmentId: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    const sort = {};

    sort[sortBy] =
      sortOrder === 'desc' ? -1 : 1;

    const departments =
      await Department.find(query)

        .populate(
          'catagory',
          'name arabicName'
        )

        .populate(
          populateCustomExplainantions
        )

        .sort(sort)

        .limit(limit * 1)

        .skip((page - 1) * limit);

    const total =
      await Department.countDocuments(
        query
      );

    return {
      departments,

      meta: {
        page,

        limit,

        total,

        pages: Math.ceil(
          total / limit
        ),
      },
    };
  }

  async updateById(id, updateData) {
    return await Department.findByIdAndUpdate(
      id,

      updateData,

      {
        new: true,

        runValidators: true,
      }
    )

      .populate(
        'catagory',
        'name arabicName'
      )

      .populate(
        populateCustomExplainantions
      );
  }

  async deleteById(id) {
    return await Department.findByIdAndDelete(
      id
    );
  }

  async exists(id) {
    return await Department.exists({
      _id: id,
    });
  }

  async existsByName(
    name,
    arabicName,
    excludeId = null
  ) {
    const query = {
      $or: [
        { name },

        { arabicName },
      ],
    };

    if (excludeId) {
      query._id = {
        $ne: excludeId,
      };
    }

    return await Department.exists(
      query
    );
  }

  async existsByDepartmentId(
    departmentId,
    excludeId = null
  ) {
    const query = {
      departmentId,
    };

    if (excludeId) {
      query._id = {
        $ne: excludeId,
      };
    }

    return await Department.exists(
      query
    );
  }
}

export default new DepartmentRepository();