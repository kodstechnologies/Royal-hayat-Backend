/**
 * Seed runtime / wp-content PDFs from storage/runtime-uploads into MongoDB + S3
 * with legacy public paths so they open via RuntimePdfViewer and are editable in admin.
 *
 * Usage:
 *   npm run seed:runtime-documents
 *   npm run seed:runtime-documents -- --dry-run
 *   npm run seed:runtime-documents -- --only-missing
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import "../config/env.js";
import connectDB from "../config/db.js";
import Documents from "../modules/document/model/document.model.js";
import { listRuntimePdfs } from "../modules/runtimePdfViewer/config/runtimePdfMap.js";
import {
  getDocumentPublicPath,
  uploadLocalFileToS3,
  buildPublicPathLookupCandidates,
} from "../utils/documentStorage.js";
import runtimePdfLabels from "./data/runtimePdfLabels.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, "../../storage/runtime-uploads");
const MANIFEST_PATH = path.join(UPLOADS_DIR, "manifest.json");

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const ONLY_MISSING = args.has("--only-missing");

const normalizeLookupKey = (value) =>
  decodeURIComponent(String(value || ""))
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/_(\d+)(?=\.pdf$)/i, "")
    .replace(/ /g, "_")
    .toLowerCase();

const humanizeFilename = (filename) =>
  path
    .basename(filename, path.extname(filename))
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildFullPublicPath = (mount, relativePath) => {
  const decodedRelative = relativePath
    .split("/")
    .map((segment) => decodeURIComponent(segment))
    .join("/");
  return getDocumentPublicPath(`${mount}/${decodedRelative}`);
};

const resolveLocalFile = (filePath) => {
  if (!filePath) return null;
  if (fs.existsSync(filePath)) return filePath;

  const basename = path.basename(filePath);
  const stem = path.basename(basename, path.extname(basename));
  const candidates = [
    basename,
    `${stem}_1.pdf`,
    basename.replace(/ /g, "_"),
    `${stem.replace(/ /g, "_")}_1.pdf`,
  ];

  for (const candidate of candidates) {
    const candidatePath = path.join(UPLOADS_DIR, candidate);
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  return null;
};

const loadManifestIndex = () => {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { byLocalKey: new Map(), byId: new Map() };
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const byLocalKey = new Map();
  const byId = new Map();

  for (const entry of manifest) {
    byId.set(String(entry.id), entry);
    const keys = [
      normalizeLookupKey(entry.localFile),
      normalizeLookupKey(entry.s3Key),
      normalizeLookupKey(entry.title),
    ];
    for (const key of keys) {
      if (key) byLocalKey.set(key, entry);
    }
  }

  return { byLocalKey, byId };
};

const buildLabelIndex = () => {
  const index = new Map();
  for (const item of runtimePdfLabels) {
    index.set(normalizeLookupKey(item.path), item.label);
  }
  return index;
};

const resolveTitle = ({ publicPath, localFilePath, manifestEntry, labelIndex }) => {
  if (manifestEntry?.title) return manifestEntry.title;

  const label = labelIndex.get(normalizeLookupKey(publicPath));
  if (label) return label;

  return humanizeFilename(localFilePath);
};

const findExistingDocument = async ({ publicPath, manifestEntry }) => {
  const candidates = buildPublicPathLookupCandidates(publicPath);
  const byPath = await Documents.findOne({ publicPath: { $in: candidates } })
    .sort({ updatedAt: -1, contentVersion: -1 })
    .lean();
  if (byPath) return byPath;

  if (manifestEntry?.id) {
    const byId = await Documents.findById(manifestEntry.id).lean();
    if (byId) return byId;
  }

  return null;
};

const collectSeedEntries = () => {
  const entries = listRuntimePdfs();
  const unique = new Map();

  for (const entry of entries) {
    const publicPath = buildFullPublicPath(entry.mount, entry.publicPath);
    const localFilePath = resolveLocalFile(entry.filePath);

    if (!localFilePath) continue;

    const aliasKey = path.resolve(localFilePath).toLowerCase();
    const candidate = {
      publicPath,
      localFilePath,
      mount: entry.mount,
      relativePath: entry.publicPath,
    };

    const existing = unique.get(aliasKey);
    if (!existing) {
      unique.set(aliasKey, candidate);
      continue;
    }

    if (publicPath.includes(" ") && !existing.publicPath.includes(" ")) {
      unique.set(aliasKey, candidate);
    }
  }

  return [...unique.values()];
};

const main = async () => {
  await connectDB();

  const { byLocalKey } = loadManifestIndex();
  const labelIndex = buildLabelIndex();
  const seedEntries = collectSeedEntries();

  if (!seedEntries.length) {
    console.log("No local runtime PDF files found in storage/runtime-uploads.");
    await mongoose.connection.close();
    return;
  }

  console.log(`Found ${seedEntries.length} local PDF(s) to seed.`);
  if (DRY_RUN) console.log("DRY RUN — no uploads or database writes.\n");

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of seedEntries) {
    const localKey = normalizeLookupKey(path.basename(entry.localFilePath));
    const manifestEntry = byLocalKey.get(localKey);
    const existing = await findExistingDocument({
      publicPath: entry.publicPath,
      manifestEntry,
    });

    if (ONLY_MISSING && existing?.publicPath === entry.publicPath && existing?.file) {
      skipped += 1;
      console.log(`↷ Skipped (already seeded): ${entry.publicPath}`);
      continue;
    }

    const title = resolveTitle({
      publicPath: entry.publicPath,
      localFilePath: entry.localFilePath,
      manifestEntry,
      labelIndex,
    });

    try {
      if (DRY_RUN) {
        console.log(`• ${title}`);
        console.log(`  path: ${entry.publicPath}`);
        console.log(`  file: ${entry.localFilePath}`);
        continue;
      }

      const uploaded = await uploadLocalFileToS3(
        entry.localFilePath,
        entry.publicPath,
        "application/pdf",
      );

      const payload = {
        title,
        catagory: manifestEntry?.category || "Brochure",
        description: title,
        file: uploaded.key,
        publicPath: entry.publicPath,
        status: "active",
      };

      if (existing) {
        await Documents.findByIdAndUpdate(existing._id, payload, { new: true });
        updated += 1;
        console.log(`✓ Updated: ${title}`);
      } else {
        await Documents.create(payload);
        created += 1;
        console.log(`✓ Created: ${title}`);
      }

      console.log(`  → ${entry.publicPath}`);
    } catch (error) {
      failed += 1;
      console.error(`✗ Failed: ${title}`);
      console.error(`  ${error.message}`);
    }
  }

  console.log("\n--- Summary ---");
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed:  ${failed}`);
  console.log("\nDocuments are now available in Admin → Documents and open at their public paths.");

  await mongoose.connection.close();
};

main().catch(async (error) => {
  console.error("Seed failed:", error);
  try {
    await mongoose.connection.close();
  } catch {
    // ignore
  }
  process.exit(1);
});
