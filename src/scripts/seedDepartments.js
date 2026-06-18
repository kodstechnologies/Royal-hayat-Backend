import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import connectDB from "../config/db.js";
import { toPointerArray } from "./seedText.util.js";
import { resolveDoctorTaglines } from "./doctorTaglines.data.js";
import Department from "../modules/departments/models/department.model.js";
import Catagory from "../modules/catagory/model/catagory.model.js";
import CustomExplainantion from "../modules/departments/models/customExplainantion.model.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROYAL_HAYAT_DATA = path.resolve(
  __dirname,
  "../../../RoyalHayat/src/data",
);

const CATEGORIES = [
  {
    key: "CLINICAL SPECIALITY",
    name: "CLINICAL SPECIALITY",
    arabicName: "التخصصات السريرية",
  },
  {
    key: "CLINICAL SUPPORT SERVICE",
    name: "CLINICAL SUPPORT SERVICE",
    arabicName: "خدمات الدعم السريري",
  },
  {
    key: "HOME CARE SERVICE",
    name: "HOME CARE SERVICE",
    arabicName: "خدمات الرعاية المنزلية",
  },
];

const MAIN_CATEGORY_MAP = {
  "Clinical Speciality": "CLINICAL SPECIALITY",
  "Clinical Support Service": "CLINICAL SUPPORT SERVICE",
  "Home Care Service": "HOME CARE SERVICE",
};

/** departmentDetails slug → alternate slugs in departments.ts */
const DETAIL_SLUG_ALIASES = {
  "al-safwa-healthcare-program": ["al-safwa-healthcare"],
  "al-safwa-healthcare": ["al-safwa-healthcare-program"],
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

  const tempPath = path.join(
    __dirname,
    `.${exportName}.seed.temp.mjs`,
  );
  const moduleSource = `export const ${exportName} = ${arraySource};\n`;
  fs.writeFileSync(tempPath, moduleSource, "utf8");

  try {
    const mod = await import(pathToFileURL(tempPath));
    return mod[exportName];
  } finally {
    fs.unlinkSync(tempPath);
  }
};

const loadFrontendDepartments = () =>
  loadTsArrayExport("departments.ts", "departments", (source) =>
    source.replace(/\s*,\s*icon:\s*\w+/g, ""),
  );

const loadDepartmentDetails = () =>
  loadTsArrayExport("departmentDetails.ts", "departmentDetails");

const trimOrUndefined = (value) => {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
};

const toStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
};

