import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fse from "fs-extra";
import royalHayatService from "../modules/royalhayat/services/royalhayat.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function todayIso() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractDoctorsFromTs(tsSource) {
  // Very lightweight extraction from the static array in doctorsWithClinicCodes.ts.
  // We rely on stable formatting: `id: '...'`, `name: '...'`, `providerCode: '...'`,
  // and `clinicCode`/`departmentClinicCode`.
  const ids = [...tsSource.matchAll(/^\s{4}id:\s*'([^']+)'/gm)].map((m) => m[1]);
  const docs = [];

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const start = tsSource.indexOf(`id: '${id}'`);
    const nextStart = i < ids.length - 1 ? tsSource.indexOf(`id: '${ids[i + 1]}'`) : tsSource.indexOf("];", start);
    const chunkStart = tsSource.lastIndexOf("{", start);
    const chunk = tsSource.slice(Math.max(0, chunkStart), nextStart);

    const name = (chunk.match(/\n\s{4}name:\s*'([^']+)'/) || [])[1] ?? "";
    const providerCode = (chunk.match(/\n\s{4}providerCode:\s*'([^']+)'/) || [])[1] ?? null;
    const clinicCode =
      (chunk.match(/\n\s{4}clinicCode:\s*'([^']+)'/) || [])[1] ??
      (chunk.match(/\n\s{4}departmentClinicCode:\s*'([^']+)'/) || [])[1] ??
      null;
    const hideBooking = /\n\s{4}hideBooking:\s*true/.test(chunk);

    docs.push({ id, name, providerCode, clinicCode, hideBooking });
  }

  return docs;
}

function toDoctorAuditShape(row) {
  return {
    name: row.name,
    specialityid: row.specialitycode ?? null,
    providerid: row.providerCode ?? null,
  };
}

async function runPool(items, worker, { concurrency }) {
  const results = new Array(items.length);
  let idx = 0;

  async function runner() {
    while (true) {
      const i = idx++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  }

  const n = Math.max(1, Number(concurrency) || 1);
  await Promise.all(Array.from({ length: n }, () => runner()));
  return results;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const servicecode = String(args.servicecode || process.env.ROYAL_HAYAT_SERVICE_CODE || "R01-FMC001-F010");
  const date = String(args.date || process.env.ROYAL_HAYAT_AVAIL_DATE || todayIso());
  const concurrency = Number(args.concurrency || process.env.ROYAL_HAYAT_AVAIL_CONCURRENCY || 2);
  const delayMs = Number(args.delayMs || process.env.ROYAL_HAYAT_AVAIL_DELAY_MS || 250);

  const defaultDoctorsFile = path.resolve(__dirname, "../../../royal-hayat-website/src/data/doctorsWithClinicCodes.ts");
  const doctorsFile = path.resolve(process.cwd(), String(args.doctorsFile || process.env.DOCTORS_WITH_CLINIC_CODES_PATH || defaultDoctorsFile));

  const outDir = path.resolve(process.cwd(), String(args.outDir || process.env.AVAIL_AUDIT_OUTDIR || "tmp"));
  await fse.ensureDir(outDir);
  const outFile = path.join(outDir, `availability-audit-${date}.json`);

  if (!fs.existsSync(doctorsFile)) {
    throw new Error(
      `Doctors file not found at '${doctorsFile}'. Pass --doctorsFile <path> or set DOCTORS_WITH_CLINIC_CODES_PATH.`,
    );
  }

  const tsSource = fs.readFileSync(doctorsFile, "utf8");
  const doctors = extractDoctorsFromTs(tsSource);

  const startedAt = new Date().toISOString();

  const results = await runPool(
    doctors,
    async (d) => {
      const base = {
        id: d.id,
        name: d.name,
        hideBooking: d.hideBooking,
        providerCode: d.providerCode,
        specialitycode: d.clinicCode,
      };

      if (!d.providerCode || !d.clinicCode) {
        return { ...base, ok: false, skipped: true, reason: "Missing providerCode or specialitycode", slotCount: 0 };
      }

      // small spacing to avoid hammering upstream / local rate limit
      if (delayMs > 0) await sleep(delayMs);

      try {
        const res = await royalHayatService.getAvailability({
          specialitycode: d.clinicCode,
          providercode: d.providerCode,
          servicecode,
          datefrom: date,
          dateto: date,
        });
        const slotCount = Array.isArray(res?.slot_list) ? res.slot_list.length : 0;
        const sampleSlot =
          slotCount > 0
            ? {
                slot_booking_id: res.slot_list[0]?.slot_booking_id ?? null,
                slot_date: res.slot_list[0]?.slot_date ?? null,
                slot_from_time: res.slot_list[0]?.slot_from_time ?? null,
                slot_to_time: res.slot_list[0]?.slot_to_time ?? null,
              }
            : null;
        return { ...base, ok: true, skipped: false, slotCount, sampleSlot, truncated: !!res?.truncated };
      } catch (e) {
        return {
          ...base,
          ok: false,
          skipped: false,
          slotCount: 0,
          sampleSlot: null,
          error: {
            message: e?.message ? String(e.message) : String(e),
            statusCode: e?.statusCode ?? undefined,
          },
        };
      }
    },
    { concurrency },
  );

  const summary = {
    startedAt,
    finishedAt: new Date().toISOString(),
    doctorsFile,
    total: doctors.length,
    attempted: results.filter((r) => !r.skipped).length,
    skipped: results.filter((r) => r.skipped).length,
    ok: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok && !r.skipped).length,
    servicecode,
    date,
    concurrency,
    delayMs,
  };

  const workingForDoctors = results
    .filter((r) => r.ok)
    .map((r) => ({
      ...toDoctorAuditShape(r),
      slotCount: r.slotCount ?? 0,
      sampleSlot: r.sampleSlot ?? null,
    }));

  const notWorkingForDoctors = results
    .filter((r) => !r.ok)
    .map((r) => ({
      ...toDoctorAuditShape(r),
      skipped: !!r.skipped,
      reason: r.reason ?? null,
      error: r.error ?? null,
    }));

  const doctorsWithDifferentSlotFromAndToTime = results
    .filter(
      (r) =>
        r.ok &&
        r.sampleSlot &&
        r.sampleSlot.slot_from_time &&
        r.sampleSlot.slot_to_time &&
        r.sampleSlot.slot_from_time !== r.sampleSlot.slot_to_time,
    )
    .map((r) => ({
      ...toDoctorAuditShape(r),
      slot_from_time: r.sampleSlot.slot_from_time,
      slot_to_time: r.sampleSlot.slot_to_time,
    }));

  const payload = {
    summary,
    results,
    workingForDoctors,
    notWorkingForDoctors,
    doctorsWithDifferentSlotFromAndToTime,
  };
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), "utf8");

  console.log(`Wrote availability audit: ${outFile}`);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

