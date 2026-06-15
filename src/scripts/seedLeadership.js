import mongoose from "mongoose";

import "../config/env.js";
import connectDB from "../config/db.js";
import Leadership from "../modules/leadership/models/leadership.model.js";

const LEADERSHIP_TEAM = [
  {
    initials: "SA",
    name: "Dr. Sulaiman Al Mazeedi",
    nameArabic: "د. سليمان المزيدي",
    title:
      "Medical Advisor\nConsultant General Surgery, Obesity Surgery, Colon & Gastrointestinal Endoscopy",
    titleArabic:
      "مستشار طبي\nاستشاري جراحة عامة وجراحة السمنة ومناظير الجهاز الهضمي وجراحة القولون",
    description: [
      "Dr. Sulaiman Al Mazeedi is a highly accomplished and influential figure in the field of healthcare. His unwavering passion for medicine and tireless dedication to improving healthcare outcomes have earned him widespread recognition and respect both nationally and internationally.",
      "He began his educational journey at the Faculty of Medicine at Kuwait University. Dr. Al Mazeedi is a member of the Kuwaiti Board of General Surgery and the Royal College of Surgeons (England), where he trained in Bariatric and Colorectal Surgery in London, UK. During this period, he honed his clinical skills and developed a profound understanding of complex medical conditions.",
      "Dr. Al Mazeedi is committed to transforming the healthcare landscape in Kuwait. He has spearheaded numerous initiatives aimed at integrating cutting-edge technology into healthcare delivery systems, improving patient outcomes, and enhancing overall efficiency.",
    ],
    descriptionArabic: [
      "يُعد د. سليمان المزيدي من الشخصيات البارزة والمؤثرة في قطاع الرعاية الصحية، حيث عُرف بشغفه الكبير بالطب والتزامه المستمر بتطوير جودة الرعاية الصحية وتحسين نتائج المرضى، ما أكسبه احترامًا وتقديرًا واسعًا على المستويين المحلي والدولي.",
      "بدأ رحلته الأكاديمية في كلية الطب بجامعة الكويت، وهو عضو في البورد الكويتي للجراحة العامة والكلية الملكية للجراحين في إنجلترا، حيث تلقى تدريبه في جراحات السمنة والقولون في لندن، المملكة المتحدة. وخلال هذه المرحلة، طوّر خبراته السريرية واكتسب فهمًا عميقًا للحالات الطبية المعقدة.",
      "ويؤمن د. المزيدي بأهمية تطوير القطاع الصحي في الكويت، حيث قاد العديد من المبادرات التي تهدف إلى دمج أحدث التقنيات في أنظمة الرعاية الصحية، بما يسهم في تحسين نتائج المرضى ورفع كفاءة الخدمات الطبية.",
    ],
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/file-manager/6a22fff4c88e2e7932620105/1780678706759-dr-sulaiman-al-mazeedi.png",
  },
  {
    initials: "AE",
    name: "Dr. Abubakr Elmardi",
    nameArabic: "د. أبو بكر المرضي",
    title:
      "Chief Strategic Officer (CSO)\nHead of Obstetrics & Gynecology Department\nConsultant Obstetrician & Gynecologist\nHead of Urogynecology Unit & Pelvic Floor Reconstructive Surgery\nHead of Cosmetic Gynecology Unit",
    titleArabic:
      "الرئيس الإستراتيجي التنفيذي \nرئيس قسم أمراض النساء والولادة\nاستشاري أمراض النساء والولادة\nرئيس وحدة المسالك البولية النسائية وجراحات الحوض الترميمية\nرئيس وحدة التجميل النسائي",
    description: [
      "Dr. Abubakr Elmardi is a distinguished consultant obstetrician and gynaecologist, currently serving as the Chief Strategic Officer and the Head of the Obstetrics & Gynaecology Department. With 24 years of experience as the former Head of Department at North Midland University Hospital in the UK, he brings exceptional depth of knowledge and clinical expertise to his role.",
      "He is a Fellow of several esteemed organizations, including the Royal College of Obstetricians & Gynaecologists (UK), the American College of Obstetricians & Gynaecologists, and the Faculty of Sexual & Reproductive Health (FFSRH) of the RCOG. Additionally, he is a Fellow of the International College of Surgeons (FICS) in the USA and an active member of both the International Urogynecological Association and the International Continence Society.",
      "Dr. Elmardi specializes in the management of normal and high-risk pregnancies, as well as normal, assisted, and complex deliveries, including caesarean sections and major obstetric surgeries. He is also experienced in cosmetic vaginal surgery, utilizing techniques such as Monalisa Touch and laser treatments.",
      "In the area of menstrual disorders, he offers innovative treatments like Novasure endometrial ablation for women who have completed their families. His surgical expertise includes hysteroscopic procedures for the removal of polyps, fibroids, and septa via Myosure (TCER), as well as laparoscopic surgeries addressing conditions such as adhesions and ectopic pregnancies.",
      "Dr. Elmardi is also dedicated to managing female urinary and pelvic floor disorders, performing urodynamic studies, and conducting bladder and pelvic floor scanning to ensure comprehensive care for his patients.",
    ],
    descriptionArabic: [
      "يُعد د. أبو بكر المرضي من أبرز الاستشاريين في مجال النساء والولادة، ويشغل حاليًا منصب الرئيس التنفيذي للاستراتيجية ورئيس قسم النساء والولادة. إذ يمتلك خبرة تمتد لأكثر من أربعة وعشرين عامًا كرئيس سابق للقسم في مستشفى نورث ميدلاند الجامعي بالمملكة المتحدة، مما يمنحه خبرة واسعة ومعرفة متقدمة في تخصصه.",
      "يحمل زمالات من عدة مؤسسات مرموقة، من بينها الكلية الملكية لأطباء النساء والولادة في المملكة المتحدة، والكلية الأمريكية لأطباء النساء والولادة، بالإضافة إلى كلية الصحة الجنسية والإنجابية التابعة للكلية الملكية البريطانية. كما أنه زميل الكلية الدولية للجراحين في الولايات المتحدة وعضو فعّال في الجمعية الدولية لأمراض المسالك البولية النسائية والجمعية الدولية للتحكم البولي.",
      "يتخصص د. المرضي في متابعة حالات الحمل الطبيعية وعالية الخطورة، وإجراء الولادات الطبيعية والمعقدة والقيصرية والعمليات النسائية الكبرى. كما يمتلك خبرة في جراحات التجميل النسائي باستخدام أحدث تقنيات الليزر وعلاج موناليزا.",
      "يقدم علاجات متطورة لاضطرابات الدورة الشهرية، مثل تقنية نوفاشور لعلاج بطانة الرحم، إضافة إلى إجراء المناظير النسائية والعمليات الجراحية لعلاج الأورام الليفية، والالتصاقات، والحمل خارج الرحم، واضطرابات قاع الحوض والمسالك البولية النسائية.",
    ],
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/file-manager/6a22fff4c88e2e7932620105/1780678708901-dr-abubakr-elmardi.png",
  },
  {
    initials: "OE",
    name: "Prof. Dr. Omar El Khateeb",
    nameArabic: "البروفيسور د. عمر الخطيب",
    title: "Medical Director\nConsultant of Anesthesia & Intensive Care Unit",
    titleArabic: "المدير الطبي\nاستشاري التخدير والعناية المركزة",
    description: [
      "Prof. Dr. Omar El Khateeb brings over 40 years of extensive experience in the field of Anesthesia and Painless Labor. He is a distinguished graduate of the Faculty of Medicine at Alexandria University, Egypt, where he laid the foundation for his impressive medical career.",
      "He holds a Master's Degree in Anesthesia and Surgical Intensive Care from the Alexandria School of Medicine, followed by a Doctorate Degree in Anesthesia, Intensive Care, and Pain Management from the University of Alexandria, awarded in 1982. His academic credentials are complemented by his membership in the International Association for the Study of Pain (IASP).",
      "Dr. El Khateeb is highly experienced in various specialized areas, including obstetric anesthesia and analgesia, as well as performing epidural blocks for childbirth. He has a profound understanding of anesthesia management for high-risk and elderly patients, ensuring safety and comfort. Additionally, he is skilled in surgical intensive care medicine for both adults and pediatric patients, and he has expertise in providing anesthesia for bariatric surgeries.",
    ],
    descriptionArabic: [
      "يمتلك البروفيسور الدكتور عمر الخطيب أكثر من 40 عامًا من الخبرة في مجال التخدير والولادة بدون ألم. تخرّج من كلية الطب بجامعة الإسكندرية في مصر، حيث أسس لمسيرة طبية متميزة.",
      "حصل على درجة الماجستير في التخدير والعناية المركزة الجراحية من كلية الطب بجامعة الإسكندرية، ثم نال درجة الدكتوراه في التخدير والعناية المركزة وعلاج الألم عام 1982. كما أنه عضو في الجمعية الدولية لدراسة (IASP).",
      "ويتمتع الدكتور الخطيب بخبرة واسعة في تخدير النساء والولادة، وتطبيق تقنيات التخدير فوق الجافية للولادة، إلى جانب خبرته في تخدير الحالات عالية الخطورة وكبار السن، والعناية المركزة الجراحية للكبار والأطفال، فضلًا عن التخدير لجراحات السمنة.",
    ],
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/file-manager/6a22fff4c88e2e7932620105/1780678709624-dr-omar-el-khateeb.png",
  },
  {
    initials: "SM",
    name: "Shibu Thomas Mathew",
    nameArabic: "شيبو توماس ماثيو",
    title: "Chief Financial Officer & Director – Human Resources Capital",
    titleArabic: "المدير المالي التنفيذي ومدير الموارد البشرية",
    description: [
      "Shibu Thomas Mathew has been part of Royale Hayat Hospital’s leadership journey since its inception, joining the pre-opening team in 2006 and contributing to the establishment of a trusted, world-class healthcare institution. He was appointed Financial Controller in 2007 and promoted to Chief Financial Officer in 2010.",
      "In his role as Chief Financial Officer and Director – Human Resources Capital, Mr. Shibu provides strategic leadership that integrates financial stewardship with people-centric governance. He oversees long-term investment planning, financial performance management, budget governance, and human capital strategy across all Group companies. He also serves as a Board Member for several subsidiaries, supporting strong governance, ethical decision-making, and sustainable growth.",
      "With prior senior leadership experience in finance, accounting, and treasury roles across multinational organizations, Mr. Shibu brings a balanced approach combining operational discipline, strategic foresight, and a deep commitment to people and purpose.",
      "He is a CMA (USA), ACMA India with IFRS credentials and executive education in healthcare strategy from Harvard T.H. Chan School of Public Health",
    ],
    descriptionArabic: [
      "يُعد شيبو توماس ماثيو أحد أعضاء فريق القيادة منذ تأسيس مستشفى رويال حياة، حيث انضم إلى فريق ما قبل الافتتاح عام 2006 وأسهم في بناء مؤسسة صحية عالمية موثوقة. عُيِّن مراقبًا ماليًا عام 2007 ثم تمت ترقيته إلى مدير مالي تنفيذي عام 2010.",
      "في إطار منصبه، يضطلع بالقيادة الاستراتيجية التي تدمج الإشراف المالي مع إدارة رأس المال البشري، حيث يشرف على التخطيط الاستثماري طويل المدى، وإدارة الأداء المالي، والحوكمة المالية، واستراتيجيات الموارد البشرية في جميع شركات المجموعة. كما يشغل عضوية مجلس إدارة عدد من الشركات التابعة، دعمًا للحوكمة الرشيدة والقرارات الأخلاقية السليمة والنمو المستدام.",
      "ويمتلك خبرة قيادية واسعة في مجالات المالية والمحاسبة والخزينة ضمن مؤسسات متعددة الجنسيات، ويجمع في أسلوبه القيادي بين الانضباط التشغيلي والرؤية الاستراتيجية والاهتمام بالعنصر البشري.",
      "هو حاصل على شهادة المحاسب الإداري المعتمد (CMA) من الولايات المتحدة الأمريكية، وعضو في معهد المحاسبين الإداريين المعتمدين (ACMA) في الهند، فضلًا عن حمله اعتماد المعايير الدولية لإعداد التقارير المالية (IFRS)، وشهادة التعليم التنفيذي في استراتيجية الرعاية الصحية من كلية هارفارد T.H. Chan للصحة العامة.",
    ],
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/file-manager/6a22fff4c88e2e7932620105/1780678708460-shibu-thomas-mathew.png",
  },
  {
    initials: "HG",
    name: "Dr. Hamid Ghaderi",
    nameArabic: "د. حميد القادري",
    title:
      "Head of Anesthesia, ICU & Pain Management\nDeputy Medical Director\nConsultant Anesthesia, ICU & Pain Management",
    titleArabic:
      "رئيس قسم التخدير والعناية المركزة وعلاج الألم\nنائب المدير الطبي\nاستشاري التخدير والعناية المركزة وعلاج الألم",
    description: [
      "Graduating from the prestigious Medical School at the Elite University of Heidelberg in Germany, Dr. Hamid has built an impressive career in the field of anesthesia, intensive care, and pain management. At the University of Heidelberg, Dr. Hamid served as a Consultant and Lecturer, specializing in anesthesia, intensive care, and pain management. This expertise is further validated by a German Board certification in Anesthesia, Surgical Intensive Care, and Clinical Pain Management from the same university.",
      "Dr. Hamid has completed fellowships in both Intensive and Neonatal Care at the Children's Hospital, University of Heidelberg, and in Cardiac Anesthesia in Germany. As a recognized professional, Dr. Hamid is a member of both the German and European Society for Anesthesia, ICU, and Pain Management, as well as the European Society for Cardiac Anesthesia.",
      "With extensive experience in general and regional anesthesia for all specialties and high-risk patients, Dr. Hamid is adept at handling anesthesia for bariatric surgeries and providing epidural injections for normal delivery and cesarean sections. Dr. Hamid has a subspecialty in pediatrics, neonatal anesthesia, and anesthesia for special needs, alongside surgical intensive care medicine for both adults and pediatrics.",
      "In chronic pain management, Dr. Hamid focuses on spine pain with therapeutic injections and has pioneered CT-guided spine therapeutic injection, establishing the first qualified center in Kuwait and the Middle East. The expertise extends to managing chronic pain for conditions such as headaches, shingles, fibromyalgia, cancer pain, and other pain-related conditions.",
    ],
    descriptionArabic: [
      "تخرّج د. حميد من كلية الطب بجامعة هايدلبرغ المرموقة في ألمانيا، وبنى مسيرة مهنية متميِّزة في مجالات التخدير والعناية المركزة وعلاج الألم حيث عمل استشاريًا ومحاضرًا في جامعة هايدلبرغ، وتخصص في التخدير والعناية المركزة وإدارة الألم.",
      "يحمل البورد الألماني في التخدير والعناية المركزة الجراحية وعلاج الألم السريري، كما أكمل زمالات متخصصة في العناية المركزة وحديثي الولادة وتخدير القلب في ألمانيا. وهو عضو في الجمعية الألمانية والأوروبية للتخدير والعناية المركزة وعلاج الألم، والجمعية الأوروبية لتخدير القلب.",
      "ويمتلك خبرة واسعة في التخدير العام والموضعي لمختلف التخصصات والحالات عالية الخطورة، بما في ذلك جراحات السمنة، وحقن التخدير للولادة الطبيعية والقيصرية. كما يتخصص في تخدير الأطفال وحديثي الولادة وذوي الاحتياجات الخاصة، إضافة إلى العناية المركزة للكبار والأطفال.",
      "وفي مجال علاج الألم المزمن، اشتُهر الدكتور حميد بريادته في علاج آلام العمود الفقري باستخدام الحقن العلاجية الموجهة بالأشعة المقطعية، حيث أسس أول مركز مؤهل لهذا النوع من العلاج في الكويت والشرق الأوسط، إلى جانب خبرته في علاج الصداع، وآلام السرطان، والفيبروميالغيا، وغيرها من الحالات المزمنة المرتبطة بالألم.",
    ],
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/file-manager/6a22fff4c88e2e7932620105/1780678707983-dr-hamid-ghaderi.png",
  },
  {
    initials: "MA",
    name: "Marta Abril Garcia",
    nameArabic: "مارتا أبريل غارسيا",
    title: "Director of Hospitality",
    titleArabic: "مديرة قسم الضيافة",
    description: [
      "Marta Abril Garcia brings almost two decades of international hospitality expertise to her role as Director of Hospitality at Royale Hayat Hospital, where she has been instrumental in shaping a patient and guest experience that consistently sets the standard for luxury healthcare in Kuwait.",
      "With a Master's in Tourism Companies Management and Strategic Communication from ESERP Business School in Madrid, Marta built her career across some of the world's most demanding hospitality environments — from the front lines of luxury hotels in London to boutique wellness resorts in Bali — before channelling that depth of experience into the healthcare sector.",
      "At Royale Hayat, Marta oversees an exceptionally broad portfolio of departments spanning both guest-facing and back-of-house operations — including Guest Relations, Admissions, Outpatient Department, Patient Experience, the Spa, Food & Beverage, Events, the Call Center, Housekeeping, Maintenance, Security, and Kitchen — ensuring that every touchpoint, seen and unseen, reflects the Hospital's hallmark standard of care and elegance.",
      "Her leadership has contributed directly to Royale Hayat's recognition as the Best Private Hospital in Kuwait for 16 consecutive years, as well as its distinction as one of Kuwait's Top 3 Brands in 2022 and Top 10 Brands in 2025.",
      "Having lived and worked across Europe, Asia, the Middle East, and with extended personal travel experience across all five continents, Marta brings a truly global perspective to her work, one grounded in the belief that exceptional hospitality, whether in a five-star resort or a world-class hospital, is always, at its heart, about people.",
    ],
    descriptionArabic: [
      "تتمتع مارتا أبريل غارسيا بخبرة دولية تمتد لما يقارب عقدين في مجال الضيافة، وتشغل منصب مديرة قطاع الضيافة في مستشفى رويال حياة، حيث كان لها دور محوري في تطوير تجربة المرضى والضيوف بما يرسّخ معايير الضيافة الصحية الفاخرة في الكويت.",
      "تحمل مارتا درجة الماجستير في إدارة شركات السياحة والاتصال الاستراتيجي من كلية ESERP للأعمال في مدريد، وقد بنت مسيرتها المهنية عبر العمل في بعض أكثر بيئات الضيافة تميُّزًا حول العالم، بدءًا من الفنادق الفاخرة في لندن وصولًا إلى المنتجعات الصحية الراقية في بالي، قبل أن تنقل هذه الخبرات الثرية إلى قطاع الرعاية الصحية.",
      "في رويال حياة، تشرف مارتا على مجموعة واسعة من الأقسام التشغيلية والخدمية، سواء المواجهة للعملاء أو الداعمة، بما يشمل: علاقات الضيوف، القبول والتسجيل، العيادات الخارجية، تجربة المرضى، السبا، الأغذية والمشروبات، الفعاليات، مركز خدمة العملاء، التدبير المنزلي، الصيانة، الأمن، والمطبخ، لضمان أن تعكس جميع نقاط التواصل المباشرة وغير المباشرة معايير المستشفى الرفيعة في الرعاية والأناقة.",
      "وقد ساهمت قيادتها بشكل مباشر في حصول مستشفى رويال حياة على لقب أفضل مستشفى خاص في الكويت لمدة 16 عامًا متتالية، بالإضافة إلى تصنيفه ضمن أفضل ثلاث علامات تجارية في الكويت لعام 2022، وضمن أفضل عشر علامات تجارية لعام 2025.",
      "وبفضل خبرتها المهنية والمعيشية في أوروبا وآسيا والشرق الأوسط، إلى جانب رحلاتها الواسعة عبر مختلف قارات العالم، تتمتع مارتا برؤية عالمية متكاملة، تنطلق من إيمان راسخ بأن الضيافة الاستثنائية، سواء في منتجع فاخر أو مستشفى عالمي، تتمحور دائمًا حول الإنسان أولًا.",
    ],
    image:
      "https://royal-hayat.s3.eu-central-1.amazonaws.com/file-manager/6a22fff4c88e2e7932620105/1780678709265-marta.png",
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const SEQUENCE_BASE = new Date("2025-12-01T12:00:00.000Z");

const getSequenceTimestamp = (index, total) =>
  new Date(SEQUENCE_BASE.getTime() + (total - index - 1) * DAY_MS);

const setSeedTimestamps = async (id, index, total) => {
  const timestamp = getSequenceTimestamp(index, total);
  await Leadership.collection.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    {
      $set: {
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    },
  );
};

const seedLeadership = async () => {
  await connectDB();

  let created = 0;
  let updated = 0;

  try {
    for (const [index, leader] of LEADERSHIP_TEAM.entries()) {
      const payload = {
        initials: leader.initials?.trim() || "",
        initialsArabic: leader.initialsArabic?.trim() || "",
        name: leader.name.trim(),
        nameArabic: leader.nameArabic.trim(),
        title: leader.title.trim(),
        titleArabic: leader.titleArabic.trim(),
        description: leader.description.map((item) => item.trim()).filter(Boolean),
        descriptionArabic: leader.descriptionArabic
          .map((item) => item.trim())
          .filter(Boolean),
        image: leader.image.trim(),
      };

      const existing = await Leadership.findOne({ name: payload.name });

      if (existing) {
        existing.set(payload);
        await existing.save();
        await setSeedTimestamps(existing._id, index, LEADERSHIP_TEAM.length);
        updated += 1;
        continue;
      }

      const createdDoc = await Leadership.create(payload);
      await setSeedTimestamps(createdDoc._id, index, LEADERSHIP_TEAM.length);
      created += 1;
    }

    console.log(
      `✅ Leadership seeding completed. Created: ${created}, Updated: ${updated}`,
    );
  } catch (error) {
    console.error("❌ Leadership seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

void seedLeadership();
