import Catagory from '../model/catagory.model.js';
import Department from '../../departments/models/department.model.js';
import Doctor from '../../doctors/models/doctor.model.js';
import Subspeciality from '../../subspeciality/model/subspeciality.model.js';

class CatagoryRepository {
  async create(data) {
    const doc = new Catagory(data);
    return await doc.save();
  }

  async findById(id) {
    return await Catagory.findById(id).lean();
  }

  async findAll(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { arabicName: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [catagories, total] = await Promise.all([
      Catagory.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      Catagory.countDocuments(query),
    ]);

    return {
      catagories,
      meta: {
        page,
        limit,
        totalRecords: total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async updateById(id, updateData) {
    return await Catagory.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();
  }

  async deleteById(id) {
    return await Catagory.findByIdAndDelete(id).lean();
  }

  async exists(id) {
    return await Catagory.exists({ _id: id });
  }

  async existsByName(name, arabicName, excludeId = null) {
    const query = {
      $or: [
        {
          name: new RegExp(
            `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
            'i'
          ),
        },
        {
          arabicName: new RegExp(
            `^${arabicName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
            'i'
          ),
        },
      ],
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    return await Catagory.exists(query);
  }

  async findAllWithDepartmentsAndDoctors() {
    const categories = await Catagory.find({})
      .sort({ name: 1 })
      .lean();

    if (categories.length === 0) return [];

    const categoryIds = categories.map((c) => c._id);

    const departments = await Department.find({
      catagory: { $in: categoryIds },
    })
      .sort({ order: 1, name: 1 })
      .populate({
        path: 'customExplainantions',
        select: 'subHeading explaination',
      })
      .lean();

    const deptIds = departments.map((d) => d._id);

    const subspecialitiesByDept = new Map();

    if (deptIds.length > 0) {
      const subspecialities = await Subspeciality.find({
        department: { $in: deptIds },
      })
        .select('name description department customSubspecialities')
        .populate({
          path: 'customSubspecialities',
          select: 'subHeading explanations',
        })
        .lean();

      for (const sub of subspecialities) {
        const key = String(sub.department);

        if (!subspecialitiesByDept.has(key)) {
          subspecialitiesByDept.set(key, []);
        }

        subspecialitiesByDept.get(key).push(sub);
      }
    }

    const doctors =
      deptIds.length === 0
        ? []
        : await Doctor.find({
          department: { $in: deptIds },
        })
          .select(
            'doctorId name nameAr title titleAr department subspecialities subspecialitiesAr image isActive availableOnline initials initialsAr'
          )
          .sort({ name: 1 })
          .lean();

    const doctorsByDept = new Map();

    for (const doc of doctors) {
      if (!doc.department) continue;

      const key = String(doc.department);

      if (!doctorsByDept.has(key)) {
        doctorsByDept.set(key, []);
      }

      doctorsByDept.get(key).push(doc);
    }

    const deptsByCat = new Map();

    for (const dep of departments) {
      const catKey = String(dep.catagory);

      const {
        catagory: _omit,
        ...rest
      } = dep;

      const mergedSubspecialities =
        subspecialitiesByDept.get(String(dep._id)) || [];

      const firstSub = mergedSubspecialities[0] || null;

      const row = {
        ...rest,
        subspecialities: mergedSubspecialities,
        subspeciality: firstSub,
        subspecialityName:
          firstSub &&
            typeof firstSub === 'object' &&
            'name' in firstSub
            ? String(firstSub.name || '')
            : '',
        doctors: doctorsByDept.get(String(dep._id)) || [],
      };

      if (!deptsByCat.has(catKey)) {
        deptsByCat.set(catKey, []);
      }

      deptsByCat.get(catKey).push(row);
    }

    return categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      arabicName: cat.arabicName,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      departments: deptsByCat.get(String(cat._id)) || [],
    }));
  }
}

export default new CatagoryRepository();