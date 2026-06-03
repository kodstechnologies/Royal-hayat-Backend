import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Department from "../modules/departments/models/department.model.js";
import Catagory from "../modules/catagory/model/catagory.model.js";

dotenv.config();

const CATEGORIES = [
  {
    key: "Clinical Speciality",
    name: "Clinical Speciality",
    arabicName: "التخصصات السريرية",
  },
  {
    key: "Clinical Support Service",
    name: "Clinical Support Service",
    arabicName: "خدمات الدعم السريري",
  },
  {
    key: "Home Care Service",
    name: "Home Care Service",
    arabicName: "خدمات الرعاية المنزلية",
  },
];

/** Mirrors Royal-hayat-admin-frontend/src/data/departments.ts */
const DEPARTMENTS = [
  {
    seedId: "1",
    clinicalCode: "R002OBG",
    name: "Obstetrics & Gynecology",
    nameAr: "التوليد وأمراض النساء",
    description:
      "Complete maternity care from prenatal through postpartum recovery, supported by healthcare professionals.",
    descriptionAr:
      "رعاية أمومة شاملة من ما قبل الولادة حتى التعافي بعدها، بدعم من أكثر من 600 متخصص.",
    category: "Clinical Speciality",
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/department/Department+Photos/Department+Photos/Obstetrics+%26+Gynecology/2.JPG",
    order: 1,
  },
  {
    seedId: "4",
    clinicalCode: "R01NEO",
    name: "Neonatal",
    nameAr: "حديثي الولادة",
    description:
      "Level III Neonatal Unit — the highest in Kuwait's private sector — offering specialized care for premature and critically ill infants.",
    descriptionAr:
      "وحدة حديثي الولادة من المستوى الثالث — الأعلى في القطاع الخاص بالكويت.",
    category: "Clinical Speciality",
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/department/Department+Photos/Department+Photos/Neonatal/1.jpg",
    order: 2,
  },
  {
    seedId: "3",
    clinicalCode: "R002PED",
    name: "Pediatrics",
    nameAr: "طب الأطفال",
    description:
      "World-class pediatric care with warmth and a child-centered approach, from infancy through adolescence.",
    descriptionAr: "رعاية أطفال عالمية المستوى بدفء ونهج محوره الطفل.",
    category: "Clinical Speciality",
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/department/Department+Photos/Department+Photos/Pediatrics/2.JPG",
    order: 3,
  },
  {
    seedId: "6",
    clinicalCode: "GI 1",
    name: "General & Laparoscopic Surgery",
    nameAr: "الجراحة العامة والمنظار",
    description:
      "Exceptional surgical care blending expert skills with advanced technology for precision, safety, and quick recovery.",
    descriptionAr:
      "رعاية جراحية استثنائية تجمع بين المهارات والتكنولوجيا المتقدمة.",
    category: "Clinical Speciality",
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/department/Department+Photos/Department+Photos/General+%26+Laparoscopic+Surgery/1.JPG",
    order: 4,
  },
  {
    seedId: "13",
    clinicalCode: "R002ANA",
    name: "Anesthesia",
    nameAr: "التخدير",
    description:
      "Top-tier anesthesia services ensuring patient safety and comfort for all surgical and childbirth procedures.",
    descriptionAr: "خدمات تخدير عالية المستوى تضمن سلامة المريض وراحته.",
    category: "Clinical Speciality",
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/department/Department+Photos/Department+Photos/Anesthesia/1.JPG",
    order: 5,
  },
  {
    seedId: "5",
    clinicalCode: "R01ERC",
    name: "Internal Medicine",
    nameAr: "الطب الباطني",
    description:
      "Comprehensive diagnosis and treatment of complex adult diseases with personalized health check programs.",
    descriptionAr:
      "تشخيص وعلاج شامل لأمراض البالغين المعقدة مع برامج فحص صحي مخصصة.",
    category: "Clinical Speciality",
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/department/Department+Photos/Department+Photos/Internal+Medicine/1.jpg",
    order: 6,
  },
  {
    seedId: "10",
    clinicalCode: "R01FMC",
    name: "Family Medicine",
    nameAr: "طب الأسرة",
    description:
      "Continuous, personalized care for individuals and families of all ages with coordinated health management.",
    descriptionAr: "رعاية مستمرة ومخصصة للأفراد والعائلات من جميع الأعمار.",
    category: "Clinical Speciality",
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/department/Department+Photos/Department+Photos/Family+Medicine/1.jpg",
    order: 7,
  },
  {
    seedId: "9",
    clinicalCode: "R01ENT",
    name: "ENT (Ear, Nose & Throat)",
    nameAr: "الأنف والأذن والحنجرة",
    description:
      "Expert care for conditions affecting the ear, nose, throat, head, and neck with both medical and surgical expertise.",
    descriptionAr: "رعاية متخصصة لأمراض الأنف والأذن والحنجرة والرأس والرقبة.",
    category: "Clinical Speciality",
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/department/Department+Photos/Department+Photos/ENT+(Ear%2C+Nose+%26+Throat)/1.jpg",
    order: 8,
  },
  {
    seedId: "7",
    clinicalCode: "R060COS",
    name: "Plastic Surgery & Cosmetology",
    nameAr: "الجراحة التجميلية",
    description:
      "Internationally certified physicians offering advanced surgical and non-surgical cosmetic and reconstructive solutions.",
    descriptionAr:
      "أطباء معتمدون دولياً يقدمون حلولاً تجميلية وترميمية متقدمة.",
    category: "Clinical Speciality",
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/department/Department+Photos/Department+Photos/Plastic+Surgery/3.JPG",
    order: 9,
  },
  {
    seedId: "2",
    clinicalCode: "R002IVF",
    name: "Reproductive Medicine & IVF",
    nameAr: "الطب التناسلي وأطفال الأنابيب",
    description:
      "Advanced fertility treatments blending expertise with cutting-edge technology, including IVF, ICSI, and genetic diagnosis.",
    descriptionAr: "علاجات خصوبة متقدمة تجمع بين الخبرة والتكنولوجيا المتطورة.",
    category: "Clinical Speciality",
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/department/Department+Photos/Department+Photos/Reproductive+Medicine+%26+IVF/2.jpg",
    order: 10,
  },
  {
    seedId: "8",
    clinicalCode: "R01DER",
    name: "Dermatology",
    nameAr: "الأمراض الجلدية",
    description:
      "Expert care for all dermatological needs combining clinical excellence with the latest advances for adults and children.",
    descriptionAr:
      "رعاية متخصصة لجميع احتياجات الأمراض الجلدية مع أحدث التطورات.",
    category: "Clinical Speciality",
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/department/Department+Photos/Department+Photos/Dermatology/1.JPG",
    order: 11,
  },
  {
    seedId: "11",
    clinicalCode: "R002DEN",
    name: "Dental Clinic",
    nameAr: "عيادة الأسنان",
    description:
      "Exceptional dental care in a luxurious setting with specialized dentists using advanced technology for all ages.",
    descriptionAr: "رعاية أسنان استثنائية في بيئة فاخرة مع أطباء متخصصين.",
    category: "Clinical Speciality",
    image: "/images/Department/Dental.jpg",
    order: 12,
  },
  {
    seedId: "12",
    clinicalCode: "R002PAI",
    name: "Pain Management",
    nameAr: "إدارة الألم",
    description:
      "Comprehensive program offering advanced, compassionate care for acute and chronic pain to restore comfort and functionality.",
    descriptionAr: "برنامج شامل يقدم رعاية متقدمة ورحيمة للألم الحاد والمزمن.",
    category: "Clinical Speciality",
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/department/Department+Photos/Department+Photos/Pain+Management/1.jpg",
    order: 13,
  },
  {
    seedId: "16",
    clinicalCode: "R07LABH",
    name: "Laboratory Services",
    nameAr: "خدمات المختبر",
    description:
      "CAP-accredited laboratory providing gold-standard diagnostic testing and pathology services.",
    descriptionAr:
      "مختبر معتمد من CAP يقدم فحوصات تشخيصية وخدمات علم الأمراض بأعلى المعايير.",
    category: "Clinical Support Service",
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/department/Department+Photos/Department+Photos/Laboratory+Services/1.jpg",
    order: 14,
  },
  {
    seedId: "15",
    clinicalCode: "R010DIE",
    name: "Center for Diagnostic Imaging",
    nameAr: "مركز التصوير التشخيصي",
    description:
      "Advanced diagnostic and image-guided therapeutic services combining expert professionals with state-of-the-art technology.",
    descriptionAr:
      "خدمات تشخيصية وعلاجية موجهة بالتصوير تجمع بين متخصصين وتقنيات حديثة.",
    category: "Clinical Support Service",
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/department/Department+Photos/Department+Photos/Center+for+Diagnostic+Imaging/1.JPG",
    order: 15,
  },
  {
    seedId: "14",
    clinicalCode: "R001SCN",
    name: "Intensive Care",
    nameAr: "العناية المركزة",
    description:
      "Round-the-clock monitoring and care for severe, life-threatening conditions with cutting-edge technology.",
    descriptionAr: "مراقبة ورعاية على مدار الساعة للحالات الحرجة المهددة للحياة.",
    category: "Clinical Support Service",
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/department/Department+Photos/Department+Photos/Intensive+Care/1.jpg",
    order: 16,
  },
  {
    seedId: "17",
    clinicalCode: "",
    name: "Clinical Pharmacy",
    nameAr: "الصيدلة السريرية",
    description:
      "Expert pharmaceutical care integrated with clinical teams for optimal medication therapy outcomes.",
    descriptionAr: "رعاية صيدلانية متخصصة مدمجة مع الفرق السريرية.",
    category: "Clinical Support Service",
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/department/Department+Photos/Department+Photos/Clinical+Pharmacy/1.jpg",
    order: 17,
  },
  {
    seedId: "20",
    clinicalCode: "",
    name: "Royale Hayat Pharmacy",
    nameAr: "صيدلية رويال حياة",
    description:
      "Conveniently located on the ground floor, Royale Pharmacy is staffed by highly qualified pharmacists available 24/7 to provide expert guidance for all your medicinal needs.",
    descriptionAr:
      "تقع صيدلية رويال حياة في الطابق الأرضي، ويعمل بها صيادلة مؤهلون تأهيلاً عالياً متاحون على مدار الساعة طوال أيام الأسبوع.",
    category: "Clinical Support Service",
    image: "/images/Department/Pharmacy.jpg",
    order: 18,
  },
  {
    seedId: "19",
    clinicalCode: "",
    name: "Al Safwa HealthCare",
    nameAr: "الصفوة للرعاية الصحية",
    description:
      "Take control of your health effortlessly with our personalized program. Enroll by completing a quick registration form, providing a snapshot of your medical history and lifestyle.",
    descriptionAr:
      "تحكم في صحتك بسهولة من خلال برنامجنا المخصص. سجل عن طريق إكمال نموذج تسجيل سريع، وتقديم لمحة عن تاريخك الطبي ونمط حياتك.",
    category: "Clinical Support Service",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=250&fit=crop",
    order: 19,
  },
  {
    seedId: "18",
    clinicalCode: "",
    name: "Royale Home Health",
    nameAr: "رويال للرعاية المنزلية",
    description:
      "Royale Home Health is an exclusive extension of Royale Hayat Hospital, offering exceptional health and wellness support delivered directly to your home.",
    descriptionAr:
      "رويال للرعاية المنزلية هي امتداد حصري لمستشفى رويال حياة، تقدم دعماً استثنائياً للصحة والعافية مباشرة في منزلك.",
    category: "Home Care Service",
    image: "/images/Department/home-health.jpg",
    order: 20,
  },
  {
    seedId: "22",
    clinicalCode: "",
    name: "Physiotherapy",
    nameAr: "العلاج الطبيعي",
    description:
      "Advanced physiotherapy treatments tailored for recovery, rehabilitation, and long-term wellness.",
    descriptionAr:
      "علاجات طبيعية متقدمة مصممة للتعافي وإعادة التأهيل والعافية على المدى الطويل.",
    category: "Home Care Service",
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/department/Department+Photos/Department+Photos/Physiotherapy/1.jpg",
    order: 21,
  },
];

