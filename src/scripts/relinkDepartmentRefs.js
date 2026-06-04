import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import connectDB from "../config/db.js";
import Department from "../modules/departments/models/department.model.js";
import Doctor from "../modules/doctors/models/doctor.model.js";
import Subspeciality from "../modules/subspeciality/model/subspeciality.model.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROYAL_HAYAT_DATA = path.resolve(
  __dirname,
  "../../../RoyalHayat/src/data",
);

/** Doctor department labels in source data → Department.name in DB */
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
  "Al Safwa HealthCare": "Al Safwa HealthCare",
  "Royale Home Health": "Royale Home Health",
  "Clinical Pharmacy": "Clinical Pharmacy",
  "Royale Hayat Pharmacy": "Royale Hayat Pharmacy",
  "Center for Diagnostic Imaging": "Center for Diagnostic Imaging",
  "Intensive Care": "Intensive Care",
  "Pain Management": "Pain Management",
  "Family Medicine": "Family Medicine",
  Dermatology: "Dermatology",
  Neonatal: "Neonatal",
  Pediatrics: "Pediatrics",
  "Internal Medicine": "Internal Medicine",
  "Obstetrics & Gynecology": "Obstetrics & Gynecology",
  "Obstetrics and Gynecology": "Obstetrics & Gynecology",
  Physiotherapy: "Physiotherapy",
};

const extractExportedArray = (raw, exportName) => {
  const marker = `export const ${exportName}`;
  const markerIndex = raw.indexOf(marker);
  if (markerIndex < 0) {
    throw new Error(`Could not find "${exportName}" export`);
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
    throw new Error(`Could not parse array bounds for "${exportName}"`);
  }

  return raw.slice(arrayStart, arrayEnd);
};

const loadTsArrayExport = async (fileName, exportName, transformSource) => {
  const filePath = path.join(ROYAL_HAYAT_DATA, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`${fileName} not found at ${filePath}`);
  }

  let raw = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  let arraySource = extractExportedArray(raw, exportName);

  if (transformSource) {
    arraySource = transformSource(arraySource);
  }

  const tempPath = path.join(__dirname, `.${exportName}.relink.temp.mjs`);
  fs.writeFileSync(
    tempPath,
    `export const ${exportName} = ${arraySource};\n`,
    "utf8",
  );

  try {
    const mod = await import(pathToFileURL(tempPath));
    return mod[exportName];
  } finally {
    fs.unlinkSync(tempPath);
  }
};

const loadFrontendDoctors = () =>
  loadTsArrayExport("doctors.ts", "doctors");

const loadFrontendDepartments = () =>
  loadTsArrayExport("departments.ts", "departments", (source) =>
    source.replace(/\s*,\s*icon:\s*\w+/g, ""),
  );

const loadDepartmentDetails = () =>
  loadTsArrayExport("departmentDetails.ts", "departmentDetails");

const resolveDepartmentName = (label) => {
  const trimmed = String(label || "").trim();
  return DEPARTMENT_ALIASES[trimmed] || trimmed;
};

const buildDepartmentLookups = async () => {
  const departments = await Department.find({})
    .select("_id name departmentId")
    .lean();

  const byName = new Map();
  const byClinicCode = new Map();
  const validIds = new Set();

  for (const dept of departments) {
    validIds.add(String(dept._id));
    byName.set(dept.name.trim().toLowerCase(), dept._id);

    const code = String(dept.departmentId || "").trim();
    if (code) {
      byClinicCode.set(code.toLowerCase(), dept._id);
    }
  }

  return { byName, byClinicCode, validIds, departments };
};

const resolveDepartmentObjectId = (label, lookups) => {
  const resolvedName = resolveDepartmentName(label);
  const byName = lookups.byName.get(resolvedName.toLowerCase());
  if (byName) return byName;

  const byCode = lookups.byClinicCode.get(
    String(label || "").trim().toLowerCase(),
  );
  return byCode || null;
};

const buildSubspecialitySourceRows = (
  departmentsList,
  detailsList,
) => {
  const detailsBySlug = new Map(
    detailsList.map((d) => [String(d.slug || "").trim(), d]),
  );

  const rows = [];

  for (const dept of departmentsList) {
    const slug = String(dept.slug || "").trim();
    const departmentName = String(dept.name || "").trim();
    const detail = detailsBySlug.get(slug);
    const subs = dept.subs || [];

    for (const sub of subs) {
      const subSlug = String(sub.subspecialityId || sub.slug || "")
        .trim()
        .toLowerCase();
      const detailSub = detail?.subDepartments?.find(
        (s) => String(s.slug || "").trim().toLowerCase() === subSlug,
      );

      rows.push({
        departmentName,
        name: String(sub.name || "").trim(),
        arabicName: String(sub.nameAr || "").trim(),
        description:
          detailSub?.intro?.trim() ||
          `Specialized care within ${departmentName}.`,
        arabicDescription:
          detailSub?.introAr?.trim() ||
          `رعاية متخصصة ضمن قسم ${dept.nameAr || departmentName}.`,
      });
    }
  }

  return rows;
};

