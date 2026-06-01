import nodemailer from "nodemailer";

const DEFAULT_RECIPIENTS =
  "madhi333jp@gmail.com,madhi333jpg@gmail.com";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
    <td style="padding: 10px 16px; width: 36%; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
      ${label}
    </td>
    <td style="padding: 10px 16px; font-size: 14px; color: #0f172a; font-weight: 500; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
      ${value}
    </td>
  </tr>
`;

export const internationalPatientEnquiryNotificationEmailTemplate = (enquiry) => {
  const submittedAt = formatDateTime(enquiry.createdAt);
  const fullName = `${enquiry.firstName || ""} ${enquiry.lastName || ""}`.trim();

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New International Patient Enquiry</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
            <tr>
              <td style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); padding: 24px 32px;">
                <p style="margin: 0 0 6px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.75);">
                  Royale Hayat Hospital
                </p>
                <h1 style="margin: 0; font-size: 22px; color: #ffffff; font-weight: 700;">
                  New International Patient Enquiry
                </h1>
                <p style="margin: 10px 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">
                  Submitted from the International Patient page
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 32px 8px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px;">
                  <tr>
                    <td style="padding: 14px 18px;">
                      <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; color: #991b1b;">Patient</p>
                      <p style="margin: 0; font-size: 16px; font-weight: 700; color: #7f1d1d;">${escapeHtml(fullName)}</p>
                    </td>
                    <td style="padding: 14px 18px; border-left: 1px solid #fecaca;">
                      <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; color: #991b1b;">Submitted</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #7f1d1d;">${submittedAt}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 32px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                  ${renderRow("First Name", escapeHtml(enquiry.firstName))}
                  ${renderRow("Last Name", escapeHtml(enquiry.lastName))}
                  ${renderRow("Email", escapeHtml(enquiry.email))}
                  ${renderRow("Phone / Mobile", escapeHtml(enquiry.phone))}
                  ${renderRow("Country", escapeHtml(enquiry.country))}
                  ${renderRow("Address", escapeHtml(enquiry.address))}
                  ${renderRow("Comments", escapeHtml(enquiry.comments).replace(/\n/g, "<br />"))}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 32px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #64748b; text-align: center;">
                  You can reply directly to this email to reach the patient.
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

export const sendInternationalPatientEnquiryNotificationEmail = async (enquiry) => {
  const recipients = (
    process.env.INTERNATIONAL_PATIENT_ENQUIRY_NOTIFICATION_EMAILS ||
    DEFAULT_RECIPIENTS
  )
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    throw new Error(
      "No international patient enquiry notification recipients configured",
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const fullName =
    `${enquiry.firstName || ""} ${enquiry.lastName || ""}`.trim() || "Patient";
  const fromAddress =
    process.env.MAIL_FROM ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "royalehayat.dev@gmail.com";

  await transporter.sendMail({
    from: fromAddress,
    to: recipients.join(", "),
    replyTo: enquiry.email,
    subject: `New International Patient Enquiry — ${fullName}`,
    html: internationalPatientEnquiryNotificationEmailTemplate(enquiry),
  });
};
