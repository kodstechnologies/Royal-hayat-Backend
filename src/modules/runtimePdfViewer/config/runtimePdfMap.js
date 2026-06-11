import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "../../../../storage/runtime-uploads");

const f = (filename) => path.join(uploadsDir, filename);

/**
 * Legacy public path (decoded, relative to mount point) → local PDF file.
 * Keys match old royalehayat.com QR / Runtime URL filenames exactly.
 */
export const RUNTIME_PDF_MAP = {
  // /Runtime/uploads/
  "AlLiwan_ menu_2021.pdf": f("AlLiwan_menu_2021.pdf"),
  "Birth plan booklet_27May2021_final.pdf": f("Birth_plan_booklet_27May2021_final.pdf"),
  "Birthing-Packages-for-Royale-Orchid-and-Orchid-Patients.pdf":
    f("Birthing-Packages-for-Royale-Orchid-and-Orchid-Patients.pdf"),
  "Birthing-Packages-for-Visiting-Inhouse-Physicians-for-insurance-patients.pdf":
    f("Birthing-Packages-for-Visiting-Inhouse-Physicians-for-insurance-patients.pdf"),
  "Birthing-Packages-for-Visiting-Inhouse-Physicians-for-noninsurance-patients.pdf":
    f("Birthing-Packages-for-Visiting-Inhouse-Physicians-for-noninsurance-patients.pdf"),
  "BreastCancerAwarenessHandbookAR.pdf": f("BreastCancerAwarenessHandbookAR.pdf"),
  "BreastCancerAwarenessHandbookEN.pdf": f("BreastCancerAwarenessHandbookEN.pdf"),
  "certificatSe_of_completion_htmlS.pdf": f("certificatSe_of_completion_htmlS.pdf"),
  "Dental-Post-Procedure-Care-ar1.pdf": f("Dental-Post-Procedure-Care-ar1.pdf"),
  "Dental-Post-Procedure-Care-en.pdf": f("Dental-Post-Procedure-Care-en.pdf"),
  "Dental-Post-Procedure-Care.pdf": f("Dental-Post-Procedure-Care.pdf"),
  "Elements_spa menu_arb.pdf": f("Elements_spa_menu_arb.pdf"),
  "Elements_spa menu_Eng.pdf": f("Elements_spa_menu_Eng.pdf"),
  "ghtettet.pdf": f("ghtettet.pdf"),
  "Healthy_menu.pdf": f("Healthy_menu.pdf"),
  "home_health_mini_book_services_2025.pdf": f("home_health_mini_book_services_2025.pdf"),
  "In-Room-Events-Packages.pdf": f("In-Room-Events-Packages.pdf"),
  "Lost-and-found-guide.pdf": f("Lost-and-found-guide.pdf"),
  "New-Halls-Events-Packages.pdf": f("New-Halls-Events-Packages.pdf"),
  "New-Home-Care-Packages.pdf": f("New-Home-Care-Packages.pdf"),
  "PATIENT INFORMATION LEAFLET for IV Iron Therapy_V1.1.pdf":
    f("PATIENT_INFORMATION_LEAFLET_for_IV_Iron_Therapy_V1.1.pdf"),
  "Post-Surgery-Packages.pdf": f("Post-Surgery-Packages.pdf"),
  "RHH_A La Carte menu_Mar 2021.pdf": f("RHH_A_La_Carte_menu_Mar_2021.pdf"),
  "RHH_Celebrating my Birth Support.pdf": f("RHH_Celebrating_my_Birth_Support.pdf"),
  "RHH_Discharge Instructions for Postpartum Patients_QR coded_Mar2021.pdf":
    f("RHH_Discharge_Instructions_for_Postpartum_Patients_QR_coded_Mar2021.pdf"),
  "RHH_Discharge Instructions for Postpartum Patients.pdf":
    f("RHH_Discharge_Instructions_for_Postpartum_Patients.pdf"),
  "RHH_ebook_30_Jan_2023.pdf": f("RHH_ebook_30_Jan_2023.pdf"),
  "rhh_vbac.pdf": f("rhh_vbac.pdf"),
  "RHH-My-birth-plan-2021.pdf": f("RHH-My-birth-plan-2021.pdf"),
  "Royale Hayat Dental_Pricelist_3 Oct 2022.pdf":
    f("Royale_Hayat_Dental_Pricelist_3_Oct_2022.pdf"),
  "RoyaleHayatDentalPricelist.pdf": f("RoyaleHayatDentalPricelist.pdf"),
  "SPA_MENU_AR.pdf": f("SPA_MENU_AR.pdf"),
  "The-Cafe-Menu-2022.pdf": f("The-Cafe-Menu-2022.pdf"),
  "world_patient_safety_day_invitation.pdf": f("world_patient_safety_day_invitation.pdf"),

  // /Runtime/uploads/files/
  "files/Kids-menu-inside.pdf": f("Kids-menu-inside.pdf"),
  "files/Royale-Home-Health-Cosmetic-Packages.pdf":
    f("Royale-Home-Health-Cosmetic-Packages.pdf"),
  "files/Royale-Home-Health-Dental-Packages.pdf":
    f("Royale-Home-Health-Dental-Packages.pdf"),
  "files/Royale-Home-Health-Geriatric-Care-Packages.pdf":
    f("Royale-Home-Health-Geriatric-Care-Packages.pdf"),
  "files/Royale-Home-Health-IVF-Packages.pdf":
    f("Royale-Home-Health-IVF-Packages.pdf"),
  "files/Royale-Home-Health-Mother-and-baby-care-Packages.pdf":
    f("Royale-Home-Health-Mother-and-baby-care-Packages.pdf"),
  "files/Royale-Home-Health-New-Home-Care-Packages.pdf":
    f("Royale-Home-Health-New-Home-Care-Packages.pdf"),
  "files/Royale-Home-Health-Physiotherapy-Packages.pdf":
    f("Royale-Home-Health-Physiotherapy-Packages.pdf"),
  "files/Royale-Home-Health-Post-Circumcision-Packages.pdf":
    f("Royale-Home-Health-Post-Circumcision-Packages.pdf"),
  "files/Royale-Home-Health-Post-Surgery-Packages.pdf":
    f("Royale-Home-Health-Post-Surgery-Packages.pdf"),

  // /Runtime/uploads/Hospitality/
  "Hospitality/RHH_Hospitality-Ebook.pdf": f("RHH_Hospitality-Ebook.pdf"),

  // /Runtime/uploads/Suites/
  "Suites/RHH-Table-Measurements-in-Suites-and-Halls-Final.pdf":
    f("RHH-Table-Measurements-in-Suites-and-Halls-Final.pdf"),

  // /Runtime/uploads/UCC-PDF/
  "UCC-PDF/RHH-Umbilical-cord-care.pdf": f("RHH-Umbilical-cord-care.pdf"),
};