async function relinkDoctors(lookups) {
  const frontendDoctors = await loadFrontendDoctors();
  let updated = 0;
  let skipped = 0;

  for (const entry of frontendDoctors) {
    const departmentId = resolveDepartmentObjectId(
      entry.department,
      lookups,
    );

    if (!departmentId) {
      console.warn(
        `⚠️ Doctor "${entry.name}" — department not found: ${entry.department}`,
      );
      skipped += 1;
      continue;
    }

    const providerCode = String(entry.providerCode || "").trim();
    const slug = String(entry.id || "").trim();
    const doctorKey = providerCode || slug;

    const query = providerCode
      ? { doctorId: providerCode }
      : slug
        ? { doctorId: slug }
        : { name: String(entry.name || "").trim() };

    const doctor = await Doctor.findOne(query);

    if (!doctor) {
      skipped += 1;
      continue;
    }

    if (String(doctor.department) !== String(departmentId)) {
      doctor.department = departmentId;
      await doctor.save();
      updated += 1;
      console.log(
        `↻ Doctor "${doctor.name}" → ${resolveDepartmentName(entry.department)} (${departmentId})`,
      );
    }
  }

  return { updated, skipped, total: frontendDoctors.length };
}

async function relinkSubspecialities(lookups, sourceRows) {
  let updated = 0;
  let skipped = 0;

  for (const sub of sourceRows) {
    const departmentId = resolveDepartmentObjectId(
      sub.departmentName,
      lookups,
    );

    if (!departmentId) {
      console.warn(
        `⚠️ Subspeciality "${sub.name}" — department not found: ${sub.departmentName}`,
      );
      skipped += 1;
      continue;
    }

    const existing = await Subspeciality.findOne({
      $or: [
        {
          department: departmentId,
          name: sub.name,
        },
        {
          department: departmentId,
          arabicName: sub.arabicName,
        },
        { name: sub.name },
        { arabicName: sub.arabicName },
      ],
    });

    if (!existing) {
      skipped += 1;
      continue;
    }

    if (String(existing.department) !== String(departmentId)) {
      existing.department = departmentId;
      await existing.save();
      updated += 1;
      console.log(
        `↻ Subspeciality "${existing.name}" → ${sub.departmentName} (${departmentId})`,
      );
    }
  }

  return { updated, skipped, total: sourceRows.length };
}

async function relinkOrphans(lookups) {
  let doctorsFixed = 0;
  let subsFixed = 0;

  const doctors = await Doctor.find({})
    .populate("department", "name departmentId")
    .lean();

  for (const doc of doctors) {
    const currentId = doc.department?._id || doc.department;
    const isValid =
      currentId && lookups.validIds.has(String(currentId));

    if (isValid) continue;

    const deptName = doc.department?.name;
    if (!deptName) continue;

    const newId = lookups.byName.get(deptName.trim().toLowerCase());
    if (!newId) continue;

    await Doctor.updateOne({ _id: doc._id }, { $set: { department: newId } });
    doctorsFixed += 1;
    console.log(`↻ Orphan doctor "${doc.name}" → ${deptName} (${newId})`);
  }

  const subs = await Subspeciality.find({})
    .populate("department", "name departmentId")
    .lean();

  for (const sub of subs) {
    const currentId = sub.department?._id || sub.department;
    const isValid =
      currentId && lookups.validIds.has(String(currentId));

    if (isValid) continue;

    const deptName = sub.department?.name;
    if (!deptName) continue;

    const newId = lookups.byName.get(deptName.trim().toLowerCase());
    if (!newId) continue;

    await Subspeciality.updateOne(
      { _id: sub._id },
      { $set: { department: newId } },
    );
    subsFixed += 1;
    console.log(`↻ Orphan subspeciality "${sub.name}" → ${deptName} (${newId})`);
  }

  return { doctorsFixed, subsFixed };
}

const relinkDepartmentRefs = async () => {
  await connectDB();

  try {
    const lookups = await buildDepartmentLookups();
    console.log(
      `📦 Loaded ${lookups.departments.length} departments from database`,
    );

    const [departmentsList, detailsList] = await Promise.all([
      loadFrontendDepartments(),
      loadDepartmentDetails(),
    ]);

    const subspecialityRows = buildSubspecialitySourceRows(
      departmentsList,
      detailsList,
    );

    console.log("\n—— Relinking doctors ——");
    const doctorStats = await relinkDoctors(lookups);

    console.log("\n—— Relinking subspecialities ——");
    const subStats = await relinkSubspecialities(
      lookups,
      subspecialityRows,
    );

    console.log("\n—— Fixing orphan references ——");
    const orphanStats = await relinkOrphans(lookups);

    console.log(
      `\n✅ Relink completed.\n` +
        `   Doctors: ${doctorStats.updated} updated (${doctorStats.skipped} skipped / ${doctorStats.total} in source)\n` +
        `   Subspecialities: ${subStats.updated} updated (${subStats.skipped} skipped / ${subStats.total} in source)\n` +
        `   Orphans fixed: ${orphanStats.doctorsFixed} doctors, ${orphanStats.subsFixed} subspecialities`,
    );
  } catch (error) {
    console.error("❌ Relink failed:", error.message);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

void relinkDepartmentRefs();
