import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import connectDB from "../config/db.js";
import { toPointerArray } from "./seedText.util.js";
import Department from "../modules/departments/models/department.model.js";
import Subspeciality from "../modules/subspeciality/model/subspeciality.model.js";
import CustomSubspeciality from "../modules/subspeciality/model/customSubspeciality.model.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROYAL_HAYAT_DATA = path.resolve(
  __dirname,
  "../../../RoyalHayat/src/data",
);

/** departmentDetails.name → Department.name in DB (when labels differ) */
const DEPARTMENT_NAME_ALIASES = {
  "plastic surgery & cosmetology": "Plastic Surgery & Cosmetology",
  "ent (ear, nose & throat)": "ENT (Ear, Nose & Throat)",
  "royale hayat dental": "Dental Clinic",
  "royale hayat pharmacy": "Royale Hayat Pharmacy",
  "al safwa healthcare program": "Al Safwa HealthCare",
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

  const tempPath = path.join(__dirname, `.${exportName}.subseed.temp.mjs`);
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

const loadDepartmentDetails = () =>
  loadTsArrayExport("departmentDetails.ts", "departmentDetails");

const loadFrontendDepartments = () =>
  loadTsArrayExport("departments.ts", "departments", (source) =>
    source.replace(/\s*,\s*icon:\s*\w+/g, ""),
  );

const trimOrUndefined = (value) => {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
};

const toStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
};

const padDescription = (text, fallback) => {
  const value = String(text || fallback || "").trim();
  if (value.length >= 10) return value;
  const padded = value || "Specialized clinical care at Royale Hayat Hospital.";
  return padded.length >= 10 ? padded : `${padded} Royale Hayat Hospital.`;
};

const mapSectionToCustomBlocks = (section) => {
  const blocks = [];

  const appendBlock = (block) => {
    const heading = trimOrUndefined(block.title);
    const subHeading = trimOrUndefined(block.content);
    const explanations = toPointerArray(block.items);
    const arabicHeading = trimOrUndefined(block.titleAr);
    const arabicSubHeading = trimOrUndefined(block.contentAr);
    const arabicExplanations = toPointerArray(block.itemsAr);

    if (
      !heading &&
      !subHeading &&
      explanations.length === 0 &&
      !arabicHeading &&
      !arabicSubHeading &&
      arabicExplanations.length === 0
    ) {
      return;
    }

    blocks.push({
      heading,
      subHeading,
      explanations,
      arabicHeading,
      arabicSubHeading,
      arabicExplanations,
    });
  };

  appendBlock(section);

  if (Array.isArray(section.subsections)) {
    for (const subsection of section.subsections) {
      appendBlock(subsection);
    }
  }

  return blocks;
};

const buildCustomBlocksFromSections = (sections) => {
  if (!Array.isArray(sections)) return [];
  return sections.flatMap((section) => mapSectionToCustomBlocks(section));
};

const buildSubspecialityRowsFromDetails = (detailsList) => {
  const rows = [];

  for (const detail of detailsList) {
    const departmentName = String(detail.name || "").trim();
    const subDepartments = detail.subDepartments;

    if (!departmentName || !Array.isArray(subDepartments)) continue;

    for (const sub of subDepartments) {
      const name = String(sub.name || "").trim();
      if (!name) continue;

      rows.push({
        departmentName,
        departmentSlug: String(detail.slug || "").trim(),
        name,
        arabicName: String(sub.nameAr || name).trim(),
        description: padDescription(sub.intro, name),
        arabicDescription: padDescription(
          sub.introAr,
          sub.nameAr || name,
        ),
        customBlocks: buildCustomBlocksFromSections(sub.sections),
      });
    }
  }

  return rows;
};

