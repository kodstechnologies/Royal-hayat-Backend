/**
 * Authoritative site structure for the Royale Hayat public website.
 * Used only by the floating-chat AI grounding (not Book Appointment).
 */

export const SITE_OVERVIEW = {
  en: `Royale Hayat Hospital (Kuwait) public website. Users browse in English or Arabic (language toggle in the header). Main areas: About, Medical Services, Hospitality, Patients & Visitors, Work With Us. Header has search, Book Appointment button, and Contact options. Footer has quick links and forms.`,
  ar: `الموقع الرسمي لمستشفى رويال حياة (الكويت). التصفح بالعربية أو الإنجليزية من الشريط العلوي. الأقسام الرئيسية: من نحن، الخدمات الطبية، الضيافة، المرضى والزوار، اعمل معنا. يوجد بحث وحجز موعد واتصال في الهيدر.`,
};

/** Built-in floating chat widget (UI unchanged) — AI should mention these when relevant. */
export const FLOATING_CHAT_WIDGET = {
  en: `The floating chat button (bottom corner) includes:
- Type a question in the text box for AI help with navigating the site.
- Quick topic pills: "Book Appointment" (guided steps → /book-appointment), "Al Safwa HealthCare" (/al-safwa), "Jobs" (/work-with-us?section=positions), "Royal Home Health" (/home-health).
- After a guided topic, "Chat with our agent" then "Continue on WhatsApp" for patient care (+965 2536 0000).
Users can either follow your links in chat or use these same quick buttons.`,
  ar: `زر المحادثة العائم يتضمن:
- كتابة سؤال للحصول على مساعدة ذكية في استخدام الموقع.
- أزرار سريعة: حجز موعد، الصفوة، الوظائف، الرعاية المنزلية (مع خطوات إرشادية).
- بعد موضوع إرشادي: "هل تحتاج مزيداً من المساعدة؟" ثم "المتابعة عبر واتساب".
يمكن للمستخدم اتباع روابطك أو استخدام هذه الأزرار.`,
};

export const SITE_PAGES = [
  {
    path: '/',
    en: 'Home — overview, highlights, entry to booking and services.',
    ar: 'الرئيسية — نظرة عامة وروابط للخدمات والحجز.',
  },
  {
    path: '/about-us',
    en: 'About Us. Sections via URL: ?section=history (our story), ?section=mission, ?section=chairman, ?section=leadership.',
    ar: 'من نحن. أقسام: ?section=history، mission، chairman، leadership.',
  },
  {
    path: '/csr',
    en: 'Corporate Social Responsibility (CSR) programs.',
    ar: 'المسؤولية الاجتماعية للمؤسسة.',
  },
  {
    path: '/medical-services',
    en: 'Browse all medical services and departments by category. Click a department for details.',
    ar: 'تصفح الخدمات الطبية والأقسام حسب التصنيف.',
  },
  {
    path: '/medical-services/{slug}',
    en: 'Single department page (dynamic slug from CMS). Sub-services: /medical-services/{slug}/{subSlug}.',
    ar: 'صفحة قسم طبي (رابط ديناميكي). تخصصات فرعية: /medical-services/{slug}/{subSlug}.',
  },
  {
    path: '/departments',
    en: 'Departments listing (alternative entry to medical structure).',
    ar: 'قائمة الأقسام.',
  },
  {
    path: '/doctors',
    en: 'Search and browse doctors. Filter by specialty.',
    ar: 'البحث عن الأطباء وتصفحهم حسب التخصص.',
  },
  {
    path: '/doctors/{id}',
    en: 'Doctor profile — bio, specialty. Can request appointment via appointment request form.',
    ar: 'ملف الطبيب — السيرة والتخصص. يمكن طلب موعد من صفحة الطبيب.',
  },
  {
    path: '/book-appointment',
    en: 'Online appointment booking flow (registered patients, departments, doctors, slots). Use header "Book Appointment" to start.',
    ar: 'حجز موعد عبر الإنترنت (تدفق كامل على الموقع).',
  },
  {
    path: '/appointment-request',
    en: 'Submit an appointment request form (alternative to live booking). Optional ?doctor={id} when coming from a doctor profile.',
    ar: 'نموذج طلب موعد (بديل للحجز المباشر). ?doctor={id} من صفحة الطبيب.',
  },
  {
    path: '/al-safwa',
    en: 'Al Safwa Healthcare Program — elite care program info and enrollment.',
    ar: 'برنامج الصفوة للرعاية الصحية — التفاصيل والتسجيل.',
  },
  {
    path: '/home-health',
    en: 'Royale Home Health — nursing, physiotherapy, post-operative home care.',
    ar: 'رويال للرعاية المنزلية — تمريض وعلاج طبيعي ورعاية منزلية.',
  },
  {
    path: '/hospitality',
    en: 'Hospitality services hub. Sections: ?section=halls (celebration halls), ?section=suites, ?section=spa, ?section=cafe.',
    ar: 'خدمات الضيافة. أقسام: halls، suites، spa، cafe.',
  },
  {
    path: '/in-room-events',
    en: 'In-suite celebration experiences for families.',
    ar: 'تجارب الاحتفال داخل الجناح.',
  },
  {
    path: '/fifth-floor-cafe',
    en: 'The 5th Floor Café.',
    ar: 'كافيه الطابق الخامس.',
  },
  {
    path: '/newborn-photography',
    en: 'Newborn photography services.',
    ar: 'خدمات تصوير المواليد.',
  },
  {
    path: '/patients-visitors',
    en: 'Patients & Visitors hub. Tabs: ?tab=nursing, admission, insurance, during-stay, rooms-package, bill-of-rights.',
    ar: 'المرضى والزوار. تبويبات: nursing، admission، insurance، during-stay، rooms-package، bill-of-rights.',
  },
  {
    path: '/international-patient',
    en: 'International patient support and information.',
    ar: 'دعم المرضى الدوليين.',
  },
  {
    path: '/infant-security',
    en: 'TrackerWave infant security system information.',
    ar: 'نظام أمان الرضع.',
  },
  {
    path: '/work-with-us',
    en: 'Careers. ?section=culture (work culture), ?section=positions (open jobs). Apply via job application.',
    ar: 'الوظائف. culture وpositions. التقديم عبر نموذج الوظائف.',
  },
  {
    path: '/job-application',
    en: 'Submit a job application (often linked from a specific position).',
    ar: 'تقديم طلب وظيفة.',
  },
  {
    path: '/contact-us',
    en: 'Contact form and hospital contact details.',
    ar: 'اتصل بنا — نموذج ووسائل التواصل.',
  },
  {
    path: '/faq',
    en: 'Frequently asked questions. Also disclaimer (#disclaimer) and terms (#terms) on same page.',
    ar: 'الأسئلة الشائعة والشروط والإخلاء.',
  },
  {
    path: '/downloads',
    en: 'Downloadable documents and resources.',
    ar: 'التحميلات والمستندات.',
  },
  {
    path: '/medical-records-request',
    en: 'Request copies of medical records (form). Also in footer.',
    ar: 'طلب السجلات الطبية (نموذج).',
  },
  {
    path: '/medical-rep-visit-booking',
    en: 'Medical representative visit booking form.',
    ar: 'حجز زيارة مندوب طبي.',
  },
  {
    path: '/verify-national-id',
    en: 'National ID / identity verification (digital identity flow for eligible services).',
    ar: 'التحقق من الهوية الوطنية.',
  },
];

