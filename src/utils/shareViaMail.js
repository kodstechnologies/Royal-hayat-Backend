// utils/shareViaMail.js

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
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
    <td style="padding: 10px 16px; width: 38%; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
      ${label}
    </td>
    <td style="padding: 10px 16px; font-size: 14px; color: #0f172a; font-weight: 500; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
      ${value}
    </td>
  </tr>
`;

export const medicalRecordRequestEmailTemplate = (
  request,
  passportFileUrl
) => {
  const mrrId = escapeHtml(request.mrrId || "N/A");
  const requestedDate = formatDate(request.createdAt);
  const dateOfBirth = formatDate(request.dateOfBirth);
  const specificDateOfService = formatDate(request.specificDateOfService);

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Medical Record Request</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
            <tr>
              <td style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); padding: 28px 32px;">
                <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.75);">
                  Royale Hayat Hospital
                </p>
                <h1 style="margin: 0; font-size: 24px; line-height: 1.3; color: #ffffff; font-weight: 700;">
                  Medical Record Request
                </h1>
                <p style="margin: 10px 0 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.88);">
                  A medical record request has been shared with you. Please review the details below.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 24px 32px 8px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px;">
                  <tr>
                    <td style="padding: 16px 18px; width: 50%;">
                      <p style="margin: 0 0 4px; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: #991b1b;">
                        MRR ID
                      </p>
                      <p style="margin: 0; font-size: 18px; font-weight: 700; color: #7f1d1d; font-family: 'Courier New', Courier, monospace;">
                        ${mrrId}
                      </p>
                    </td>
                    <td style="padding: 16px 18px; width: 50%; border-left: 1px solid #fecaca;">
                      <p style="margin: 0 0 4px; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: #991b1b;">
                        Requested Date
                      </p>
                      <p style="margin: 0; font-size: 16px; font-weight: 700; color: #7f1d1d;">
                        ${requestedDate}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 16px 32px 8px;">
                <h2 style="margin: 0 0 12px; font-size: 15px; color: #0f172a; font-weight: 700;">
                  Patient Information
                </h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                  ${renderRow("Patient Full Name", escapeHtml(request.patientFullName))}
                  ${renderRow("Civil ID", escapeHtml(request.civilId))}
                  ${renderRow("Patient File No.", escapeHtml(request.patientFileNo))}
                  ${renderRow("Date of Birth", dateOfBirth)}
                  ${renderRow(
                    "Passport / Government ID",
                    passportFileUrl
                      ? `<a href="${passportFileUrl}" target="_blank" style="display: inline-block; padding: 8px 14px; background-color: #7f1d1d; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600;">View Attached File</a>`
                      : "N/A"
                  )}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 8px 32px;">
                <h2 style="margin: 0 0 12px; font-size: 15px; color: #0f172a; font-weight: 700;">
                  Request Details
                </h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                  ${renderRow("Specific Authorization", escapeHtml(request.specificAuthorization))}
                  ${renderRow("Specific Date of Service", specificDateOfService)}
                  ${renderRow("Requested By", escapeHtml(request.requestedBy))}
                  ${renderRow("Patient Name Confirmation", escapeHtml(request.patientNameConfirmation))}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 8px 32px 24px;">
                <h2 style="margin: 0 0 12px; font-size: 15px; color: #0f172a; font-weight: 700;">
                  Recipient Information
                </h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                  ${renderRow("Recipient Name", escapeHtml(request.recipientName))}
                  ${renderRow("Recipient Email Address", escapeHtml(request.recipientEmailAddress))}
                  ${renderRow("Recipient Contact Number", escapeHtml(request.recipientContactNumber))}
                  ${renderRow("Purpose of Disclosure", escapeHtml(request.purposeOfDisclosure))}
                  ${renderRow("Other Purpose", escapeHtml(request.otherPurpose))}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 18px 32px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #64748b; text-align: center;">
                  This email was sent from Royale Hayat Hospital regarding medical record request
                  <strong style="color: #7f1d1d;">${mrrId}</strong>.
                  Please handle this information confidentially.
                </p>
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
