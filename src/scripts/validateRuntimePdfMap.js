import fs from "fs";
import {
  RUNTIME_PDF_MAP,
  WP_CONTENT_PDF_MAP,
} from "../modules/runtimePdfViewer/config/runtimePdfMap.js";

const checkMap = (label, map) => {
  let ok = 0;
  let missing = 0;

  console.log(`\n${label}`);
  for (const [publicPath, filePath] of Object.entries(map)) {
    if (fs.existsSync(filePath)) {
      ok += 1;
    } else {
      missing += 1;
      console.log(`  MISSING FILE: ${publicPath}`);
      console.log(`    expected: ${filePath}`);
    }
  }

  console.log(`  OK: ${ok} | Missing files: ${missing}`);
  return missing;
};

const runtimeMissing = checkMap("Runtime/uploads", RUNTIME_PDF_MAP);
const wpMissing = checkMap("wp-content/uploads", WP_CONTENT_PDF_MAP);

if (runtimeMissing + wpMissing > 0) {
  console.log("\nUpload missing PDFs to storage/runtime-uploads/ then re-run:");
  console.log("  npm run download:runtime-pdfs");
  process.exit(1);
}

console.log("\nAll legacy PDF mappings have files on disk.");
