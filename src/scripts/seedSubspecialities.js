import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Department from "../modules/departments/models/department.model.js";
import Subspeciality from "../modules/subspeciality/model/subspeciality.model.js";

dotenv.config();

/** Mirrors Royal-hayat-admin-frontend/src/data/subspeciality.ts */
const SUBSPECIALITIES = [
  {
    departmentName: "Obstetrics & Gynecology",
    name: "Women's Health",
    nameAr: "صحة المرأة",
    description:
      "At Royale Hayat Hospital, we provide expert care tailored to women's unique needs, from adolescence to the golden years. Our compassionate, patient-centered approach ensures you receive the best preventive and advanced treatments in a supportive environment.",
    descriptionAr:
      "في مستشفى رويال حياة، نقدم رعاية متخصصة مصممة لتلبية احتياجات المرأة الصحية في مختلف مراحل حياتها، من مرحلة المراهقة وحتى سنوات النضج.",
  },
  {
    departmentName: "Obstetrics & Gynecology",
    name: "Urogynecology",
    nameAr: "أمراض المسالك البولية النسائية",
    description:
      "At our Women's Urogynecology Clinic, we provide expert care for urinary and pelvic health challenges. Our specialized team uses the latest diagnostic tools and treatments to offer personalized, evidence-based care in a luxurious, supportive environment.",
    descriptionAr:
      "في عيادة أمراض المسالك البولية النسائية بمستشفى رويال حياة، نقدم رعاية متخصصة لصحة الجهاز البولي وقاع الحوض لدى المرأة.",
  },
  {
    departmentName: "Obstetrics & Gynecology",
    name: "Cosmetic Gynecology",
    nameAr: "أمراض النساء التجميلية",
    description:
      "Introducing Kuwait's first Cosmetic Gynecology Unit at Royale Hayat Hospital. We offer the latest surgical and non-surgical procedures tailored to women's unique needs.",
    descriptionAr:
      "يفتخر مستشفى رويال حياة بتقديم أول وحدة متخصصة في طب النساء التجميلي في الكويت، حيث نوفر أحدث الإجراءات الجراحية وغير الجراحية.",
  },
  {
    departmentName: "Obstetrics & Gynecology",
    name: "Gynecologic Oncology",
    nameAr: "أورام النساء",
    description:
      "Our Gynecologic Oncology unit provides specialized care for gynecological cancers and related conditions.",
    descriptionAr:
      "تقدم وحدة أورام النساء في مستشفى رويال حياة رعاية متخصصة ومتقدمة لتشخيص وعلاج السرطانات النسائية والحالات المرتبطة بها.",
  },
  {
    departmentName: "Obstetrics & Gynecology",
    name: "Physiotherapy",
    nameAr: "العلاج الطبيعي",
    description:
      "At Royale Hayat Hospital, our Physiotherapy Clinic offers advanced treatments tailored to support women's health throughout life. We collaborate with other departments for comprehensive recovery and rehabilitation.",
    descriptionAr:
      "في مستشفى رويال حياة، تقدم عيادة العلاج الطبيعي برامج علاجية متقدمة ومخصصة لدعم صحة المرأة في مختلف مراحل حياتها.",
  },
  {
    departmentName: "Obstetrics & Gynecology",
    name: "Parent and Childbirth Education",
    nameAr: "تثقيف الوالدين والولادة",
    description:
      "At Royale Hayat Hospital, we offer comprehensive educational programs for expectant parents, ensuring a calm and informed birthing experience.",
    descriptionAr:
      "في مستشفى رويال حياة، نقدم برامج تعليمية شاملة للآباء والأمهات المنتظرين، بهدف توفير تجربة ولادة هادئة، آمنة، ومبنية على المعرفة والثقة.",
  },
  {
    departmentName: "General & Laparoscopic Surgery",
    name: "Obesity Bariatric Surgery",
    nameAr: "جراحة السمنة",
    description:
      "Royale Hayat Hospital's Bariatric Surgery Center is the first in the Middle East and Africa to be recognized by the Surgical Review Corporation as an International Center of Excellence in weight loss surgeries.",
    descriptionAr:
      "يُعد مركز جراحات السمنة في مستشفى رويال حياة الأول في الشرق الأوسط وأفريقيا الذي يحصل على اعتماد المؤسسة العالمية لمراجعة الجراحة كمركز دولي متميز في جراحات إنقاص الوزن.",
  },
  {
    departmentName: "General & Laparoscopic Surgery",
    name: "Breast Surgical Oncology",
    nameAr: "أورام الثدي الجراحية",
    description:
      "At Royale Hayat Hospital, our Breast Surgical Oncology Clinic offers exceptional care for breast health. Our experienced team provides expert examinations, precise diagnoses, and advanced treatments for various breast conditions.",
    descriptionAr:
      "في مستشفى رويال حياة، تقدم عيادة جراحة أورام الثدي رعاية متخصصة وشاملة لصحة الثدي.",
  },
  {
    departmentName: "General & Laparoscopic Surgery",
    name: "Abdominal Wall Reconstruction",
    nameAr: "إعادة بناء جدار البطن",
    description:
      "Our Abdominal Wall Reconstruction unit provides specialized surgical care for complex abdominal wall conditions.",
    descriptionAr:
      "تقدم وحدة إعادة ترميم جدار البطن في مستشفى رويال حياة رعاية جراحية متخصصة لعلاج الحالات المعقدة المتعلقة بجدار البطن.",
  },
  {
    departmentName: "General & Laparoscopic Surgery",
    name: "Clinical Nutrition & Dietetics",
    nameAr: "التغذية السريرية",
    description:
      "At Royale Hayat Hospital, our Nutrition and Diet Clinic is dedicated to promoting optimal health through personalized nutritional care aligned with World Health Organization standards.",
    descriptionAr:
      "في مستشفى رويال حياة، تلتزم عيادة التغذية العلاجية والحمية بتعزيز الصحة العامة من خلال برامج غذائية مخصصة.",
  },
  {
    departmentName: "Internal Medicine",
    name: "Cardiology",
    nameAr: "أمراض القلب",
    description:
      "At Royale Hayat Hospital, we prioritize preventive cardiac care to promote long-term heart health and well-being. Our Cardiology Unit offers expert support, education, and treatment for a healthier life.",
    descriptionAr:
      "في مستشفى رويال حياة، نولي أهمية كبيرة للرعاية القلبية الوقائية بهدف تعزيز صحة القلب على المدى الطويل وتحسين جودة الحياة.",
  },
  {
    departmentName: "Internal Medicine",
    name: "Nephrology",
    nameAr: "أمراض الكلى",
    description:
      "At Royale Hayat Hospital, our Nephrology Clinic provides top-tier diagnostic, preventive, and therapeutic services for kidney-related conditions.",
    descriptionAr:
      "في مستشفى رويال حياة، تقدم عيادة أمراض الكلى خدمات تشخيصية ووقائية وعلاجية متكاملة لأمراض الكلى.",
  },
  {
    departmentName: "Internal Medicine",
    name: "Gastroenterology",
    nameAr: "أمراض الجهاز الهضمي",
    description:
      "At Royale Hayat Hospital's Center for Digestive Diseases, we combine world-class expertise with cutting-edge technology to treat a wide range of gastrointestinal conditions.",
    descriptionAr:
      "في مركز أمراض الجهاز الهضمي في مستشفى رويال حياة، نجمع بين الخبرة الطبية العالمية وأحدث التقنيات لتشخيص وعلاج مجموعة واسعة من أمراض الجهاز الهضمي.",
  },
  {
    departmentName: "Internal Medicine",
    name: "Endocrinology & Metabolism",
    nameAr: "الغدد الصماء والتمثيل الغذائي",
    description:
      "At Royale Hayat Hospital, our Endocrinology and Metabolism Clinic offers comprehensive care for endocrine and metabolic disorders.",
    descriptionAr:
      "في مستشفى رويال حياة، تقدم عيادة الغدد الصماء والتمثيل الغذائي رعاية شاملة لاضطرابات الغدد والهرمونات والأمراض الأيضية.",
  },
  {
    departmentName: "Internal Medicine",
    name: "Rheumatology",
    nameAr: "أمراض الروماتيزم",
    description:
      "At Royale Hayat Hospital, our Rheumatology Clinic is dedicated to providing expert consultations and treatments for a wide range of musculoskeletal and autoimmune disorders.",
    descriptionAr:
      "في مستشفى رويال حياة، تقدم عيادة الروماتيزم استشارات وعلاجات متخصصة لمجموعة واسعة من أمراض الجهاز العضلي الهيكلي وأمراض المناعة الذاتية.",
  },
  {
    departmentName: "Internal Medicine",
    name: "Clinical Nutrition & Dietetics",
    nameAr: "التغذية السريرية",
    description:
      "At Royale Hayat Hospital, our Nutrition and Diet Clinic is dedicated to promoting optimal health through personalized nutritional care aligned with World Health Organization standards.",
    descriptionAr:
      "في مستشفى رويال حياة، تلتزم عيادة التغذية العلاجية والحمية بتعزيز الصحة المثلى من خلال رعاية غذائية مخصصة.",
  },
];

