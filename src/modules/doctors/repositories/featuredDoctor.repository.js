
import FeaturedDoctor from '../models/featuredDoctors.model.js';
import '../../departments/models/department.model.js';

const DOCTOR_POPULATE = [
  { path: 'department', select: 'departmentId name arabicName' },
];

const toDoctorId = (value) => {
  if (!value || Array.isArray(value)) return null;
  if (typeof value === 'object' && value._id) return String(value._id);
  const asString = String(value);
  if (!asString || asString === '[object Object]') return null;
  return asString;
};

class FeaturedDoctorsRepository {
  async migrateLegacyIfNeeded() {
    const all = await FeaturedDoctor.find().lean();

    const legacyRows = all.filter(
      (row) => row.doctor && !Array.isArray(row.doctor),
    );

    if (!legacyRows.length) {
      const singleton = all.find((row) => Array.isArray(row.doctor));
      if (!singleton) {
        await FeaturedDoctor.create({ doctor: [] });
      }
      return;
    }

    const doctorIds = [
      ...new Set(
        legacyRows.map((row) => toDoctorId(row.doctor)).filter(Boolean),
      ),
    ];

    const existingSingleton = all.find((row) => Array.isArray(row.doctor));
    const mergedIds = [
      ...new Set([
        ...(existingSingleton?.doctor ?? []).map((id) => String(id)),
        ...doctorIds,
      ]),
    ];

    await FeaturedDoctor.deleteMany({});
    await FeaturedDoctor.create({ doctor: mergedIds });
  }

  async getSingletonDoc() {
    await this.migrateLegacyIfNeeded();
    let doc = await FeaturedDoctor.findOne();
    if (!doc) {
      doc = await FeaturedDoctor.create({ doctor: [] });
    }
    return doc;
  }

  async getFeaturedDoctors() {
    await this.migrateLegacyIfNeeded();

    const doc = await FeaturedDoctor.findOne()
      .populate({
        path: 'doctor',
        populate: DOCTOR_POPULATE,
      })
      .lean();

    if (!doc?.doctor?.length) {
      return [];
    }

    return doc.doctor
      .filter(Boolean)
      .map((entry, index) => ({
        _id: String(entry._id),
        doctor: entry,
        order: index,
      }));
  }

  async syncFeaturedDoctors(doctorIds = []) {
    const normalizedIds = [
      ...new Set(
        (Array.isArray(doctorIds) ? doctorIds : [])
          .map((id) => String(id || '').trim())
          .filter(Boolean),
      ),
    ];

    await this.migrateLegacyIfNeeded();
    await FeaturedDoctor.deleteMany({});
    await FeaturedDoctor.create({ doctor: normalizedIds });

    return this.getFeaturedDoctors();
  }

  async addFeaturedDoctor(doctorId) {
    const singleton = await this.getSingletonDoc();
    const current = (singleton.doctor ?? []).map((id) => String(id));
    const id = String(doctorId);

    if (current.includes(id)) {
      return this.getFeaturedDoctors();
    }

    singleton.doctor = [...current, id];
    await singleton.save();

    return this.getFeaturedDoctors();
  }

  async removeFeaturedDoctor(doctorId) {
    const singleton = await this.getSingletonDoc();
    const id = String(doctorId);

    singleton.doctor = (singleton.doctor ?? []).filter(
      (entry) => String(entry) !== id,
    );
    await singleton.save();

    return singleton;
  }
}

export default new FeaturedDoctorsRepository();
