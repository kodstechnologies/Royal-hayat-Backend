const SUBJECT_EN =
  "New Authorization for the Disclosure of Patient Health Information via Email Upon Patient Request";

const SUBJECT_AR =
  "تفويض جديد للإفصاح عن المعلومات الصحية للمريض عبر البريد الإلكتروني بناءً على طلب المريض";

const AUTHORIZATION_EN =
  "Patient authorizes the hospital to send medical records electronically through email.";

const AUTHORIZATION_AR =
  "أفوض مستشفى رويال حياة بالإفصاح عن معلوماتي الصحية وإرسال السجلات الطبية إلكترونياً إلى المستلم المحدد في هذا الطلب.";

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const escapeHtml = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const renderRow = (label, value) => `
  <tr>
    <td style="padding: 10px 16px; width: 42%; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
      ${label}
    </td>
    <td style="padding: 10px 16px; font-size: 14px; color: #0f172a; font-weight: 500; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
      ${value}
    </td>
  </tr>
`;

const renderArabicRow = (labelAr, value) => `
  <tr>
    <td style="padding: 10px 16px; width: 42%; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9; vertical-align: top; text-align: right; direction: rtl;">
      ${labelAr}
    </td>
    <td style="padding: 10px 16px; font-size: 14px; color: #0f172a; font-weight: 500; border-bottom: 1px solid #f1f5f9; vertical-align: top; text-align: right; direction: rtl;">
      ${value}
    </td>
  </tr>
`;

const buildRequestFields = (request) => {
  const serviceDate = request.specificDateOfService || request.createdAt;
  const dateFrom = formatDate(serviceDate);
  const dateTo = formatDate(serviceDate);
  const specialRequest =
    request.otherPurpose?.trim() ||
    (request.purposeOfDisclosure === "Others" ? "N/A" : "—");

  const purpose =
    request.purposeOfDisclosure === "Others" && request.otherPurpose
      ? `${request.purposeOfDisclosure} — ${request.otherPurpose}`
      : request.purposeOfDisclosure;

  const signatureName =
    request.patientNameConfirmation ||
    request.patientFullName ||
    "N/A";

  return {
    patientName: escapeHtml(request.patientFullName),
    documentType: "Civil ID",
    documentTypeAr: "البطاقة المدنية",
    civilId: escapeHtml(request.civilId),
    requestedDocumentType: escapeHtml(request.specificAuthorization),
    dateFrom,
    dateTo,
    specialRequest: escapeHtml(specialRequest),
    recipientName: escapeHtml(request.recipientName),
    recipientEmail: escapeHtml(request.recipientEmailAddress),
    recipientPhone: escapeHtml(request.recipientContactNumber),
    purpose: escapeHtml(purpose),
    signatureName: escapeHtml(signatureName),
    mrrId: escapeHtml(request.mrrId || "N/A"),
  };
};

const sectionShell = (title, tableRows, rtl = false) => `
  <div style="margin-bottom: 24px;">
    <h2 style="margin: 0 0 12px; font-size: 16px; color: #7f1d1d; font-weight: 700; ${rtl ? "text-align: right; direction: rtl;" : ""}">
      ${title}
    </h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      ${tableRows}
    </table>
  </div>
`;

const buildEnglishSections = (fields, passportFileUrl) => {
  const passportCell = passportFileUrl
    ? `<a href="${passportFileUrl}" target="_blank" style="color: #7f1d1d; font-weight: 600;">View attached file</a>`
    : "N/A";

  return `
    <div style="margin-bottom: 28px; padding-bottom: 24px; border-bottom: 2px solid #fecaca;">
      <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: #991b1b;">English</p>
      <h1 style="margin: 0; font-size: 20px; line-height: 1.4; color: #0f172a; font-weight: 700;">
        ${SUBJECT_EN}
      </h1>
      <p style="margin: 8px 0 0; font-size: 13px; color: #64748b;">MRR ID: <strong>${fields.mrrId}</strong></p>
    </div>

    ${sectionShell(
      "Patient Information",
      `
        ${renderRow("Patient Name", fields.patientName)}
        ${renderRow("Document Type", fields.documentType)}
        ${renderRow("Civil ID Number", fields.civilId)}
        ${renderRow("Passport / Government ID", passportCell)}
      `,
    )}

    ${sectionShell(
      "Medical Record Request Information",
      `
        ${renderRow("Requested Document Type", fields.requestedDocumentType)}
        ${renderRow("Date From", fields.dateFrom)}
        ${renderRow("Date To", fields.dateTo)}
        ${renderRow("Special Request", fields.specialRequest)}
      `,
    )}

    ${sectionShell(
      "Recipient Information",
      `
        ${renderRow("Recipient Name", fields.recipientName)}
        ${renderRow("Recipient Email Address", fields.recipientEmail)}
        ${renderRow("Recipient Contact Number", fields.recipientPhone)}
      `,
    )}

    ${sectionShell(
      "Purpose of Disclosure",
      renderRow("Purpose of Disclosure", fields.purpose),
    )}

    ${sectionShell(
      "Authorization Statement",
      renderRow("Authorization", AUTHORIZATION_EN),
    )}

    ${sectionShell(
      "Electronic Signature",
      renderRow("Signature Name", fields.signatureName),
    )}
  `;
};

