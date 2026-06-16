import { resolveRuntimePdfPath } from "../modules/runtimePdfViewer/config/runtimePdfMap.js";

const candidates = [
  "Birth plan booklet_27May2021_final.pdf",
  "Birth_plan_booklet_27May2021_final.pdf",
  "Birth_plan_booklet_27May2021_final_1.pdf",
];

for (const candidate of candidates) {
  const resolved = resolveRuntimePdfPath(candidate);
  console.log(`${candidate} -> ${resolved ?? "NOT FOUND"}`);
}
