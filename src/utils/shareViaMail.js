const EMAIL_SUBJECT =
  "New Authorization for the Disclosure of Patient Health Information via Email Upon Patient Request";

const AUTHORIZATION_STATEMENT =
  "Patient authorizes the hospital to send medical records electronically through email.";

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

const buildRequestFields = (request) => {
  const isDischargeSummary =
    request.specificAuthorization === "Discharge Summary";
  const dateFrom = isDischargeSummary
    ? formatDate(request.specificAuthorizationDate)
    : formatDate(request.specificFromDate);
  const dateTo = isDischargeSummary
    ? "—"
    : formatDate(request.specificToDate);
  const specialRequest = request.specialRequest?.trim() || "—";

  const purpose =
    request.purposeOfDisclosure === "Others" && request.otherPurpose
      ? `${request.purposeOfDisclosure} — ${request.otherPurpose}`
      : request.purposeOfDisclosure;

  const isPassportId = request.validIdentification === "passportORGovtId";
  const documentType = isPassportId ? "Passport / Government ID" : "Civil ID";
  const civilId = request.civilIdNumber || request.civilId || "N/A";

  let requestedDocumentType = request.specificAuthorization || "N/A";
  if (request.specificAuthorization === "specific documents") {
    const types = Array.isArray(request.specificDocumentTypes)
      ? request.specificDocumentTypes.join(", ")
      : "";
    requestedDocumentType = types
      ? `specific documents: ${types}${request.specificDocumentsOther ? ` — ${request.specificDocumentsOther}` : ""}`
      : "specific documents";
  }

  const signatureName =
    request.requestedBy === "Legal Representative"
      ? request.legalRepresentativeFullName
      : request.patientNameConfirmation || request.patientFullName || "N/A";

  return {
    patientName: escapeHtml(request.patientFullName),
    documentType,
    civilId: escapeHtml(civilId),
    requestedDocumentType: escapeHtml(requestedDocumentType),
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

const sectionShell = (title, tableRows) => `
  <div style="margin-bottom: 24px;">
    <h2 style="margin: 0 0 12px; font-size: 16px; color: #7f1d1d; font-weight: 700;">
      ${title}
    </h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      ${tableRows}
    </table>
  </div>
`;

const buildEmailBody = (fields, passportFileUrl) => {
  const passportCell = passportFileUrl
    ? `<a href="${passportFileUrl}" target="_blank" style="color: #7f1d1d; font-weight: 600;">View attached file</a>`
    : "N/A";

  return `
    <div style="margin-bottom: 28px; padding-bottom: 24px; border-bottom: 2px solid #fecaca;">
      <h1 style="margin: 0; font-size: 20px; line-height: 1.4; color: #0f172a; font-weight: 700;">
        ${EMAIL_SUBJECT}
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
      renderRow("Authorization", AUTHORIZATION_STATEMENT),
    )}

    ${sectionShell(
      "Electronic Signature",
      renderRow("Signature Name", fields.signatureName),
    )}
  `;
};

const buildConfidentialityFooter = (mrrId) => `
  <div>
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
`;

export const resolveEmailSubject = () => EMAIL_SUBJECT;

export const medicalRecordRequestEmailTemplate = (request, passportFileUrl) => {
  const fields = buildRequestFields(request);
  const body = buildEmailBody(fields, passportFileUrl);

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
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding: 22px 32px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                ${buildConfidentialityFooter(fields.mrrId)}
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