const resolveDepartmentId = (dept) => {
  const code = String(dept.clinicalCode || "").trim();
  if (code) return code;
  return `RHH-${dept.seedId}`;
};

const upsertCategories = async () => {
  const categoryIdByKey = {};

  for (const cat of CATEGORIES) {
    let doc = await Catagory.findOne({
      $or: [{ name: cat.name }, { arabicName: cat.arabicName }],
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
    console.log(`✅ Category ready: ${cat.name}`);
  }

  return categoryIdByKey;
};

const seedDepartments = async () => {
  await connectDB();

  let created = 0;
  let updated = 0;

  try {
    const categoryIdByKey = await upsertCategories();

    for (const dept of DEPARTMENTS) {
      const departmentId = resolveDepartmentId(dept);
      const catagory = categoryIdByKey[dept.category];

      if (!catagory) {
        throw new Error(`Missing category mapping for: ${dept.category}`);
      }

      const payload = {
        departmentId,
        name: dept.name.trim(),
        arabicName: dept.nameAr.trim(),
        description: dept.description.trim(),
        arabicDescription: dept.descriptionAr.trim(),
        catagory,
        image: dept.image?.trim() || "",
        isActive: true,
        order: dept.order,
        customExplainantions: [],
      };

      const existing = await Department.findOne({
        $or: [
          { departmentId },
          { name: payload.name },
          { arabicName: payload.arabicName },
        ],
      });

      if (existing) {
        existing.set(payload);
        await existing.save();
        updated += 1;
        console.log(`↻ Updated department: ${payload.name} (${departmentId})`);
        continue;
      }

      await Department.create(payload);
      created += 1;
      console.log(`✅ Created department: ${payload.name} (${departmentId})`);
    }

    console.log(
      `✅ Department seeding completed. Categories: ${CATEGORIES.length}, Created: ${created}, Updated: ${updated}`,
    );
  } catch (error) {
    console.error("❌ Department seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

void seedDepartments();