const buildDepartmentLookups = async (departmentsList) => {
  const dbDepartments = await Department.find({})
    .select("_id name")
    .lean();

  const byName = new Map();

  for (const dept of dbDepartments) {
    byName.set(dept.name.trim().toLowerCase(), dept._id);
  }

  const slugToFrontendName = new Map(
    departmentsList.map((d) => [
      String(d.slug || "").trim().toLowerCase(),
      String(d.name || "").trim(),
    ]),
  );

  const resolveDepartmentId = (departmentName, departmentSlug) => {
    const aliasKey = departmentName.trim().toLowerCase();
    const aliasedName =
      DEPARTMENT_NAME_ALIASES[aliasKey] || departmentName;

    let id = byName.get(aliasedName.trim().toLowerCase());
    if (id) return id;

    const frontendName = slugToFrontendName.get(
      String(departmentSlug || "").trim().toLowerCase(),
    );

    if (frontendName) {
      id = byName.get(frontendName.trim().toLowerCase());
      if (id) return id;
    }

    return null;
  };

  return { resolveDepartmentId };
};

async function replaceCustomSubspecialitiesForSubspeciality(
  subspecialityId,
  items,
) {
  const existing = await Subspeciality.findById(subspecialityId)
    .select("customSubspecialities")
    .lean();

  const oldIds = (existing?.customSubspecialities || []).map((x) =>
    String(x),
  );

  if (oldIds.length > 0) {
    await CustomSubspeciality.deleteMany({ _id: { $in: oldIds } });
  }

  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return [];

  const docs = await CustomSubspeciality.insertMany(
    list.map((item) => ({
      heading: trimOrUndefined(item.heading),
      subHeading: trimOrUndefined(item.subHeading),
      explanations: toPointerArray(item.explanations),
      arabicHeading: trimOrUndefined(item.arabicHeading),
      arabicSubHeading: trimOrUndefined(item.arabicSubHeading),
      arabicExplanations: toPointerArray(item.arabicExplanations),
    })),
  );

  return docs.map((d) => d._id);
}

const seedSubspecialities = async () => {
  await connectDB();

  let created = 0;
  let updated = 0;
  let skipped = 0;

  try {
    const [detailsList, departmentsList] = await Promise.all([
      loadDepartmentDetails(),
      loadFrontendDepartments(),
    ]);

    const rows = buildSubspecialityRowsFromDetails(detailsList);
    const { resolveDepartmentId } = await buildDepartmentLookups(
      departmentsList,
    );

    console.log(
      `📦 Loaded ${rows.length} subspecialities from departmentDetails (${detailsList.length} departments)`,
    );

    for (const sub of rows) {
      const departmentId = resolveDepartmentId(
        sub.departmentName,
        sub.departmentSlug,
      );

      if (!departmentId) {
        console.warn(
          `⚠️ Skipped "${sub.name}" — department not found: ${sub.departmentName}. Run seed:departments first.`,
        );
        skipped += 1;
        continue;
      }

      const payload = {
        name: sub.name,
        arabicName: sub.arabicName,
        description: sub.description,
        arabicDescription: sub.arabicDescription,
        department: departmentId,
      };

      let doc = await Subspeciality.findOne({
        department: departmentId,
        $or: [{ name: payload.name }, { arabicName: payload.arabicName }],
      });

      if (doc) {
        doc.set(payload);
        await doc.save();
        updated += 1;
        console.log(
          `↻ Updated subspeciality: ${payload.name} → ${sub.departmentName}`,
        );
      } else {
        doc = await Subspeciality.create({
          ...payload,
          customSubspecialities: [],
        });
        created += 1;
        console.log(
          `✅ Created subspeciality: ${payload.name} → ${sub.departmentName}`,
        );
      }

      const customIds = await replaceCustomSubspecialitiesForSubspeciality(
        doc._id,
        sub.customBlocks,
      );

      await Subspeciality.findByIdAndUpdate(doc._id, {
        $set: { customSubspecialities: customIds },
      });

      if (sub.customBlocks.length > 0) {
        console.log(`   ↳ ${sub.customBlocks.length} custom section(s)`);
      }
    }

    console.log(
      `✅ Subspeciality seeding completed. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`,
    );
  } catch (error) {
    console.error("❌ Subspeciality seeding failed:", error.message);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

void seedSubspecialities();