const mapSectionToCustomBlocks = (section) => {
  const blocks = [];

  const appendBlock = (block) => {
    const heading = trimOrUndefined(block.title);
    const subHeading = trimOrUndefined(block.content);
    const explaination = toPointerArray(block.items);
    const arabicHeading = trimOrUndefined(block.titleAr);
    const arabicSubHeading = trimOrUndefined(block.contentAr);
    const arabicExplaination = toPointerArray(block.itemsAr);

    if (
      !heading &&
      !subHeading &&
      explaination.length === 0 &&
      !arabicHeading &&
      !arabicSubHeading &&
      arabicExplaination.length === 0
    ) {
      return;
    }

    blocks.push({
      heading,
      subHeading,
      explaination,
      arabicHeading,
      arabicSubHeading,
      arabicExplaination,
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

const buildCustomExplainantionsFromDetail = (detail) => {
  if (!detail || !Array.isArray(detail.sections)) return [];

  return detail.sections.flatMap((section) =>
    mapSectionToCustomBlocks(section),
  );
};

const buildDetailsIndex = (detailsList) => {
  const bySlug = new Map();

  for (const detail of detailsList) {
    const slug = String(detail.slug || "").trim();
    if (!slug) continue;

    bySlug.set(slug, detail);

    const aliases = DETAIL_SLUG_ALIASES[slug] || [];
    for (const alias of aliases) {
      if (!bySlug.has(alias)) {
        bySlug.set(alias, detail);
      }
    }
  }

  return bySlug;
};

const resolveDepartmentId = (dept) => {
  const code = String(dept.clinicCode || "").trim();
  if (code) return code;
  return `RHH-${dept.id}`;
};

const resolveCategoryKey = (dept) => {
  const main = String(dept.mainCategory || "").trim();
  return MAIN_CATEGORY_MAP[main] || "CLINICAL SPECIALITY";
};

const padDescription = (text, fallback) => {
  const value = String(text || fallback || "").trim();
  if (value.length >= 10) return value;
  const padded = value || "Department information.";
  return padded.length >= 10 ? padded : `${padded} Royale Hayat Hospital.`;
};

async function replaceCustomExplainantionsForDepartment(
  departmentId,
  items,
) {
  const existing = await Department.findById(departmentId)
    .select("customExplainantions")
    .lean();

  const oldIds = (existing?.customExplainantions || []).map((x) =>
    String(x),
  );

  if (oldIds.length > 0) {
    await CustomExplainantion.deleteMany({ _id: { $in: oldIds } });
  }

  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return [];

  const docs = await CustomExplainantion.insertMany(
    list.map((item) => ({
      heading: trimOrUndefined(item.heading),
      subHeading: trimOrUndefined(item.subHeading),
      explaination: toPointerArray(item.explaination),
      arabicHeading: trimOrUndefined(item.arabicHeading),
      arabicSubHeading: trimOrUndefined(item.arabicSubHeading),
      arabicExplaination: toPointerArray(item.arabicExplaination),
    })),
  );

  return docs.map((d) => d._id);
}

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const upsertCategories = async () => {
  const categoryIdByKey = {};

  for (const cat of CATEGORIES) {
    let doc = await Catagory.findOne({
      $or: [
        { name: cat.name },
        { arabicName: cat.arabicName },
        { name: { $regex: new RegExp(`^${escapeRegex(cat.name)}$`, "i") } },
      ],
    });

    if (doc) {
      doc.name = cat.name;
      doc.arabicName = cat.arabicName;
      await doc.save();
    } else {
      doc = await Catagory.create({
        name: cat.name,
        arabicName: cat.arabicName,
      });
    }

    categoryIdByKey[cat.key] = doc._id;
    console.log(`✅ Category ready: ${cat.name} (${doc._id})`);
  }

  return categoryIdByKey;
};

const seedDepartments = async () => {
  await connectDB();

  let created = 0;
  let updated = 0;
  let skipped = 0;

  try {
    const [frontendDepartments, departmentDetailsList] = await Promise.all([
      loadFrontendDepartments(),
      loadDepartmentDetails(),
    ]);

    const detailsBySlug = buildDetailsIndex(departmentDetailsList);
    const categoryIdByKey = await upsertCategories();

    console.log(
      `📦 Loaded ${frontendDepartments.length} departments and ${departmentDetailsList.length} department detail records`,
    );

    for (const dept of frontendDepartments) {
      const slug = String(dept.slug || "").trim();
      const detail = detailsBySlug.get(slug);
      const departmentId = resolveDepartmentId(dept);
      const categoryKey = resolveCategoryKey(dept);
      const catagory = categoryIdByKey[categoryKey];

      if (!catagory) {
        console.warn(
          `⚠️ Skipped "${dept.name}" — unknown category: ${dept.mainCategory}`,
        );
        skipped += 1;
        continue;
      }

      const name = String(dept.name || "").trim();
      const arabicName = String(dept.nameAr || detail?.nameAr || name).trim();
      const description = padDescription(
        detail?.intro,
        dept.desc,
      );
      const arabicDescription = padDescription(
        detail?.introAr,
        dept.descAr,
      );

      const customBlocks = buildCustomExplainantionsFromDetail(detail);
      const doctorTaglines = resolveDoctorTaglines(name);

      const basePayload = {
        departmentId,
        deptTagline: trimOrUndefined(dept.desc),
        deptTaglineArabic: trimOrUndefined(dept.descAr),
        doctorTagline: trimOrUndefined(doctorTaglines?.en ?? dept.desc),
        doctorTaglineArabic: trimOrUndefined(doctorTaglines?.ar ?? dept.descAr),
        name,
        arabicName,
        description,
        arabicDescription,
        medicalField: trimOrUndefined(dept.category),
        medicalFieldAr: trimOrUndefined(dept.medicalFieldAr),
        catagory,
        image: String(dept.img || "").trim(),
        isActive: true,
        order: typeof dept.id === "number" ? dept.id : 0,
      };

      const existing = await Department.findOne({
        $or: [
          { departmentId },
          { name: basePayload.name },
          { arabicName: basePayload.arabicName },
        ],
      });

      let departmentDoc;

      if (existing) {
        existing.set({ ...basePayload, customExplainantions: [] });
        await existing.save();
        departmentDoc = existing;
        updated += 1;
        console.log(`↻ Updated department: ${name} (${departmentId})`);
      } else {
        departmentDoc = await Department.create({
          ...basePayload,
          customExplainantions: [],
        });
        created += 1;
        console.log(`✅ Created department: ${name} (${departmentId})`);
      }

      const customIds = await replaceCustomExplainantionsForDepartment(
        departmentDoc._id,
        customBlocks,
      );

      if (customIds.length > 0) {
        await Department.findByIdAndUpdate(departmentDoc._id, {
          $set: { customExplainantions: customIds },
        });
      }

      await Department.findByIdAndUpdate(departmentDoc._id, {
        $unset: { tagLine: 1, arabicTagline: 1 },
      });

      if (!detail) {
        console.warn(
          `   ⚠️ No departmentDetails match for slug "${slug}" — used departments.ts description only`,
        );
      } else {
        console.log(
          `   ↳ ${customBlocks.length} custom section(s) from departmentDetails`,
        );
      }
    }

    console.log(
      `✅ Department seeding completed. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`,
    );
  } catch (error) {
    console.error("❌ Department seeding failed:", error.message);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

void seedDepartments();