export const COMMON_TASKS = [
  {
    taskEn: 'Book a doctor appointment online',
    taskAr: 'حجز موعد مع طبيب عبر الإنترنت',
    stepsEn: [
      'Use header [Book Appointment](/book-appointment) OR chat pill "Book Appointment".',
      'Follow on-screen steps: patient type, department/doctor, date and time.',
      'Alternatively submit [Appointment Request](/appointment-request) if request form is preferred.',
      'Or call +965 2536 0000 / visit reception.',
    ],
    stepsAr: [
      'من الهيدر [حجز موعد](/book-appointment) أو زر المحادثة "حجز موعد".',
      'اتبع خطوات الحجز على الشاشة.',
      'أو [طلب موعد](/appointment-request) أو الاتصال +965 2536 0000.',
    ],
  },
  {
    taskEn: 'Find the right department or specialty',
    taskAr: 'العثور على القسم أو التخصص المناسب',
    stepsEn: [
      'Open [Medical Services](/medical-services) to browse by category.',
      'Or [Doctors](/doctors) to search by doctor name or specialty.',
      'Open a department page for details and subspecialties.',
    ],
    stepsAr: [
      'افتح [الخدمات الطبية](/medical-services).',
      'أو [الأطباء](/doctors) للبحث بالاسم أو التخصص.',
    ],
  },
  {
    taskEn: 'Insurance and admission questions',
    taskAr: 'التأمين ومعلومات الدخول',
    stepsEn: [
      '[Patients & Visitors — Insurance](/patients-visitors?tab=insurance).',
      '[Admission information](/patients-visitors?tab=admission).',
      'FAQ: [Insurance question](/faq). Phone: +965 2536 0000.',
    ],
    stepsAr: [
      '[التأمين](/patients-visitors?tab=insurance) و[القبول](/patients-visitors?tab=admission).',
      '[الأسئلة الشائعة](/faq) أو +965 2536 0000.',
    ],
  },
  {
    taskEn: 'Apply for a job',
    taskAr: 'التقديم على وظيفة',
    stepsEn: [
      'Chat pill "Jobs" OR [Work With Us — Open Positions](/work-with-us?section=positions).',
      'Select a role and complete [Job Application](/job-application).',
    ],
    stepsAr: [
      'زر "الوظائف" أو [اعمل معنا](/work-with-us?section=positions).',
      'ثم [نموذج التقديم](/job-application).',
    ],
  },
  {
    taskEn: 'Request medical records',
    taskAr: 'طلب السجلات الطبية',
    stepsEn: ['Complete the form at [Medical Records Request](/medical-records-request).'],
    stepsAr: ['املأ [طلب السجلات الطبية](/medical-records-request).'],
  },
  {
    taskEn: 'Contact the hospital',
    taskAr: 'التواصل مع المستشفى',
    stepsEn: [
      '[Contact Us](/contact-us), call +965 2536 0000, or WhatsApp via chat "Continue on WhatsApp".',
    ],
    stepsAr: [
      '[اتصل بنا](/contact-us) أو +965 2536 0000 أو واتساب من المحادثة.',
    ],
  },
];
