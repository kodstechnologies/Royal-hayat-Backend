import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Job from "../modules/jobs/models/job.model.js";

dotenv.config();

const JOBS = [
  {
    title: "Brand Manager",
    arabicTitle: "مدير العلامة التجارية",
    description:
      "Develops and executes strategies to enhance RHH's brand image. Manages social media campaigns, supervises team members, coordinates publicity for doctors and departments, handles budgets, assesses ROI, liaises with PR and media, and organizes social events to boost brand visibility.",
    arabicDescription:
      "يتولى مدير العلامة التجارية تطوير وتنفيذ استراتيجيات لتعزيز صورة العلامة التجارية لمستشفى RHH. تشمل مسؤولياته إدارة حملات التواصل الاجتماعي، والإشراف على أعضاء الفريق، وتنسيق الحملات الدعائية للأطباء والأقسام، وإدارة الميزانيات، وتقييم عائد الاستثمار.",
    classification: "Marketing & Communications",
    location: "Kuwait",
    arabicLocation: "الكويت",
    type: "Full-time",
    responsibilities: [
      "Develop strategic brand marketing initiatives",
      "maintain brand consistency across all channels",
      "oversee social media content creation and campaigns",
      "supervise and monitor marketing team",
      "coordinate with medical professionals and department heads",
      "manage marketing budgets",
      "perform ROI analysis on marketing expenditures",
    ],
    arabicResponsibilities: [
      "تطوير وتنفيذ مبادرات تسويقية استراتيجية للعلامة التجارية",
      "الحفاظ على اتساق العلامة التجارية عبر جميع القنوات والمواد التسويقية",
      "الإشراف على إنشاء وتنفيذ محتوى وحملات التواصل الاجتماعي",
      "الإشراف على فريق التسويق ومراقبته لضمان الإنتاجية",
      "التنسيق مع الأطباء والمتخصصين لتعزيز حضورهم العام",
      "إدارة ميزانيات التسويق",
      "إجراء تحليل عائد الاستثمار",
    ],
    requirements: [
      "Bachelor's or Master's in Marketing, Business Administration or related field. 8+ years in brand management, preferably in healthcare. Bilingual English and Arabic (must). Strong strategic thinking, leadership, digital marketing, social media management, content creation, budget management and ROI assessment skills",
    ],
    arabicRequirements: [
      "بكالوريوس أو ماجستير في التسويق أو إدارة الأعمال أو مجال ذي صلة. خبرة لا تقل عن 8 سنوات في إدارة العلامات التجارية ويُفضل في قطاع الرعاية الصحية. إجادة اللغتين الإنجليزية والعربية (شرط أساسي). مهارات: التفكير الاستراتيجي، القيادة، التسويق الرقمي، إدارة وسائل التواصل الاجتماعي، إنشاء المحتوى، إدارة الميزانية، تقييم عائد الاستثمار",
    ],
    postedDate: "2025-06-18",
    closingDate: null,
    isActive: true,
    applicationsCount: 0,
  },
  {
    title: "Consultant Neonatologist",
    arabicTitle: "استشاري طب حديثي الولادة",
    description:
      "Manages outpatients and inpatients in neonatal care. Involves rotation in NICU, Operating Room, and New-born resuscitation. Teaches registrars and nursing staff. Minimum 5 years experience in SCBU/NICU required.",
    arabicDescription:
      "يُتوقع من استشاريي حديثي الولادة إدارة المرضى الخارجيين والداخليين. يلعب استشاريو حديثي الولادة دوراً في تعليم المسجلين وطاقم التمريض. خبرة لا تقل عن خمس سنوات في SCBU/NICU مطلوبة.",
    classification: "Specialist Doctors",
    location: "Kuwait",
    arabicLocation: "الكويت",
    type: "Full-time",
    responsibilities: [
      "Manage NICU/SCBU/HDU patients",
      "daytime attending rota for NNU level 5 and 2",
      "teach and supervise registrars and nurses",
      "on-call duties",
      "participate in hospital meetings",
      "guideline development",
      "antenatal counselling",
      "perinatal mortality and morbidity meetings",
    ],
    arabicResponsibilities: [
      "المساهمة في جدول الحضور الأسبوعي اليومي لوحدة الولادة الجديدة (NNU) من المستوى الخامس والثاني",
      "اتخاذ القرارات اليومية للإدارة السريرية للأطفال",
      "مسؤوليات خارج أوقات العمل",
      "توفير تغطية لزملاء الاستشاريين خلال الإجازات",
      "المسؤولية المشتركة لوضع الإرشادات",
      "الاستشارات قبل الولادة",
      "حضور اجتماعات الحالات التوليدية عالية الخطورة واجتماعات الوفيات والاعتلالات المحيطة بالولادة",
    ],
    requirements: [
      "Medical degree with specialization in Neonatology. Minimum 5 years experience in SCBU/NICU. Specialty interest in Cardiology, Neonatal lung injury or Neonatal Abstinence Syndrome welcomed. Full-time commitment to Neonatal medicine",
    ],
    arabicRequirements: [
      "درجة طبية مع تخصص في طب حديثي الولادة. خبرة لا تقل عن 5 سنوات في SCBU/NICU. التزام كامل بطب حديثي الولادة. اهتمام تخصصي في أمراض القلب أو إصابات الرئة الوليدية أو متلازمة الامتناع الوليدي مرحب به",
    ],
    postedDate: "2025-06-18",
    closingDate: null,
    isActive: true,
    applicationsCount: 0,
  },
  {
    title:
      "Registered Nurse – Cosmetic Center (Local, Female, MOH License & Laser Exp)",
    arabicTitle: null,
    description:
      "Responsible for nursing care of patients in the Cosmetic Center in liaison with Medical Staff and Allied Health Professionals.",
    arabicDescription: null,
    classification: "Nursing Support",
    location: "Royale Hayat Hospital – Cosmetic Center",
    arabicLocation: "الكويت",
    type: "Full-time",
    responsibilities: [
      "Patient nursing care per scope of practice",
      "yearly unit and divisional competency review",
      "maintain BLS certification",
      "optional ACLS certification",
    ],
    arabicResponsibilities: [],
    requirements: [
      "Diploma/Bachelor of Nursing. License to practice nursing in Kuwait (MOH). Two years post-graduate experience with laser & dermatology required. BLS (required), ACLS (optional). English communication required, Arabic desired",
    ],
    arabicRequirements: [],
    postedDate: "2025-09-09",
    closingDate: null,
    isActive: true,
    applicationsCount: 0,
  },
  {
    title: "Consultant Pediatrician",
    arabicTitle: null,
    description:
      "Full-time commitment to Pediatric medicine. Covers clinic by appointment and emergency walk-ins. Immediate urgent hire for the Pediatric Department.",
    arabicDescription: null,
    classification: "Specialist Doctors",
    location: "Royale Hayat Hospital – Pediatric Department",
    arabicLocation: "الكويت",
    type: "Full-time",
    responsibilities: [
      "Daytime weekly attending rota",
      "cover clinic by appointment and emergency walk-ins",
      "attend critical clinical situations",
      "day-to-day clinical management of children",
      "out-of-hours responsibilities",
      "cover consultant colleagues during leave",
      "participate in medical audit, CME and research",
      "guideline development and departmental meetings",
    ],
    arabicResponsibilities: [],
    requirements: [
      "Medical degree with specialization in Pediatrics. Full-time commitment to Pediatric medicine. Ability to seamlessly integrate into a dynamic work environment",
    ],
    arabicRequirements: [],
    postedDate: "2025-09-11",
    closingDate: null,
    isActive: true,
    applicationsCount: 0,
  },
  {
    title: "Registrar – Obstetrician and Gynecologist",
    arabicTitle: "مسجل أمراض النساء والتوليد",
    description:
      "Attends casualty cases and gives emergency treatment, performs admission procedures. Supports clinical management under consultant supervision in the Obstetrics & Gynaecology Department.",
    arabicDescription:
      "يجب أن يكون لدى المرشحين المتقدمين خبرة لا تقل عن عامين في مجال أمراض النساء والتوليد.",
    classification: "Specialist Doctors",
    location: "Royale Hayat Hospital – Obstetrics & Gynaecology Department",
    arabicLocation: "الكويت",
    type: "Full-time",
    responsibilities: [
      "Patient counselling and documentation",
      "prepare patients for surgery",
      "routine floor rounds",
      "respond immediately to patient calls",
      "prepare discharge notes",
      "see OB/Gyn cases in triage within 5 minutes",
      "differentiate low/high risk pregnancy",
      "fill partogram and interpret CTG",
      "attend normal and abnormal vaginal deliveries",
      "assist in all minor/major OB/Gyn procedures",
      "follow ethical regulations",
    ],
    arabicResponsibilities: [
      "تقديم المشورة للمرضى وتوثيق تاريخهم الطبي وإجراء الفحوصات اللازمة",
      "تقديم المشورة والتحضير والتوجيه للمرضى المقبولين لإجراء العمليات الجراحية",
      "القيام بجولات روتينية على جميع المرضى المقبولين",
      "الاستجابة الفورية لاستفسارات المرضى",
      "إعداد مذكرة خروج",
      "استقبال حالات النساء والتوليد في الطوارئ خلال 5 دقائق",
      "التمييز بين الحمل منخفض ومرتفع الخطورة",
      "ملء مخطط الولادة وتفسير CTG",
      "حضور جميع إجراءات التوليد الطبيعية والكبرى والصغرى",
    ],
    requirements: [
      "Bachelor's or Master's Degree. Minimum 2 years experience post Master's Degree. Skills: OB/Gyn clinical skills, CTG interpretation, partogram, surgical assistance, documentation",
    ],
    arabicRequirements: [
      "درجة البكالوريوس أو الماجستير. خبرة مهنية لا تقل عن سنتين بعد الماجستير. مهارات: طب النساء والتوليد السريري، تفسير CTG، مخطط الولادة، المساعدة الجراحية، التوثيق",
    ],
    postedDate: "2025-09-23",
    closingDate: null,
    isActive: true,
    applicationsCount: 0,
  },
  {
    title: "Registrar Internal Medicine",
    arabicTitle: null,
    description:
      "Applies scientific knowledge and clinical expertise for diagnosis, treatment and compassionate care across the spectrum from health to complex illness.",
    arabicDescription: null,
    classification: "Specialist Doctors",
    location: "Royale Hayat Hospital – Internal Medicine",
    arabicLocation: "الكويت",
    type: "Full-time",
    responsibilities: [
      "Diagnose and treat patients",
      "health promotion and disease prevention",
      "advise patients on diet, activity and hygiene",
      "analyze records and test results",
      "collect and maintain patient information",
      "explain procedures and test results",
      "manage common and complex illnesses",
      "monitor patient conditions and re-evaluate treatments",
    ],
    arabicResponsibilities: [],
    requirements: [
      "Minimum 3 years experience post PG-MD/MRCP. Experience in managing acute emergencies (on call). Skills: active listening, critical thinking, active learning, monitoring, quality control analysis",
    ],
    arabicRequirements: [],
    postedDate: "2025-09-23",
    closingDate: null,
    isActive: true,
    applicationsCount: 0,
  },
  {
    title: "Anesthesia Specialist",
    arabicTitle: null,
    description:
      "Assesses and prepares patients for anesthesia. Conducts general and regional anesthesia in elective and emergency cases. Performs painless labor techniques and all patient monitoring.",
    arabicDescription: null,
    classification: "Specialist Doctors",
    location: "Royale Hayat Hospital",
    arabicLocation: "الكويت",
    type: "Full-time",
    responsibilities: [
      "Pre-anesthesia check-up",
      "conduct general and regional anesthesia",
      "recovery room patient care",
      "perform painless labor techniques in Delivery Suite",
      "supervise Registrars",
      "perform all invasive and non-invasive patient monitoring techniques",
    ],
    arabicResponsibilities: [],
    requirements: [
      "High Degree in Anesthesia from a recognized Medical School. At least 5 years Anesthesia practice post High Qualification. Minimum 10 years total Anesthesia experience including minimum 7 years post High Degree",
    ],
    arabicRequirements: [],
    postedDate: "2025-11-04",
    closingDate: null,
    isActive: true,
    applicationsCount: 0,
  },
  {
    title:
      "Registered Nurse – Labor and Delivery (Local, Female, MOH Licence)",
    arabicTitle: null,
    description:
      "Provides comprehensive nursing care from antenatal through postpartum phases including fetal and infant care for the Labor and Delivery Department.",
    arabicDescription: null,
    classification: "Nursing Support",
    location: "Royale Hayat Hospital",
    arabicLocation: "الكويت",
    type: "Full-time",
    responsibilities: [
      "Document patient health and delivery procedures",
      "report mother and infant status to interdisciplinary team",
      "holistic patient coordination",
      "mentor junior nurses",
      "analyze CTG readings",
      "special attention for advanced maternal age",
      "provide family-centered care",
      "assess antenatal/intrapartum/postpartum patients",
      "handle obstetrical emergencies",
      "assist neonatologists",
      "prepare for emergency and elective C-sections",
      "deliver initial newborn stabilization",
    ],
    arabicResponsibilities: [],
    requirements: [
      "Diploma/Bachelor's in Nursing. License to practice nursing in Kuwait (MOH). 5 years nursing experience required. BLS, BLSO and NRP certification desired. ACLS recommended. English required, Arabic desired",
    ],
    arabicRequirements: [],
    postedDate: "2025-11-06",
    closingDate: null,
    isActive: true,
    applicationsCount: 0,
  },
  {
    title: "Floor Coordinator – Female Only, Bilingual (Arabic & English)",
    arabicTitle: null,
    description:
      "Focuses on patient satisfaction in the inpatient setting. Applies quality improvement strategies to make patient experience more valuable throughout hospitalization.",
    arabicDescription: null,
    classification: "Hospitality / Guest Services",
    location: "Royale Hayat Hospital",
    arabicLocation: "الكويت",
    type: "Full-time",
    responsibilities: [
      "Welcome patients on arrival",
      "conduct courtesy visits post-delivery",
      "inform patients about discharge time and packages",
      "explain facilities and complimentary services",
      "coordinate room services",
      "handle billing and payment collection",
      "coordinate patient stay extensions",
      "ensure rapid response to patient needs",
      "act as patient advocate",
      "gather patient feedback",
      "coordinate exit meetings",
      "escort patients at discharge",
    ],
    arabicResponsibilities: [],
    requirements: [
      "High School Vocational Certificate or above, preferably Graduate in any discipline. 2–3 years related experience. Computer literacy. Arabic & English (speaking, reading & writing). Good customer relations skills, positive outgoing personality",
    ],
    arabicRequirements: [],
    postedDate: "2026-03-19",
    closingDate: null,
    isActive: true,
    applicationsCount: 0,
  },
  {
    title: "Registrar – Plastic Surgeon",
    arabicTitle: null,
    description:
      "Plans, directs, administers and supervises activities for surgical patients. Reports to In-Charge on matters relating to the patient care division at La Cosmetique Royale.",
    arabicDescription: null,
    classification: "La Cosmetique Royale",
    location: "Kuwait",
    arabicLocation: "الكويت",
    type: "Full-time",
    responsibilities: [
      "Conduct patient consultations and diagnose conditions",
      "perform plastic surgery procedures under senior supervision",
      "assist in complex surgeries",
      "post-surgery follow-up and monitoring",
      "maintain accurate patient records",
      "participate in educational activities",
      "teach and mentor junior medical staff and students",
      "engage in clinical research",
      "stay updated with latest techniques",
      "collaborate with medical team",
    ],
    arabicResponsibilities: [],
    requirements: [
      "Medical degree with plastic surgery specialization. Minimum 2 years experience. Strong clinical, research, mentoring and documentation skills",
    ],
    arabicRequirements: [],
    postedDate: "2026-04-14",
    closingDate: null,
    isActive: true,
    applicationsCount: 0,
  },
  {
    title: "Spa Therapist – Female Only, Bilingual (Arabic & English)",
    arabicTitle: null,
    description:
      "Performs body massage, body treatments and beauty treatments for Spa guests at Royale Hayat Hospital Spa.",
    arabicDescription: null,
    classification: "Spa",
    location: "Royale Hayat Hospital",
    arabicLocation: "الكويت",
    type: "Full-time",
    responsibilities: [
      "Prepare and tidy spa premises",
      "manage daily booking programme",
      "provide massages, body treatments, facials, manicures, pedicures and hair care",
      "maintain product supplies",
      "check spa cards for guest instructions",
      "maintain linen",
      "ensure guest comfort (temperature, lighting, music)",
      "report complaints to Senior Therapist",
      "adhere to spa and hotel policy",
      "maintain grooming standards",
    ],
    arabicResponsibilities: [],
    requirements: [
      "High School Vocational Certificate or above, preferably Graduate in any discipline. Body massage skill, body treatments, skin analysis, beauty treatment skill. English communication (speaking, reading, listening). Good customer service skills, positive outgoing personality",
    ],
    arabicRequirements: [],
    postedDate: "2026-05-13",
    closingDate: null,
    isActive: true,
    applicationsCount: 0,
  },
];

