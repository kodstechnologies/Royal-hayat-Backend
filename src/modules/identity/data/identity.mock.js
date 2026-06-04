import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, 'identity.mock.json');

/** Toggle in code — no env var. Per-scenario rules in identity.mock.json. */
export const MOCK_FORCED_BOOKING_FAILURE_ENABLED = true;

let cachedConfig = null;

const loadConfig = () => {
  if (cachedConfig) return cachedConfig;

  try {
    const raw = readFileSync(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    cachedConfig = {
      enabled: parsed?.enabled === true,
      entries: Array.isArray(parsed?.entries) ? parsed.entries : [],
    };
  } catch {
    cachedConfig = { enabled: false, entries: [] };
  }

  return cachedConfig;
};

const entryByCivilId = () => {
  const map = new Map();
  const { enabled, entries } = loadConfig();
  if (!enabled) return map;

  for (const entry of entries) {
    const civilId = String(entry?.civilId || '').trim();
    if (/^\d{12}$/.test(civilId)) {
      map.set(civilId, entry);
    }
  }
  return map;
};

export const isMockCivilId = (civilId) => {
  const normalized = String(civilId || '').trim();
  if (!normalized) return false;
  return entryByCivilId().has(normalized);
};

export const getMockCivilIds = () => [...entryByCivilId().keys()];

const getMockEntry = (civilId) => entryByCivilId().get(String(civilId || '').trim()) || null;

export const buildMockIdentityRaw = (civilId) => {
  const entry = getMockEntry(civilId);
  const name = entry?.name || { english: 'TEST PATIENT MOCK', arabic: 'مريض تجريبي' };

  return {
    success: true,
    civilId,
    name: {
      english: name.english || name.en || 'TEST PATIENT MOCK',
      arabic: name.arabic || name.ar || 'مريض تجريبي',
    },
    sex: entry?.sex || 'M',
    dateOfBirth: entry?.dateOfBirth || '1990-01-15T00:00:00',
    nationality: entry?.nationality || {
      iso3Letter: 'KWT',
      iso2Letter: 'KW',
      name: { english: 'Kuwait', arabic: 'الكويت' },
      demonym: { english: 'Kuwaiti', arabic: 'كويتي' },
    },
    bloodType: entry?.bloodType || 'O+',
    address: entry?.address || {
      uniqueKey: 'mock-address',
      governorate: { english: 'Hawalli', arabic: 'حولي' },
    },
    registration: entry?.registration || {
      passport: 'MOCK-PASSPORT-001',
    },
  };
};

export const buildMockStartResult = (civilId) => {
  const raw = buildMockIdentityRaw(civilId);
  return {
    operationId: null,
    status: 'verified',
    verified: true,
    skippedStart: true,
    dataSource: 'mock',
    civilId,
    raw,
  };
};

export const buildMockDataResult = (civilId) => ({
  civilId,
  raw: buildMockIdentityRaw(civilId),
});

export const buildMockPatientRecord = (nationalid) => {
  const entry = getMockEntry(nationalid);
  const name = entry?.name || { english: 'TEST PATIENT MOCK', arabic: 'مريض تجريبي' };

  return {
    status: 'Success',
    patient_exist: true,
    patient_id: entry?.patientId || 'MOCK-PATIENT-001',
    nationalid,
    name: name.english || name.en || 'TEST PATIENT MOCK',
  };
};

const entryByPatientId = () => {
  const map = new Map();
  const { enabled, entries } = loadConfig();
  if (!enabled) return map;

  for (const entry of entries) {
    const patientId = String(entry?.patientId || '').trim();
    if (patientId) map.set(patientId, entry);
  }
  return map;
};

const isForcedBookingFailureEnabled = () =>
  MOCK_FORCED_BOOKING_FAILURE_ENABLED && loadConfig().enabled === true;

/**
 * QA-only forced booking failure for mock patients (see identity.mock.json).
 * Returns an error message when the scenario matches, otherwise null.
 */
export const getForcedBookingFailureMessage = ({ patientId, doctorId, date, slotTime }) => {
  if (!isForcedBookingFailureEnabled()) return null;

  const entry = entryByPatientId().get(String(patientId || '').trim());
  const config = entry?.forcedBookingFailure;
  if (!config?.enabled) return null;

  if (config.doctorId) {
    if (!doctorId || doctorId !== config.doctorId) return null;
  }
  if (config.date) {
    if (!date || date !== config.date) return null;
  }
  if (config.slotTimePrefix) {
    const normalizedSlot = String(slotTime || '').trim().match(/^(\d{1,2}):(\d{2})/);
    const slotPrefix = normalizedSlot
      ? `${parseInt(normalizedSlot[1], 10)}:${normalizedSlot[2]}`
      : '';
    if (!slotPrefix || !slotPrefix.startsWith(config.slotTimePrefix)) return null;
  }

  return config.message || 'Test booking failure (forced).';
};
