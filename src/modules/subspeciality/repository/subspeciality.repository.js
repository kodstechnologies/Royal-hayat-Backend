import Subspeciality from '../model/subspeciality.model.js';
import '../model/customSubspeciality.model.js';
import '../../departments/models/department.model.js';

const populateDepartment = {
  path: 'department',
  select: 'departmentId name arabicName',
};

class SubspecialityRepository {
  async create(data) {
    const doc = new Subspeciality(data);

    await doc.save();

    return await this.findById(String(doc._id), {
      populateCustom: true,
    });
  }

  async findById(
    id,
    { populateCustom = true } = {}
  ) {
    let q = Subspeciality.findById(id).populate(
      populateDepartment
    );

    if (populateCustom) {
      q = q.populate({
        path: 'customSubspecialities',
        select:
          `
          heading
          subHeading
          arabicHeading
          arabicSubHeading
          explanations
          arabicExplanations
          createdAt
          updatedAt
          `,
      });
    }

    return await q.lean();
  }

  async findAll(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      department,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const query = {};

    if (department) {
      query.department = department;
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
      ];
    }

    const sort = {};

    sort[sortBy] =
      sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [subspecialities, total] =
      await Promise.all([
        Subspeciality.find(query)
          .populate(populateDepartment)
          .populate({
            path: 'customSubspecialities',
            select:
              `
              heading
              subHeading
              arabicHeading
              arabicSubHeading
              explanations
              arabicExplanations
              createdAt
              updatedAt
              `,
          })
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),

        Subspeciality.countDocuments(query),
      ]);

    return {
      subspecialities,

      meta: {
        page,
        limit,
        totalRecords: total,

        totalPages:
          Math.ceil(total / limit) || 1,
      },
    };
  }

  async updateById(id, updateData) {
    const updated = await Subspeciality.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) return null;

    return await this.findById(id, {
      populateCustom: true,
    });
  }

  async deleteById(id) {
    return await Subspeciality.findByIdAndDelete(
      id
    ).lean();
  }

  async exists(id) {
    return await Subspeciality.exists({
      _id: id,
    });
  }

  async existsByName(
    name,
    arabicName,
    departmentId,
    excludeId = null
  ) {
    const query = {
      department: departmentId,

      $or: [
        {
          name: new RegExp(
            `^${name.replace(
              /[.*+?^${}()|[\]\\]/g,
              '\\$&'
            )}$`,
            'i'
          ),
        },

        {
          arabicName: new RegExp(
            `^${arabicName.replace(
              /[.*+?^${}()|[\]\\]/g,
              '\\$&'
            )}$`,
            'i'
          ),
        },
      ],
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    return await Subspeciality.exists(query);
  }
}

export default new SubspecialityRepository();