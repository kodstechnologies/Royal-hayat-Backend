import mongoose from 'mongoose';
import Qualifications from '../models/qualifications.model.js';
import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';
import { filterValidObjectIds, isValidObjectId } from './expertise.util.js';

function normalizePoints(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim().replace(/\.+$/u, ''))
    .filter(Boolean);
}

export async function attachQualificationsToDoctors(doctors) {
  const list = Array.isArray(doctors) ? doctors : [doctors];
  if (!list.length) return Array.isArray(doctors) ? [] : null;

  const qualificationIds = [
    ...new Set(
      list.flatMap((doctor) =>
        (Array.isArray(doctor.qualifications) ? doctor.qualifications : [])
          .map((value) => String(value).trim())
          .filter(isValidObjectId),
      ),
    ),
  ];

  const qualificationRows = qualificationIds.length
    ? await Qualifications.find({ _id: { $in: qualificationIds } }).lean()
    : [];
  const qualificationMap = new Map(
    qualificationRows.map((row) => [String(row._id), row]),
  );

  const enriched = list.map((doctor) => ({
    ...doctor,
    qualifications: (Array.isArray(doctor.qualifications) ? doctor.qualifications : [])
      .map((value) => String(value).trim())
      .filter(isValidObjectId)
      .map((id) => qualificationMap.get(id))
      .filter(Boolean),
  }));

  return Array.isArray(doctors) ? enriched : enriched[0] ?? null;
}

export async function resolveQualificationsRefs(qualificationsInput) {
  if (!Array.isArray(qualificationsInput)) return [];

  const qualificationIds = [];

  for (const item of qualificationsInput) {
    if (typeof item === 'string' && isValidObjectId(item)) {
      const exists = await Qualifications.exists({ _id: item });
      if (!exists) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Qualifications not found');
      }
      qualificationIds.push(new mongoose.Types.ObjectId(item));
      continue;
    }

    if (typeof item === 'string') {
      const text = String(item).trim().replace(/\.+$/u, '');
      if (!text) continue;

      const created = await Qualifications.create({
        subHeading: '',
        subHeadingAr: '',
        points: [text],
        pointsAr: [],
      });
      qualificationIds.push(created._id);
      continue;
    }

    if (item && typeof item === 'object') {
      const refId = String(item._id || item.id || '').trim();

      if (isValidObjectId(refId)) {
        const existing = await Qualifications.findById(refId);
        if (existing) {
          existing.set({
            subHeading: String(item.subHeading || existing.subHeading || '').trim(),
            subHeadingAr: String(item.subHeadingAr || existing.subHeadingAr || '').trim(),
            points: normalizePoints(item.points ?? existing.points),
            pointsAr: normalizePoints(item.pointsAr ?? existing.pointsAr),
          });
          await existing.save();
          qualificationIds.push(existing._id);
          continue;
        }
      }

      const created = await Qualifications.create({
        subHeading: String(item.subHeading || '').trim(),
        subHeadingAr: String(item.subHeadingAr || '').trim(),
        points: normalizePoints(item.points),
        pointsAr: normalizePoints(item.pointsAr),
      });
      qualificationIds.push(created._id);
    }
  }

  return qualificationIds;
}

export async function cleanInvalidDoctorQualificationsRefs(DoctorModel) {
  const doctors = await DoctorModel.find({
    qualifications: { $exists: true, $not: { $size: 0 } },
  })
    .select('_id qualifications')
    .lean();

  let cleaned = 0;

  for (const doctor of doctors) {
    const current = Array.isArray(doctor.qualifications) ? doctor.qualifications : [];
    const valid = filterValidObjectIds(current);

    if (valid.length !== current.length) {
      await DoctorModel.updateOne(
        { _id: doctor._id },
        { $set: { qualifications: valid } },
      );
      cleaned += 1;
    }
  }

  return cleaned;
}
