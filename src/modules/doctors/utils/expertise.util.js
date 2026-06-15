import mongoose from 'mongoose';
import Expertise from '../models/expertise.model.js';
import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';

const OID = /^[0-9a-fA-F]{24}$/i;

export function isValidObjectId(value) {
  if (value == null || value === '') return false;
  const str = String(value).trim();
  return OID.test(str);
}

export function filterValidObjectIds(values) {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => String(value).trim())
    .filter(isValidObjectId)
    .map((value) => new mongoose.Types.ObjectId(value));
}

export async function attachExpertiseToDoctors(doctors) {
  const list = Array.isArray(doctors) ? doctors : [doctors];
  if (!list.length) return Array.isArray(doctors) ? [] : null;

  const expertiseIds = [
    ...new Set(
      list.flatMap((doctor) =>
        (Array.isArray(doctor.expertise) ? doctor.expertise : [])
          .map((value) => String(value).trim())
          .filter(isValidObjectId),
      ),
    ),
  ];

  const expertiseRows = expertiseIds.length
    ? await Expertise.find({ _id: { $in: expertiseIds } }).lean()
    : [];
  const expertiseMap = new Map(
    expertiseRows.map((row) => [String(row._id), row]),
  );

  const enriched = list.map((doctor) => ({
    ...doctor,
    expertise: (Array.isArray(doctor.expertise) ? doctor.expertise : [])
      .map((value) => String(value).trim())
      .filter(isValidObjectId)
      .map((id) => expertiseMap.get(id))
      .filter(Boolean),
  }));

  return Array.isArray(doctors) ? enriched : enriched[0] ?? null;
}

function isSectionHeading(text) {
  const trimmed = String(text || '').trim();
  return trimmed.endsWith(':') || trimmed.endsWith('：');
}

function stripTrailingPeriod(text) {
  const trimmed = String(text).trim();
  return trimmed.replace(/\.+$/u, '');
}

function parseFlatExpertise(items) {
  const sections = [];
  let current = null;

  for (const raw of items || []) {
    const item = String(raw).trim();
    if (!item) continue;

    if (isSectionHeading(item)) {
      if (current) sections.push(current);
      current = { heading: item, points: [] };
      continue;
    }

    if (!current) current = { heading: '', points: [] };
    current.points.push(stripTrailingPeriod(item));
  }

  if (current) sections.push(current);
  return sections;
}

export function buildExpertisePayloads(expertiseEn = [], expertiseAr = []) {
  const enSections = parseFlatExpertise(expertiseEn);
  const arSections = parseFlatExpertise(expertiseAr);
  const count = Math.max(enSections.length, arSections.length, 1);

  return Array.from({ length: count }, (_, index) => {
    const en = enSections[index] || { heading: '', points: [] };
    const ar = arSections[index] || { heading: '', points: [] };

    return {
      subHeading: en.heading.replace(/[:：]\s*$/, '').trim(),
      subHeadingAr: ar.heading.replace(/[:：]\s*$/, '').trim(),
      points: en.points,
      pointsAr: ar.points,
    };
  });
}

function normalizePoints(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => stripTrailingPeriod(item)).filter(Boolean);
}

export async function resolveExpertiseRefs(expertiseInput) {
  if (!Array.isArray(expertiseInput)) return [];

  const expertiseIds = [];

  for (const item of expertiseInput) {
    if (typeof item === 'string' && isValidObjectId(item)) {
      const exists = await Expertise.exists({ _id: item });
      if (!exists) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Expertise not found');
      }
      expertiseIds.push(new mongoose.Types.ObjectId(item));
      continue;
    }

    if (typeof item === 'string') {
      const text = stripTrailingPeriod(item);
      if (!text) continue;

      const created = await Expertise.create({
        subHeading: '',
        subHeadingAr: '',
        points: [text],
        pointsAr: [],
      });
      expertiseIds.push(created._id);
      continue;
    }

    if (item && typeof item === 'object') {
      const refId = String(item._id || item.id || '').trim();

      if (isValidObjectId(refId)) {
        const existing = await Expertise.findById(refId);
        if (existing) {
          existing.set({
            subHeading: String(item.subHeading || existing.subHeading || '').trim(),
            subHeadingAr: String(item.subHeadingAr || existing.subHeadingAr || '').trim(),
            points: normalizePoints(item.points ?? existing.points),
            pointsAr: normalizePoints(item.pointsAr ?? existing.pointsAr),
          });
          await existing.save();
          expertiseIds.push(existing._id);
          continue;
        }
      }

      const created = await Expertise.create({
        subHeading: String(item.subHeading || '').trim(),
        subHeadingAr: String(item.subHeadingAr || '').trim(),
        points: normalizePoints(item.points),
        pointsAr: normalizePoints(item.pointsAr),
      });
      expertiseIds.push(created._id);
    }
  }

  return expertiseIds;
}

export async function cleanInvalidDoctorExpertiseRefs(DoctorModel) {
  const doctors = await DoctorModel.find({
    expertise: { $exists: true, $not: { $size: 0 } },
  })
    .select('_id expertise')
    .lean();

  let cleaned = 0;

  for (const doctor of doctors) {
    const current = Array.isArray(doctor.expertise) ? doctor.expertise : [];
    const valid = filterValidObjectIds(current);

    if (valid.length !== current.length) {
      await DoctorModel.updateOne({ _id: doctor._id }, { $set: { expertise: valid } });
      cleaned += 1;
    }
  }

  return cleaned;
}
