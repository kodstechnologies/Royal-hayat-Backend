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

const renderAttachmentCell = (hasAttachment, fileUrl, hasEmailAttachments) => {
  if (!hasAttachment) return "N/A";

  if (hasEmailAttachments) {
    return "Included as email attachment";
  }

  if (fileUrl) {
    return `<a href="${escapeHtml(fileUrl)}" target="_blank" rel="noopener noreferrer" style="color: #7f1d1d; font-weight: 600;">View file</a>`;
  }

  return "N/A";
};

const buildRequestedDocumentType = (request) => {
  if (request.specificAuthorization === "specific documents") {
    const types = Array.isArray(request.specificDocumentTypes)
      ? request.specificDocumentTypes.join(", ")
      : "";

    if (!types) return "specific documents";

    const other = request.specificDocumentsOther?.trim();
    return other && request.specificDocumentTypes?.includes("Others")
      ? `specific documents: ${types} — ${other}`
      : `specific documents: ${types}`;
  }

  return request.specificAuthorization || "N/A";
};

const buildPatientInformationRows = (request, attachmentUrls, hasEmailAttachments) => {
  const rows = [
    renderRow("Patient Name", escapeHtml(request.patientFullName)),
    renderRow("Patient File No.", escapeHtml(request.patientFileNo)),
    renderRow("Date of Birth", formatDate(request.dateOfBirth)),
    renderRow(
      "Identification Type",
      request.validIdentification === "passportORGovtId"
        ? "Passport / Government ID"
        : "Civil ID",
    ),
  ];

  if (request.validIdentification === "civilId") {
    rows.push(
      renderRow("Civil ID Number", escapeHtml(request.civilIdNumber)),
      renderRow(
        "Civil ID Attachment",
        renderAttachmentCell(
          Boolean(request.civilIdAttachment),
          attachmentUrls.civilIdAttachment,
          hasEmailAttachments,
        ),
      ),
    );
  }

  if (request.validIdentification === "passportORGovtId") {
    rows.push(
      renderRow(
        "Passport / Government ID Attachment",
        renderAttachmentCell(
          Boolean(request.passportOrGovernmentIdAttachment),
          attachmentUrls.passportOrGovernmentIdAttachment,
          hasEmailAttachments,
        ),
      ),
    );
  }

  return rows.join("");
};

const buildMedicalRecordRequestRows = (request) => {
  const isDischargeSummary =
    request.specificAuthorization === "Discharge Summary";
  const specialRequest = request.specialRequest?.trim() || "—";

  const rows = [
    renderRow(
      "Requested Document Type",
      escapeHtml(buildRequestedDocumentType(request)),
    ),
  ];

  if (isDischargeSummary) {
    rows.push(
      renderRow(
        "Discharge Date",
        formatDate(request.specificAuthorizationDate),
      ),
    );
  } else {
    rows.push(
      renderRow("Date From", formatDate(request.specificFromDate)),
      renderRow("Date To", formatDate(request.specificToDate)),
    );
  }

  rows.push(renderRow("Special Request", escapeHtml(specialRequest)));

  return rows.join("");
};

const buildRequesterRows = (request, attachmentUrls, hasEmailAttachments) => {
  const rows = [
    renderRow("Requested By", escapeHtml(request.requestedBy)),
  ];

  if (request.requestedBy === "Legal Representative") {
    rows.push(
      renderRow(
        "Legal Representative Full Name",
        escapeHtml(request.legalRepresentativeFullName),
      ),
      renderRow(
        "Relationship with Patient",
        escapeHtml(request.relationshipWithPatient),
      ),
      renderRow(
        "Valid Proof of Representation",
        renderAttachmentCell(
          Boolean(request.validProof),
          attachmentUrls.validProof,
          hasEmailAttachments,
        ),
      ),
    );
  }

  if (request.requestedBy === "Patient") {
    rows.push(
      renderRow(
        "Patient Name Confirmation",
        escapeHtml(request.patientNameConfirmation),
      ),
    );
  }

  const signatureName =
    request.requestedBy === "Legal Representative"
      ? request.legalRepresentativeFullName
      : request.patientNameConfirmation || request.patientFullName;

  rows.push(
    renderRow("Electronic Signature", escapeHtml(signatureName)),
  );

  return rows.join("");
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

const buildEmailBody = (request, attachmentUrls = {}, hasEmailAttachments = false) => {
  const purpose =
    request.purposeOfDisclosure === "Others" && request.otherPurpose
      ? `${request.purposeOfDisclosure} — ${request.otherPurpose}`
      : request.purposeOfDisclosure;

  const mrrId = escapeHtml(request.mrrId || "N/A");

  return `
    <div style="margin-bottom: 28px; padding-bottom: 24px; border-bottom: 2px solid #fecaca;">
      <h1 style="margin: 0; font-size: 20px; line-height: 1.4; color: #0f172a; font-weight: 700;">
        ${EMAIL_SUBJECT}
      </h1>
      <p style="margin: 8px 0 0; font-size: 13px; color: #64748b;">MRR ID: <strong>${mrrId}</strong></p>
    </div>

    ${sectionShell(
      "Patient Information",
      buildPatientInformationRows(request, attachmentUrls, hasEmailAttachments),
    )}

    ${sectionShell(
      "Medical Record Request Information",
      buildMedicalRecordRequestRows(request),
    )}

    ${sectionShell(
      "Recipient Information",
      `
        ${renderRow("Recipient Name", escapeHtml(request.recipientName))}
        ${renderRow("Recipient Email Address", escapeHtml(request.recipientEmailAddress))}
        ${renderRow("Recipient Contact Number", escapeHtml(request.recipientContactNumber))}
      `,
    )}

    ${sectionShell(
      "Purpose of Disclosure",
      renderRow("Purpose of Disclosure", escapeHtml(purpose)),
    )}

    ${sectionShell(
      "Authorization Statement",
      renderRow("Authorization", AUTHORIZATION_STATEMENT),
    )}

    ${sectionShell(
      "Requester Information",
      buildRequesterRows(request, attachmentUrls, hasEmailAttachments),
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

export const medicalRecordRequestEmailTemplate = (
  request,
  { attachmentUrls = {}, hasEmailAttachments = false } = {},
) => {
  const body = buildEmailBody(request, attachmentUrls, hasEmailAttachments);
  const mrrId = escapeHtml(request.mrrId || "N/A");

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
                ${buildConfidentialityFooter(mrrId)}
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
