import Department from '../../departments/models/department.model.js';
import { CHAT_FAQ } from '../data/chatFaq.js';
import {
  SITE_OVERVIEW,
  FLOATING_CHAT_WIDGET,
  SITE_PAGES,
  COMMON_TASKS,
} from '../data/chatSiteMap.js';

const CACHE_TTL_MS = Number(process.env.CHAT_GROUNDING_CACHE_TTL_MS || 600_000);
const MAX_DEPT_DESC_CHARS = Number(process.env.CHAT_GROUNDING_DEPT_DESC_MAX || 160);
const MAX_DEPARTMENTS = Number(process.env.CHAT_GROUNDING_MAX_DEPARTMENTS || 60);

let departmentCache = { loadedAt: 0, textEn: '', textAr: '' };

function truncate(text, max) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

function departmentSlug(name, mongoId) {
  const base = String(name)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${String(mongoId).slice(-6)}`;
}

async function loadDepartmentGrounding() {
  const now = Date.now();
  if (departmentCache.loadedAt && now - departmentCache.loadedAt < CACHE_TTL_MS) {
    return departmentCache;
  }

  const rows = await Department.find({ isActive: true })
    .select('name arabicName description arabicDescription')
    .populate('catagory', 'name arabicName')
    .sort({ order: 1, name: 1 })
    .limit(MAX_DEPARTMENTS)
    .lean();

  const linesEn = [];
  const linesAr = [];

  for (const row of rows) {
    const id = String(row._id);
    const slug = departmentSlug(row.name, id);
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

  departmentCache = {
    loadedAt: now,
    textEn: linesEn.join('\n'),
    textAr: linesAr.join('\n'),
  };

  return departmentCache;
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

export async function buildGroundingContext(lang) {
  const dept = await loadDepartmentGrounding();
  const departmentsBlock = lang === 'ar' ? dept.textAr : dept.textEn;
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
${formatFaq(lang)}

## Active medical departments from CMS (exact names and paths — do not invent)
${departmentsBlock || '(Department list temporarily unavailable — direct users to /medical-services)'}
`.trim();
}
