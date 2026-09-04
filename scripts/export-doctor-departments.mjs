import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const DepartmentSchema = new mongoose.Schema({}, { strict: false, collection: "departments" });
const DoctorSchema = new mongoose.Schema({}, { strict: false, collection: "doctors" });

const Department = mongoose.model("ExportDepartment", DepartmentSchema);
const Doctor = mongoose.model("ExportDoctor", DoctorSchema);

const toCsvValue = (value) => {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in .env");
  }

  await mongoose.connect(uri, { dbName: process.env.DB_NAME || "royal-hayat" });

  const [departments, doctors] = await Promise.all([
    Department.find({ isActive: { $ne: false } })
      .select("_id departmentId name arabicName order")
      .sort({ order: 1, name: 1 })
      .lean(),
    Doctor.find({ isActive: true })
      .select("_id doctorId name nameAr department")
      .sort({ name: 1 })
      .lean(),
  ]);

  const deptById = new Map(
    departments.map((dept) => [
      String(dept._id),
      {
        departmentMongoId: String(dept._id),
        departmentId: dept.departmentId ?? "",
        departmentName: dept.name ?? "",
        departmentNameAr: dept.arabicName ?? "",
        order: dept.order ?? 0,
      },
    ]),
  );

  const rows = [];

  for (const doctor of doctors) {
    const deptRefs = Array.isArray(doctor.department) ? doctor.department : [];
    for (const deptRef of deptRefs) {
      const deptKey = String(deptRef?._id ?? deptRef ?? "");
      const dept = deptById.get(deptKey);
      if (!dept) continue;

      rows.push({
        departmentId: dept.departmentId,
        departmentName: dept.departmentName,
        departmentNameAr: dept.departmentNameAr,
        doctorId: doctor.doctorId ?? "",
        doctorName: doctor.name ?? "",
        doctorNameAr: doctor.nameAr ?? "",
      });
    }
  }

  rows.sort((a, b) => {
    const orderA = deptById.get(
      [...deptById.entries()].find(([, v]) => v.departmentId === a.departmentId)?.[0] ?? "",
    )?.order ?? 999;
    const orderB = deptById.get(
      [...deptById.entries()].find(([, v]) => v.departmentId === b.departmentId)?.[0] ?? "",
    )?.order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    if (a.departmentName !== b.departmentName) {
      return a.departmentName.localeCompare(b.departmentName);
    }
    return a.doctorName.localeCompare(b.doctorName);
  });

  const outDir = path.join(__dirname, "output");
  fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, "doctor-departments.json");
  const csvPath = path.join(outDir, "doctor-departments.csv");

  const slimRows = rows.map(({ departmentId, departmentName, doctorId, doctorName }) => ({
    departmentId,
    departmentName,
    doctorId,
    doctorName,
  }));

  fs.writeFileSync(jsonPath, JSON.stringify(slimRows, null, 2), "utf8");

  const csvHeader = "departmentId,departmentName,doctorId,doctorName";
  const csvBody = slimRows
    .map((row) =>
      [row.departmentId, row.departmentName, row.doctorId, row.doctorName].map(toCsvValue).join(","),
    )
    .join("\n");
  fs.writeFileSync(csvPath, `${csvHeader}\n${csvBody}`, "utf8");

  console.log(`Exported ${slimRows.length} rows`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`CSV:  ${csvPath}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