const buildArabicSections = (fields, passportFileUrl) => {
  const passportCell = passportFileUrl
    ? `<a href="${passportFileUrl}" target="_blank" style="color: #7f1d1d; font-weight: 600;">عرض الملف المرفق</a>`
    : "غير متوفر";

  return `
  <div style="margin-bottom: 28px; padding-bottom: 24px; border-bottom: 2px solid #fecaca; direction: rtl; text-align: right;">
    <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: #991b1b;">العربية</p>
    <h1 style="margin: 0; font-size: 20px; line-height: 1.6; color: #0f172a; font-weight: 700;">
      ${SUBJECT_AR}
    </h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #64748b; direction: ltr; text-align: right;">رقم الطلب: <strong>${fields.mrrId}</strong></p>
  </div>

  ${sectionShell(
    "بيانات المريض",
    `
      ${renderArabicRow("اسم المريض", fields.patientName)}
      ${renderArabicRow("نوع المستند", fields.documentTypeAr)}
      ${renderArabicRow("الرقم المدني", fields.civilId)}
      ${renderArabicRow("جواز السفر / الهوية الحكومية", passportCell)}
    `,
    true,
  )}

  ${sectionShell(
    "معلومات طلب السجل الطبي",
    `
      ${renderArabicRow("نوع المستند المطلوب", fields.requestedDocumentType)}
      ${renderArabicRow("من تاريخ", fields.dateFrom)}
      ${renderArabicRow("إلى تاريخ", fields.dateTo)}
      ${renderArabicRow("طلب خاص", fields.specialRequest)}
    `,
    true,
  )}

  ${sectionShell(
    "بيانات المستلم",
    `
      ${renderArabicRow("اسم المستلم", fields.recipientName)}
      ${renderArabicRow("البريد الإلكتروني للمستلم", fields.recipientEmail)}
      ${renderArabicRow("رقم هاتف المستلم", fields.recipientPhone)}
    `,
    true,
  )}

  ${sectionShell(
    "الغرض من الإفصاح",
    renderArabicRow("الغرض من الإفصاح", fields.purpose),
    true,
  )}

  ${sectionShell(
    "تفويض المريض",
    renderArabicRow("التفويض", AUTHORIZATION_AR),
    true,
  )}

  ${sectionShell(
    "التوقيع الإلكتروني",
    renderArabicRow("الاسم الموقع إلكترونياً", fields.signatureName),
    true,
  )}
`;
};

const buildConfidentialityFooter = (includeEn, includeAr, mrrId) => {
  const blocks = [];

  if (includeEn) {
    blocks.push(`
      <div style="margin-bottom: ${includeAr ? "20px" : "0"};">
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; color: #7f1d1d; text-transform: uppercase;">
          CONFIDENTIALITY NOTICE
        </p>
        <p style="margin: 0; font-size: 12px; line-height: 1.65; color: #64748b;">
          This communication contains protected health information intended only for the designated recipient.
        </p>
        <p style="margin: 10px 0 0; font-size: 11px; color: #94a3b8;">
          MRR ID: <strong style="color: #7f1d1d;">${mrrId}</strong>
        </p>
      </div>
    `);
  }

  if (includeAr) {
    blocks.push(`
      <div style="direction: rtl; text-align: right;">
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; color: #7f1d1d;">
          إشعار السرية
        </p>
        <p style="margin: 0; font-size: 12px; line-height: 1.75; color: #64748b;">
          تحتوي هذه الرسالة على معلومات صحية سرية ومخصصة فقط للمستلم المحدد
        </p>
        ${!includeEn ? `<p style="margin: 10px 0 0; font-size: 11px; color: #94a3b8; direction: ltr; text-align: right;">رقم الطلب: <strong style="color: #7f1d1d;">${mrrId}</strong></p>` : ""}
      </div>
    `);
  }

  return blocks.join("");
};

export const resolveEmailSubject = (languages = ["en"]) => {
  const includeEn = languages.includes("en");
  const includeAr = languages.includes("ar");

  if (includeEn && includeAr) {
    return SUBJECT_EN;
  }
  if (includeAr) {
    return SUBJECT_AR;
  }
  return SUBJECT_EN;
};

export const medicalRecordRequestEmailTemplate = (
  request,
  passportFileUrl,
  languages = ["en"],
) => {
  const normalizedLanguages = Array.isArray(languages) ? languages : ["en"];
  const includeEn = normalizedLanguages.includes("en");
  const includeAr = normalizedLanguages.includes("ar");

  const fields = buildRequestFields(request);

  const bodyParts = [];
  if (includeEn) bodyParts.push(buildEnglishSections(fields, passportFileUrl));
  if (includeAr) bodyParts.push(buildArabicSections(fields, passportFileUrl));

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Medical Record Authorization</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 720px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
            <tr>
              <td style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); padding: 24px 32px;">
                <p style="margin: 0 0 6px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.75);">
                  Royale Hayat Hospital
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.9);">
                  Patient health information disclosure authorization
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 28px 32px 32px;">
                ${bodyParts.join('<div style="height: 28px;"></div>')}
              </td>
            </tr>
            <tr>
              <td style="padding: 22px 32px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                ${buildConfidentialityFooter(includeEn, includeAr, fields.mrrId)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
};