const normalizeJobPayload = (job) => ({
  title: job.title?.trim(),
  arabicTitle: job.arabicTitle?.trim() || "",
  description: job.description?.trim(),
  arabicDescription: job.arabicDescription?.trim() || "",
  classification: job.classification?.trim(),
  location: job.location?.trim(),
  arabicLocation: job.arabicLocation?.trim() || "",
  type: job.type,
  responsibilities: Array.isArray(job.responsibilities)
    ? job.responsibilities.filter(Boolean)
    : [],
  arabicResponsibilities: Array.isArray(job.arabicResponsibilities)
    ? job.arabicResponsibilities.filter(Boolean)
    : [],
  requirements: Array.isArray(job.requirements) ? job.requirements.filter(Boolean) : [],
  arabicRequirements: Array.isArray(job.arabicRequirements)
    ? job.arabicRequirements.filter(Boolean)
    : [],
  postedDate: job.postedDate ? new Date(job.postedDate) : new Date(),
  closingDate: job.closingDate ? new Date(job.closingDate) : undefined,
  isActive: Boolean(job.isActive),
  applicationsCount: Number(job.applicationsCount ?? 0),
});

const getStartingSequenceForPrefix = async (prefix) => {
  const docs = await Job.find(
    { jobId: { $regex: `^${prefix}-` } },
    { jobId: 1 }
  ).lean();

  let maxSequence = 0;
  for (const doc of docs) {
    const value = doc?.jobId?.split("-")?.[1];
    const sequence = Number.parseInt(value || "0", 10);
    if (Number.isFinite(sequence) && sequence > maxSequence) {
      maxSequence = sequence;
    }
  }

  return maxSequence + 1;
};

const setSeedTimestamps = async (id, postedDate) => {
  const timestamp = new Date(postedDate);
  await Job.collection.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    {
      $set: {
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    }
  );
};

const seedJobs = async () => {
  await connectDB();

  let created = 0;
  let updated = 0;
  const now = new Date();
  const prefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  let nextSequence = await getStartingSequenceForPrefix(prefix);

  try {
    for (const rawJob of JOBS) {
      const payload = normalizeJobPayload(rawJob);

      const existing = await Job.findOne({
        title: payload.title,
        classification: payload.classification,
      });

      if (existing) {
        existing.set(payload);
        await existing.save();
        await setSeedTimestamps(existing._id, payload.postedDate);
        updated += 1;
        continue;
      }

      const nextJobId = `${prefix}-${String(nextSequence).padStart(6, "0")}`;
      nextSequence += 1;

      const createdDoc = await Job.create({
        ...payload,
        jobId: nextJobId,
      });
      await setSeedTimestamps(createdDoc._id, payload.postedDate);
      created += 1;
    }

    console.log(`✅ Job seeding completed. Created: ${created}, Updated: ${updated}`);
  } catch (error) {
    console.error("❌ Job seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

void seedJobs();
