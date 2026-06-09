import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const frontendDoctorsPath = path.resolve(
  backendRoot,
  "../RoyalHayat/src/data/doctors.ts",
);
const backendDoctorsPath = path.resolve(backendRoot, "doctorsWithClinicCodes.ts");

const { doctors } = await import(pathToFileURL(frontendDoctorsPath).href);
const backendText = fs.readFileSync(backendDoctorsPath, "utf8");

const frontendById = new Map(doctors.map((doctor) => [doctor.id, doctor]));

function extractBackendPreserveFields(text) {
  const preserveById = new Map();
  const idMatches = [...text.matchAll(/^\s+id: '([^']+)',$/gm)];

  for (let index = 0; index < idMatches.length; index += 1) {
    const id = idMatches[index][1];
    const start = idMatches[index].index;
    const end =
      index + 1 < idMatches.length ? idMatches[index + 1].index : text.length;
    const block = text.slice(start, end);

    const preserved = { id };
    const departmentClinicCode = block.match(
      /departmentClinicCode: (undefined|'[^']*'),/,
    );
    const clinicCode = block.match(/clinicCode: (undefined|'[^']*'),/);
    const providerCode = block.match(/providerCode: (undefined|'[^']*'),/);

    if (departmentClinicCode) {
      preserved.departmentClinicCode =
        departmentClinicCode[1] === "undefined"
          ? undefined
          : departmentClinicCode[1].slice(1, -1);
    }
    if (clinicCode) {
      preserved.clinicCode =
        clinicCode[1] === "undefined" ? undefined : clinicCode[1].slice(1, -1);
    }
    if (providerCode) {
      preserved.providerCode =
        providerCode[1] === "undefined"
          ? undefined
          : providerCode[1].slice(1, -1);
    }

    preserveById.set(id, preserved);
  }

  return { preserveById, orderedIds: idMatches.map((match) => match[1]) };
}

function escapeString(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r\n/g, "\\n")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\n");
}

function formatValue(value, indent) {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value === "string") return `'${escapeString(value)}'`;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const inner = value
      .map(
        (item) =>
          `${" ".repeat(indent + 2)}'${escapeString(String(item))}',`,
      )
      .join("\n");
    return `[\n${inner}\n${" ".repeat(indent)}]`;
  }
  return JSON.stringify(value);
}

function formatDoctor(doctor, indent = 2) {
  const pad = " ".repeat(indent);
  const lines = [`${pad}{`];

  const orderedKeys = [
    "id",
    "image",
    "name",
    "nameAr",
    "specialty",
    "specialtyAr",
    "department",
    "departmentAr",
    "departmentClinicCode",
    "clinicCode",
    "providerCode",
    "title",
    "titleAr",
    "bio",
    "bioAr",
    "qualifications",
    "qualificationsAr",
    "expertise",
    "expertiseAr",
    "languages",
    "languagesAr",
    "initials",
    "color",
    "symptoms",
    "availableOnline",
    "hideBooking",
    "departmentId",
  ];

  for (const key of orderedKeys) {
    if (!(key in doctor)) continue;
    const value = doctor[key];
    if (value === undefined && key !== "departmentClinicCode") continue;
    lines.push(`${pad}  ${key}: ${formatValue(value, indent + 2)},`);
  }

  lines.push(`${pad}},`);
  return lines.join("\n");
}

const { preserveById, orderedIds } = extractBackendPreserveFields(backendText);

let updatedCount = 0;
const missingInFrontend = [];

const merged = orderedIds.map((id) => {
  const preserved = preserveById.get(id);
  const frontendDoctor = frontendById.get(id);

  if (!frontendDoctor) {
    missingInFrontend.push(id);
    return null;
  }

  const mergedDoctor = { ...frontendDoctor };
  mergedDoctor.id = id;
  if (preserved?.departmentClinicCode !== undefined) {
    mergedDoctor.departmentClinicCode = preserved.departmentClinicCode;
  } else {
    delete mergedDoctor.departmentClinicCode;
  }
  if (preserved?.clinicCode !== undefined) {
    mergedDoctor.clinicCode = preserved.clinicCode;
  } else {
    delete mergedDoctor.clinicCode;
  }
  if (preserved?.providerCode !== undefined) {
    mergedDoctor.providerCode = preserved.providerCode;
  } else {
    delete mergedDoctor.providerCode;
  }

  updatedCount += 1;
  return mergedDoctor;
}).filter(Boolean);

const interfaceBlock = `export interface DoctorWithClinicCode {
  id: string;
  name: string;
  nameAr: string;
  specialty: string;
  specialtyAr: string;
  department: string;
  departmentAr: string;
  departmentClinicCode?: string;
  /** Subspecialty / scheduling code (may mirror departmentClinicCode). */
  clinicCode?: string;
  title: string;
  titleAr: string;
  bio: string;
  bioAr: string;
  qualifications: string[];
  qualificationsAr: string[];
  expertise: string[];
  expertiseAr: string[];
  languages: string[];
  languagesAr: string[];
  initials: string;
  color: string;
  symptoms: string[];
  availableOnline?: boolean;
  image?: string;
  hideBooking?: boolean;
  departmentId?: string;
  providerCode?: string;
}
`;

const doctorsBlock =
  `export const doctorsWithClinicCodes: DoctorWithClinicCode[] = [\n` +
  merged.map((doctor) => formatDoctor(doctor)).join("\n") +
  `\n];\n`;

const helpersBlock = `
// Helper function to get doctors by department clinic code
export const getDoctorsByClinicCode = (clinicCode: string): DoctorWithClinicCode[] => {
  return doctorsWithClinicCodes.filter(doctor => doctor.departmentClinicCode === clinicCode);
};

// Helper function to get doctors by department name
export const getDoctorsByDepartment = (departmentName: string): DoctorWithClinicCode[] => {
  return doctorsWithClinicCodes.filter(doctor => doctor.department === departmentName);
};
`;

fs.writeFileSync(
  backendDoctorsPath,
  `${interfaceBlock}\n${doctorsBlock}${helpersBlock}`,
  "utf8",
);

console.log(`Updated ${updatedCount} doctors in backend file.`);
if (missingInFrontend.length > 0) {
  console.log(
    `Skipped backend doctors missing in frontend (${missingInFrontend.length}):`,
    missingInFrontend.join(", "),
  );
}
