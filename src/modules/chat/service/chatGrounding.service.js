import Department from '../../departments/models/department.model.js';
import { CHAT_FAQ } from '../data/chatFaq.js';
import {
  SITE_OVERVIEW,
  FLOATING_CHAT_WIDGET,
  SITE_PAGES,
  COMMON_TASKS,
} from '../data/chatSiteMap.js';
import { resolveWebsiteDepartmentSlug } from '../data/websiteDepartmentSlugs.js';

const CACHE_TTL_MS = Number(process.env.CHAT_GROUNDING_CACHE_TTL_MS || 600_000);
const MAX_DEPT_DESC_CHARS = Number(process.env.CHAT_GROUNDING_DEPT_DESC_MAX || 160);
const MAX_DEPARTMENTS = Number(process.env.CHAT_GROUNDING_MAX_DEPARTMENTS || 60);

/** Full assembled grounding strings (static CMS blocks + departments), per language. */
let groundingCache = { loadedAt: 0, en: '', ar: '' };

/** Static site map / FAQ / tasks — immutable until deploy. */
let staticGroundingCache = { en: '', ar: '' };

function truncate(text, max) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

async function fetchDepartmentLines() {
  const rows = await Department.find({ isActive: true })
    .select('name arabicName description arabicDescription')
    .populate('catagory', 'name arabicName')
    .sort({ order: 1, name: 1 })
    .limit(MAX_DEPARTMENTS)
    .lean();

  const linesEn = [];
  const linesAr = [];

  for (const row of rows) {
    const slug = resolveWebsiteDepartmentSlug(row.name);
    const path = `/medical-services/${slug}`;
    const categoryEn = row.catagory?.name ? ` (${row.catagory.name})` : '';
    const categoryAr = row.catagory?.arabicName ? ` (${row.catagory.arabicName})` : '';

    linesEn.push(
      `- ${row.name}${categoryEn}: ${truncate(row.description, MAX_DEPT_DESC_CHARS)} → ${path}`,
    );
    linesAr.push(
      `- ${row.arabicName || row.name}${categoryAr}: ${truncate(row.arabicDescription || row.description, MAX_DEPT_DESC_CHARS)} → ${path}`,
    );
  }

  return {
    textEn: linesEn.join('\n'),
    textAr: linesAr.join('\n'),
  };
}

function formatFaq(lang) {
  const isAr = lang === 'ar';
  return CHAT_FAQ.map((item, i) => {
    const q = isAr ? item.qAr : item.qEn;
    const a = isAr ? item.aAr : item.aEn;
    return `${i + 1}. Q: ${q}\n   A: ${a}`;
  }).join('\n');
}

function formatSitePages(lang) {
  const isAr = lang === 'ar';
  return SITE_PAGES.map((page) => `- ${page.path}: ${isAr ? page.ar : page.en}`).join('\n');
}

function formatCommonTasks(lang) {
  const isAr = lang === 'ar';
  return COMMON_TASKS.map((task, i) => {
    const title = isAr ? task.taskAr : task.taskEn;
    const steps = (isAr ? task.stepsAr : task.stepsEn).map((s, j) => `   ${j + 1}. ${s}`).join('\n');
    return `${i + 1}. **${title}**\n${steps}`;
  }).join('\n\n');
}

function buildStaticGrounding(lang) {
  const isAr = lang === 'ar';

  return `
## Site overview
${isAr ? SITE_OVERVIEW.ar : SITE_OVERVIEW.en}

## Hospital contact
- Phone (24/7): +965 2536 0000
- WhatsApp: available via floating chat "Continue on WhatsApp"

## Floating chat widget (existing UI — reference when guiding users)
${isAr ? FLOATING_CHAT_WIDGET.ar : FLOATING_CHAT_WIDGET.en}

## Full site page map (use exact paths in Markdown links)
${formatSitePages(lang)}

## How to complete common tasks on this website
${formatCommonTasks(lang)}

## Frequently asked questions
${formatFaq(lang)}`.trim();
}

function getStaticGrounding(lang) {
  if (!staticGroundingCache.en) {
    staticGroundingCache = {
      en: buildStaticGrounding('en'),
      ar: buildStaticGrounding('ar'),
    };
  }
  return lang === 'ar' ? staticGroundingCache.ar : staticGroundingCache.en;
}

function assembleFullGrounding(lang, departmentsBlock) {
  const deptSection =
    departmentsBlock ||
    '(Department list temporarily unavailable — direct users to /medical-services)';

  return `${getStaticGrounding(lang)}

## Active medical departments from CMS (exact names and paths — do not invent)
${deptSection}`.trim();
}

async function refreshGroundingCache() {
  const now = Date.now();
  const dept = await fetchDepartmentLines();

  groundingCache = {
    loadedAt: now,
    en: assembleFullGrounding('en', dept.textEn),
    ar: assembleFullGrounding('ar', dept.textAr),
  };

  return groundingCache;
}

export async function buildGroundingContext(lang) {
  const now = Date.now();
  if (!groundingCache.loadedAt || now - groundingCache.loadedAt >= CACHE_TTL_MS) {
    await refreshGroundingCache();
  }

  return lang === 'ar' ? groundingCache.ar : groundingCache.en;
}