const buildDepartmentMapByName = async () => {
  const departments = await Department.find({}).select("_id name arabicName").lean();
  const map = new Map();

  for (const dept of departments) {
    map.set(dept.name.trim().toLowerCase(), dept._id);
  }

  return map;
};

const seedSubspecialities = async () => {
  await connectDB();

  let created = 0;
  let updated = 0;
  let skipped = 0;

  try {
    const departmentMap = await buildDepartmentMapByName();

    for (const sub of SUBSPECIALITIES) {
      const departmentKey = sub.departmentName.trim().toLowerCase();
      const departmentId = departmentMap.get(departmentKey);

      if (!departmentId) {
        console.warn(
          `⚠️ Skipped "${sub.name}" — department not found: ${sub.departmentName}. Run seed:departments first.`,
        );
        skipped += 1;
        continue;
      }

      const payload = {
        name: sub.name.trim(),
        arabicName: sub.nameAr.trim(),
        description: sub.description.trim(),
        arabicDescription: sub.descriptionAr.trim(),
        department: departmentId,
        customSubspecialities: [],
      };

      const existing = await Subspeciality.findOne({
        department: departmentId,
        $or: [{ name: payload.name }, { arabicName: payload.arabicName }],
      });

      if (existing) {
        existing.set(payload);
        await existing.save();
        updated += 1;
        console.log(
          `↻ Updated subspeciality: ${payload.name} → ${sub.departmentName} (${departmentId})`,
        );
        continue;
      }

      await Subspeciality.create(payload);
      created += 1;
      console.log(
        `✅ Created subspeciality: ${payload.name} → ${sub.departmentName} (${departmentId})`,
      );
    }

    console.log(
      `✅ Subspeciality seeding completed. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`,
    );
  } catch (error) {
    console.error("❌ Subspeciality seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

void seedSubspecialities();
