import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import connectDB from "../config/db.js";
import Department from "../modules/departments/models/department.model.js";
import Doctor from "../modules/doctors/models/doctor.model.js";
import {
  buildExpertisePayloads,
  cleanInvalidDoctorExpertiseRefs,
  resolveExpertiseRefs,
} from "../modules/doctors/utils/expertise.util.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Frontend department labels → seeded Department.name */
const DEPARTMENT_ALIASES = {
  "General Surgery": "General & Laparoscopic Surgery",
  Pediatric: "Pediatrics",
  "La Cosmetique": "Plastic Surgery & Cosmetology",
  "Plastic Surgery": "Plastic Surgery & Cosmetology",
  Radiology: "Center for Diagnostic Imaging",
  Pharmacy: "Royale Hayat Pharmacy",
  Dental: "Dental Clinic",
  Laboratory: "Laboratory Services",
  Nutricare: "Family Medicine",
  ENT: "ENT (Ear, Nose & Throat)",
  "IVF & Reproductive Medicine": "Reproductive Medicine & IVF",
  "Reproductive Medicine": "Reproductive Medicine & IVF",
  IVF: "Reproductive Medicine & IVF",
  "Anesthesia & Intensive Care": "Anesthesia",
  "Al Safwa": "Al Safwa HealthCare",
};

const loadFrontendDoctors = async () => {
  /** Mirrors Royal-hayat-admin-frontend/src/data/doctors.ts */
  const doctorsTsPath = path.resolve(
    __dirname,
    "../../../RoyalHayat/src/data/doctors.ts",
  );

  if (!fs.existsSync(doctorsTsPath)) {
    throw new Error(`doctors.ts not found at ${doctorsTsPath}`);
  }

  const raw = fs.readFileSync(doctorsTsPath, "utf8").replace(/\r\n/g, "\n");
  const marker = "export const doctors";
  const markerIndex = raw.indexOf(marker);
  if (markerIndex < 0) {
    throw new Error("Could not find doctors array export in doctors.ts");
  }

  const equalsIndex = raw.indexOf("=", markerIndex);
  const arrayStart = raw.indexOf("[", equalsIndex);
  let depth = 0;
  let arrayEnd = -1;

  for (let i = arrayStart; i < raw.length; i += 1) {
    const char = raw[i];
    if (char === "[") depth += 1;
    else if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        arrayEnd = i + 1;
        if (raw[arrayEnd] === ";") arrayEnd += 1;
        break;
      }
    }
  }

  if (arrayEnd < 0) {
    throw new Error("Could not parse doctors array bounds in doctors.ts");
  }

  const source = `export const doctors = ${raw.slice(arrayStart, arrayEnd)};\n`;

  const tempPath = path.join(__dirname, ".doctors.seed.temp.mjs");
  fs.writeFileSync(tempPath, source, "utf8");

  try {
    const mod = await import(pathToFileURL(tempPath));
    return mod.doctors;
  } finally {
    fs.unlinkSync(tempPath);
  }
};

const resolveDepartmentName = (departmentLabel) => {
  const trimmed = String(departmentLabel || "").trim();
  return DEPARTMENT_ALIASES[trimmed] || trimmed;
};

const toStringArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  const single = String(value).trim();
  return single ? [single] : [];
};

const resolveDoctorId = (entry, usedProviderCodes) => {
  const slug = String(entry.id || "").trim();
  const providerCode = String(entry.providerCode || "").trim();

  if (providerCode && !usedProviderCodes.has(providerCode)) {
    usedProviderCodes.add(providerCode);
    return providerCode;
  }

  return slug;
};

const mapDoctorPayload = async (entry, departmentId, doctorId) => {
  const name = String(entry.name || "").trim();
  const nameAr = String(entry.nameAr || "").trim();
  const title = String(entry.title || "").trim();
  const titleArRaw = String(entry.titleAr || "").trim();
  const initials = String(entry.initials || "Dr.").trim() || "Dr.";

  const subspecialities = toStringArray(entry.specialty);
  const subspecialitiesAr = toStringArray(entry.specialtyAr);

  const payload = {
    doctorId,
    name,
    nameAr: nameAr || name,
    department: departmentId,
    subspecialities,
    subspecialitiesAr,
    qualifications: toStringArray(entry.qualifications),
    qualificationsAr: toStringArray(entry.qualificationsAr),
    expertise: await resolveExpertiseRefs(
      buildExpertisePayloads(
        toStringArray(entry.expertise),
        toStringArray(entry.expertiseAr),
      ),
    ),
    languages: toStringArray(entry.languages),
    languagesAr: toStringArray(entry.languagesAr),
    availableOnline: entry.availableOnline !== false,
    isActive: true,
    initials,
    initialsAr: "د.",
  };

  if (title) payload.title = title;
  if (titleArRaw) payload.titleAr = titleArRaw;
  else if (subspecialitiesAr[0]) payload.titleAr = subspecialitiesAr[0];

  const image = String(entry.image || "").trim();
  if (image.startsWith("http://") || image.startsWith("https://")) {
    payload.image = image;
  }

  return payload;
};

const seedDoctors = async () => {
  await connectDB();

  const frontendDoctors = await loadFrontendDoctors();
  const departments = await Department.find({}).select("name _id").lean();

  const departmentMap = new Map(
    departments.map((dept) => [dept.name.trim().toLowerCase(), dept._id]),
  );

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const usedProviderCodes = new Set();

  try {
    const cleaned = await cleanInvalidDoctorExpertiseRefs(Doctor);
    if (cleaned > 0) {
      console.log(`🧹 Cleaned invalid expertise refs on ${cleaned} doctor(s).`);
    }

    for (const entry of frontendDoctors) {
      const slug = String(entry.id || "").trim();
      const departmentName = resolveDepartmentName(entry.department);
      const departmentKey = departmentName.toLowerCase();
      const departmentId = departmentMap.get(departmentKey);

      if (!departmentId) {
        console.warn(
          `⚠️ Skipped "${slug || entry.name}" — department not found: ${entry.department} (resolved: ${departmentName}). Run seed:departments first.`,
        );
        skipped += 1;
        continue;
      }

      const doctorId = resolveDoctorId(entry, usedProviderCodes);
      const payload = await mapDoctorPayload(entry, departmentId, doctorId);

      if (!payload.doctorId || !payload.name || !payload.nameAr) {
        console.warn(`⚠️ Skipped "${slug}" — missing doctorId, name, or nameAr.`);
        skipped += 1;
        continue;
      }

      const existing = await Doctor.findOne({ doctorId: payload.doctorId });

      if (existing) {
        existing.set(payload);
        await existing.save();
        updated += 1;
        console.log(`↻ Updated doctor: ${payload.name} (${payload.doctorId})`);
        continue;
      }

      await Doctor.create(payload);
      created += 1;
      console.log(`✅ Created doctor: ${payload.name} (${payload.doctorId})`);
    }

    console.log(
      `✅ Doctor seeding completed. Created: ${created}, Updated: ${updated}, Skipped: ${skipped} (source: ${frontendDoctors.length} records)`,
    );
  } catch (error) {
    console.error("❌ Doctor seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

void seedDoctors();
