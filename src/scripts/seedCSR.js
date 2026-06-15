import mongoose from "mongoose";

import "../config/env.js";
import connectDB from "../config/db.js";
import CSR from "../modules/csr/model/csr.model.js";

const CSR_INITIATIVES = [
  {
    heading: "Breast Cancer Awareness Lecture – Royale Hayat Hospital",
    headingArabic: "محاضرة التوعية بسرطان الثدي – مستشفى رويال حياة",
    subheading: "Held on 7 October 2025",
    subheadingArabic: "أُقيمت بتاريخ 7 أكتوبر 2025",
    description: [
      "Within its walls, Royale Hayat Hospital proudly hosted a specialised Breast Cancer Awareness lecture led by our team of expert consultants. The session emphasized early detection, advanced treatment options, and holistic patient care, including emotional well-being.",
      "This luxurious and informative initiative reflects our dedication to empowering women with knowledge, compassion, and exceptional healthcare standards",
    ],
    descriptionArabic: [
      "استضاف مستشفى رويال حياة بكل فخر محاضرة توعوية حصرية حول سرطان الثدي، قدّمها نخبة من استشاريي المستشفى، حيث ركزت الجلسة على أهمية الكشف المبكر، وأحدث الخيارات العلاجية، والرعاية الشاملة التي تراعي الجوانب النفسية والعاطفية للمريضات.",
      "وتعكس هذه المبادرة الهادفة والتثقيفية التزامنا المستمر بتمكين المرأة بالمعرفة، والرعاية الإنسانية، وتقديم أعلى معايير الرعاية الصحية.",
    ],
    images: [
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/file-manager/6a231c90f16f8c373c02c85e/1780686016335-image4.png.png",
    ],
    eventDate: "2025-10-07",
  },
  {
    heading: "Breast Cancer Awareness Lecture - Burgan Bank",
    headingArabic: "محاضرة التوعية بسرطان الثدي – بنك برقان",
    subheading: "Held on 16 October 2025",
    subheadingArabic: "أُقيمت بتاريخ 16 أكتوبر 2025",
    description: [
      "As part of its ongoing community outreach initiatives, Royale Hayat Hospital hosted a specialised Breast Cancer Awareness lecture at Burgan Bank. Our expert consultants guided attendees through the importance of early detection, self-examination, and proactive health practices, empowering women with knowledge and confidence.",
      "This initiative epitomizes Royale Hayat’s dedication to preventive healthcare and elevating public health awareness.",
    ],
    descriptionArabic: [
      "ضمن مبادراته المجتمعية المتميِّزة، نظم مستشفى رويال حياة محاضرة توعوية متخصصة بسرطان الثدي في بنك برقان، حيث استعرض استشاريو المستشفى للحضور أبرز المعطيات الطبية حول الكشف المبكر، والفحص الذاتي، وأهمية اتباع الممارسات الصحية الوقائية، بما يسهم في تعزيز الوعي والثقة لدى النساء.",
      "تجسّد هذه المبادرة التزام رويال حياة بدعم الرعاية الوقائية والارتقاء بمستوى الوعي الصحي في المجتمع.",
    ],
    images: [
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/file-manager/6a231c90f16f8c373c02c85e/1780686014084-image.png.png",
    ],
    eventDate: "2025-10-16",
  },
  {
    heading:
      "Royale Hayat Hospital participated in the 3rd Special Olympics Kuwait Health Screening Event",
    headingArabic:
      "مشاركة مستشفى رويال حياة في فعالية الفحص الصحي للأولمبياد الخاص – الكويت",
    subheading: "Held on 22 October 2025",
    subheadingArabic: "أُقيمت بتاريخ 22 أكتوبر 2025",
    description: [
      "Royale Hayat Hospital proudly participated in the 3rd Special Olympics Kuwait Health Screening Event, represented by its dedicated medical team, led by Dr. Alia Ali Ibrahim, Consultant in Internal and Respiratory Medicine. The initiative delivered comprehensive health screenings to 150 athletes of determination across the State of Kuwait.",
      "This reflects the hospital’s continued commitment to community engagement, inclusivity, and equitable access to comprehensive, compassionate healthcare for all, especially athletes of determination.",
    ],
    descriptionArabic: [
      "يفخر مستشفى رويال حياة بمشاركته في النسخة الثالثة من فعالية الفحص الصحي للأولمبياد الخاص – الكويت، من خلال فريقه الطبي المتخصص بقيادة د. عالية علي إبراهيم، استشارية الأمراض الباطنية والجهاز التنفسي.",
      "وقدمت المبادرة فحوصات صحية شاملة لـ 150 رياضيًا من أصحاب الهمم في مختلف أنحاء دولة الكويت، مما يعكس التزام المستشفى المستمر خدمة المجتمع، وتعزيز الشمولية، وتوفير رعاية صحية متكاملة وإنسانية للجميع، وخاصة لأصحاب الهمم.",
    ],
    images: [
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/file-manager/6a231c90f16f8c373c02c85e/1780686015581-image2.png.png",
    ],
    eventDate: "2025-10-22",
  },
  {
    heading:
      "Royale Hayat Hospital's International Conference on Updates in Women's Health",
    headingArabic: "المؤتمر الدولي لصحة المرأة – مستشفى رويال حياة",
    subheading: "Held on 29 November 2025",
    subheadingArabic: "أُقيمت بتاريخ 29 نوفمبر 2025",
    description: [
      "Royale Hayat Hospital had the honor of hosting an exclusive, high-level scientific conference on the latest advancements in women's health. Esteemed doctors and consultants from across the globe gathered to exchange insights, showcase best practices, and explore innovative approaches in women's healthcare.",
      "This prestigious event reflects our unwavering commitment to delivering world-class, evidence-based care for women in Kuwait and the region.",
    ],
    descriptionArabic: [
      "تشرّف مستشفى رويال حياة باستضافة مؤتمر علمي دولي رفيع المستوى حول أحدث المستجدات والتطورات في مجال صحة المرأة، بمشاركة نخبة من الأطباء والاستشاريين من مختلف أنحاء العالم. وشكّل المؤتمر منصة علمية متميِّزة لتبادل الخبرات، واستعراض أفضل الممارسات الطبية، ومناقشة أحدث الابتكارات في الرعاية الصحية للمرأة.",
      "ويعكس هذا الحدث المرموق التزامنا الراسخ بتقديم رعاية صحية عالمية المستوى قائمة على الأدلة العلمية، للمرأة في الكويت والمنطقة.",
    ],
    images: [
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/file-manager/6a231c90f16f8c373c02c85e/1780686015994-image3.png.png",
    ],
    eventDate: "2025-11-29",
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const SEQUENCE_BASE = new Date("2025-12-01T12:00:00.000Z");

const getSequenceTimestamp = (index, total) =>
  new Date(SEQUENCE_BASE.getTime() + (total - index - 1) * DAY_MS);

const setSeedTimestamps = async (id, index, total) => {
  const timestamp = getSequenceTimestamp(index, total);
  await CSR.collection.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    {
      $set: {
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      $unset: {
        order: "",
      },
    },
  );
};

const seedCSR = async () => {
  await connectDB();

  let created = 0;
  let updated = 0;

  try {
    for (const [index, initiative] of CSR_INITIATIVES.entries()) {
      const payload = {
        heading: initiative.heading.trim(),
        headingArabic: initiative.headingArabic.trim(),
        subheading: initiative.subheading.trim(),
        subheadingArabic: initiative.subheadingArabic.trim(),
        description: initiative.description.map((item) => item.trim()).filter(Boolean),
        descriptionArabic: initiative.descriptionArabic
          .map((item) => item.trim())
          .filter(Boolean),
        images: initiative.images.filter(Boolean),
      };

      const existing = await CSR.findOne({ heading: payload.heading });

      if (existing) {
        existing.set(payload);
        await existing.save();
        await setSeedTimestamps(existing._id, index, CSR_INITIATIVES.length);
        updated += 1;
        continue;
      }

      const createdDoc = await CSR.create(payload);
      await setSeedTimestamps(createdDoc._id, index, CSR_INITIATIVES.length);
      created += 1;
    }

    console.log(`✅ CSR seeding completed. Created: ${created}, Updated: ${updated}`);
  } catch (error) {
    console.error("❌ CSR seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

void seedCSR();
