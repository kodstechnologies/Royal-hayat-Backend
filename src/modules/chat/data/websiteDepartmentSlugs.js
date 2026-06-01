/**
 * Canonical /medical-services/{slug} paths on the public website (static departmentDetails).
 * CMS MongoDB names may differ — map them here so the chat never links to non-existent slugs.
 */

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Official site slugs — keep in sync with royal-hayat-website/src/data/departments.ts */
const WEBSITE_DEPARTMENTS = [
  { slug: 'obstetrics-gynecology', names: ['Obstetrics & Gynecology', 'Obstetrics Department', 'OB/GYN', 'OBGYN'] },
  { slug: 'reproductive-medicine-ivf', names: ['Reproductive Medicine & IVF', 'Reproductive Medicine and IVF', 'IVF'] },
  { slug: 'pediatrics', names: ['Pediatrics', 'Pediatric Department'] },
  { slug: 'neonatal', names: ['Neonatal', 'Neonatal Department', 'Neonatal Unit'] },
  { slug: 'internal-medicine', names: ['Internal Medicine'] },
  { slug: 'general-laparoscopic-surgery', names: ['General & Laparoscopic Surgery', 'General and Laparoscopic Surgery'] },
  { slug: 'plastic-surgery', names: ['Plastic Surgery & Cosmetology', 'Plastic Surgery and Cosmetology', 'Plastic Surgery'] },
  { slug: 'dermatology', names: ['Dermatology'] },
  { slug: 'ent', names: ['ENT (Ear, Nose & Throat)', 'ENT', 'Ear Nose and Throat'] },
  { slug: 'family-medicine', names: ['Family Medicine'] },
  { slug: 'dental-clinic', names: ['Dental Clinic', 'Dental'] },
  { slug: 'pain-management', names: ['Pain Management'] },
  { slug: 'anesthesia', names: ['Anesthesia'] },
  { slug: 'intensive-care', names: ['Intensive Care', 'ICU'] },
  { slug: 'center-for-diagnostic-imaging', names: ['Center for Diagnostic Imaging', 'Diagnostic Imaging', 'Radiology'] },
  { slug: 'laboratory-services', names: ['Laboratory Services', 'Laboratory'] },
  { slug: 'royale-hayat-pharmacy', names: ['Royale Hayat Pharmacy', 'Royal Hayat Pharmacy', 'Pharmacy'] },
  { slug: 'clinical-pharmacy', names: ['Clinical Pharmacy'] },
  { slug: 'al-safwa-healthcare', names: ['Al Safwa HealthCare', 'Al Safwa Healthcare', 'Al Safwa'] },
  { slug: 'home-health', names: ['Royale Home Health', 'Home Health', 'Home Health Care'] },
  { slug: 'physiotherapy', names: ['Physiotherapy', 'Physical Therapy'] },
];

const exactNameToSlug = new Map();
for (const { slug, names } of WEBSITE_DEPARTMENTS) {
  for (const name of names) {
    exactNameToSlug.set(normalizeName(name), slug);
  }
}

/** CMS slug fragments (without mongo id suffix) → website slug */
const CMS_SLUG_ALIASES = {
  'obstetrics-department': 'obstetrics-gynecology',
  'obstetrics-and-gynecology': 'obstetrics-gynecology',
  'ob-gyn': 'obstetrics-gynecology',
  'plastic-surgery-and-cosmetology': 'plastic-surgery',
  'ent-ear-nose-and-throat': 'ent',
  'royale-hayat-pharmacy': 'royale-hayat-pharmacy',
  'royal-hayat-pharmacy': 'royale-hayat-pharmacy',
};

function slugifyName(name) {
  return String(name)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Resolve a CMS department display name to the website route slug.
 */
export function resolveWebsiteDepartmentSlug(cmsName) {
  const normalized = normalizeName(cmsName);
  if (exactNameToSlug.has(normalized)) {
    return exactNameToSlug.get(normalized);
  }

  // Partial name match (e.g. CMS "Obstetrics Department")
  if (normalized.includes('obstetric') || normalized.includes('gynecolog') || normalized.includes('ob gyn')) {
    return 'obstetrics-gynecology';
  }
  if (normalized.includes('reproductive') || normalized.includes('ivf')) {
    return 'reproductive-medicine-ivf';
  }
  if (normalized.includes('neonatal')) return 'neonatal';
  if (normalized.includes('pediatric')) return 'pediatrics';
  if (normalized.includes('internal medicine')) return 'internal-medicine';
  if (normalized.includes('laparoscopic') || normalized.includes('general surgery')) {
    return 'general-laparoscopic-surgery';
  }
  if (normalized.includes('plastic') || normalized.includes('cosmetolog')) return 'plastic-surgery';
  if (normalized.includes('dermatolog')) return 'dermatology';
  if (normalized.includes('family medicine')) return 'family-medicine';
  if (normalized.includes('dental')) return 'dental-clinic';
  if (normalized.includes('pain management')) return 'pain-management';
  if (normalized.includes('anesthesia') || normalized.includes('anaesthesia')) return 'anesthesia';
  if (normalized.includes('intensive care') || normalized === 'icu') return 'intensive-care';
  if (normalized.includes('diagnostic imaging') || normalized.includes('radiology')) {
    return 'center-for-diagnostic-imaging';
  }
  if (normalized.includes('laboratory') || normalized.includes('lab service')) {
    return 'laboratory-services';
  }
  if (normalized.includes('clinical pharmacy')) return 'clinical-pharmacy';
  if (normalized.includes('safwa')) return 'al-safwa-healthcare';
  if (normalized.includes('home health')) return 'home-health';
  if (normalized.includes('physiotherapy') || normalized.includes('physical therapy')) {
    return 'physiotherapy';
  }
  if (normalized.includes('pharmacy') && !normalized.includes('clinical')) {
    return 'royale-hayat-pharmacy';
  }

  return slugifyName(cmsName);
}

/**
 * If a URL slug was already generated with a mongo id suffix, map it to the website slug.
 */
export function resolveWebsiteSlugFromPathSlug(pathSlug) {
  const raw = String(pathSlug || '').trim();
  if (!raw) return '';

  const withoutMongoSuffix = raw.replace(/-[a-f0-9]{6}$/i, '');
  if (CMS_SLUG_ALIASES[withoutMongoSuffix]) {
    return CMS_SLUG_ALIASES[withoutMongoSuffix];
  }

  const knownSlugs = new Set(WEBSITE_DEPARTMENTS.map((d) => d.slug));
  if (knownSlugs.has(raw) || knownSlugs.has(withoutMongoSuffix)) {
    return knownSlugs.has(raw) ? raw : withoutMongoSuffix;
  }

  for (const slug of knownSlugs) {
    if (withoutMongoSuffix === slug || withoutMongoSuffix.startsWith(`${slug}-`)) {
      return slug;
    }
  }

  return CMS_SLUG_ALIASES[withoutMongoSuffix] || withoutMongoSuffix;
}
