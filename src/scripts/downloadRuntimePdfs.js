import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream/promises";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import connectDB from "../config/db.js";
import Documents from "../modules/document/model/document.model.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../../storage/runtime-uploads");
const MANIFEST_PATH = path.join(OUTPUT_DIR, "manifest.json");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const isPdfKey = (key) => /\.pdf$/i.test(String(key ?? "").split("?")[0]);

const extractS3Key = (keyOrUrl) => {
  if (!keyOrUrl) return null;
  const value = String(keyOrUrl).trim();
  if (value.startsWith("http")) {
    try {
      return decodeURIComponent(new URL(value).pathname.replace(/^\/+/, ""));
    } catch {
      return null;
    }
  }
  return value;
};

const stripTimestampPrefix = (filename) => {
  const base = path.basename(filename);
  return base.replace(/^\d{10,}-/, "");
};

const sanitizeFilename = (filename) => {
  return stripTimestampPrefix(filename)
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
};

const uniquePath = (dir, filename) => {
  const ext = path.extname(filename);
  const stem = path.basename(filename, ext);
  let candidate = filename;
  let counter = 1;

  while (fs.existsSync(path.join(dir, candidate))) {
    candidate = `${stem}_${counter}${ext}`;
    counter += 1;
  }

  return path.join(dir, candidate);
};

const downloadFromS3 = async (key, destPath) => {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error("Empty S3 response body");
  }

  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  await pipeline(response.Body, fs.createWriteStream(destPath));
};

const main = async () => {
  await connectDB();

  const docs = await Documents.find({}).lean();
  const pdfDocs = docs.filter((doc) => isPdfKey(doc.file));

  if (!pdfDocs.length) {
    console.log("No PDF documents found in the database.");
    await mongoose.connection.close();
    return;
  }

  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });

  const manifest = [];
  let successCount = 0;
  let failCount = 0;

  console.log(`Found ${pdfDocs.length} PDF document(s). Downloading to:\n${OUTPUT_DIR}\n`);

  for (const doc of pdfDocs) {
    const s3Key = extractS3Key(doc.file);
    if (!s3Key) {
      console.warn(`⚠ Skipped (invalid S3 key): ${doc.title}`);
      failCount += 1;
      continue;
    }

    const localName = sanitizeFilename(s3Key);
    const destPath = uniquePath(OUTPUT_DIR, localName);

    try {
      await downloadFromS3(s3Key, destPath);
      successCount += 1;

      const entry = {
        id: String(doc._id),
        title: doc.title,
        category: doc.catagory,
        s3Key,
        localFile: path.basename(destPath),
        localPath: destPath,
      };

      manifest.push(entry);
      console.log(`✅ ${doc.title}`);
      console.log(`   → ${path.basename(destPath)}`);
    } catch (error) {
      failCount += 1;
      console.error(`❌ Failed: ${doc.title}`);
      console.error(`   S3 key: ${s3Key}`);
      console.error(`   ${error.message}`);
    }
  }

  await fs.promises.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");

  console.log("\n--- Summary ---");
  console.log(`Downloaded: ${successCount}`);
  console.log(`Failed:     ${failCount}`);
  console.log(`Manifest:   ${MANIFEST_PATH}`);
  console.log(
    "\nNext: add legacy URL mappings in src/modules/runtimePdfViewer/config/runtimePdfMap.js",
  );

  await mongoose.connection.close();
};

main().catch(async (error) => {
  console.error("Script failed:", error);
  try {
    await mongoose.connection.close();
  } catch {
    // ignore
  }
  process.exit(1);
});