/** Legacy wp-content/uploads paths (relative to /wp-content/uploads/) */
export const WP_CONTENT_PDF_MAP = {
  "2026/01/NIGHT_MENU_QR_AR.pdf": f("NIGHT_MENU_QR_AR.pdf"),
  "2026/01/NIGHT_MENU_QR_EN.pdf": f("NIGHT_MENU_QR_EN.pdf"),
  "2026/01/NIGHT_MENU_QR_AR1.pdf": f("NIGHT_MENU_QR_AR1.pdf"),
  "2026/04/Al_Liwan_QR_Food_Menu.pdf": f("Al_Liwan_QR_Food_Menu.pdf"),
  "2026/04/RHH_5th_Floor_Food_Menu.pdf": f("RHH_5th_Floor_Food_Menu.pdf"),
  "2026/04/RHH_QR_Food_Menu.pdf": f("RHH_QR_Food_Menu.pdf"),
  "2026/04/Allergy_Patch_Testing_Quick_Guide_2026.pdf":
    f("Allergy_Patch_Testing_Quick_Guide_2026.pdf"),
  "2026/04/Patient_Instructions_for_Allergy_Skin_Prick_Test_2026.pdf":
    f("Patient_Instructions_for_Allergy_Skin_Prick_Test_2026.pdf"),
  "2026/05/AL_LIWAN_MENU_May_2026.pdf": f("AL_LIWAN_MENU_May_2026.pdf"),
  "2026/03/Ask_Me_Flyers_March_2026.pdf": f("Ask_Me_Flyers_March_2026.pdf"),
  "2026/03/Clinical_Awareness_Flyers_March_2026.pdf":
    f("Clinical_Awareness_Flyers_March_2026.pdf"),
  "2025/12/RHH_QR_Food_Menu_Dec_2025.pdf": f("RHH_QR_Food_Menu_Dec_2025.pdf"),
  "2025/12/5th_FLOOR_QR_Food_Menu_Dec_2025.pdf": f("5th_FLOOR_QR_Food_Menu_Dec_2025.pdf"),
  "2025/11/5th_FLOOR_QR_Food_Menu.pdf": f("5th_FLOOR_QR_Food_Menu.pdf"),
  "2026/06/5th_Floor_Cafe_Menu.pdf": f("5th_Floor_Cafe_Menu.pdf"),
  "2026/06/ALa_Carte_Menu.pdf": f("ALa_Carte_Menu.pdf"),
  "2026/06/Ask_Me_Flyers_June_2026.pdf": f("Ask_Me_Flyers_June_2026.pdf"),
  "2026/06/Clinical_Awareness_Flyers_June_2026.pdf":
    f("Clinical_Awareness_Flyers_June_2026.pdf"),
};

export function resolveRuntimePdfPath(relativePath) {
  if (!relativePath) return null;
  const decoded = decodeURIComponent(relativePath).trim().replace(/^\/+/, "");
  return RUNTIME_PDF_MAP[decoded] ?? null;
}

export function resolveWpContentPdfPath(relativePath) {
  if (!relativePath) return null;
  const decoded = decodeURIComponent(relativePath).trim().replace(/^\/+/, "");
  return WP_CONTENT_PDF_MAP[decoded] ?? null;
}

export function listRuntimePdfs() {
  const runtime = Object.entries(RUNTIME_PDF_MAP).map(([publicPath, filePath]) => ({
    mount: "/Runtime/uploads",
    publicPath,
    filePath,
    url: `/Runtime/uploads/${publicPath.split("/").map(encodeURIComponent).join("/")}`,
  }));

  const wpContent = Object.entries(WP_CONTENT_PDF_MAP).map(([publicPath, filePath]) => ({
    mount: "/wp-content/uploads",
    publicPath,
    filePath,
    url: `/wp-content/uploads/${publicPath.split("/").map(encodeURIComponent).join("/")}`,
  }));

  return [...runtime, ...wpContent];
}
