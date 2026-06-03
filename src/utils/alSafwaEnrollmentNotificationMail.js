import nodemailer from "nodemailer";
import { getMailFromAddress } from "./mailFrom.js";

const DEFAULT_TO = "justine.talampas@royalehayat.com,shehab.mahdy@royalehayat.com,rima.chendeb@royalehayat.com";
const DEFAULT_CC = "marketing@royalehayat.com";

const parseEmails = (value) =>
  String(value || "")
    .split(/[;,]/)
    .map((email) => email.trim())
    .filter(Boolean);

const escapeHtml = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

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

const humanize = (value) => {
  if (!value) return "N/A";
  if (value === "dont_know") return "Don't know";
  if (value === "less_than_1_year") return "Less than 1 yr";
  if (value === "more_than_1_year") return "More than 1 yr";
  return String(value).replace(/_/g, " ");
};

const renderRow = (label, value) => `
  <tr>
    <td style="padding: 8px 12px; width: 42%; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">
      ${label}
    </td>
    <td style="padding: 8px 12px; font-size: 14px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
      ${value}
    </td>
  </tr>
`;

const template = (enrollment) => `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:700px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:18px 22px;background:#7f1d1d;color:#fff;">
          <h2 style="margin:0;font-size:22px;">New Al Safwa Enrollment</h2>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 22px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
            ${renderRow("Name", `${escapeHtml(enrollment.firstName)} ${escapeHtml(enrollment.familyName)}`)}
            ${renderRow("Email", escapeHtml(enrollment.email))}
            ${renderRow("Mobile", escapeHtml(enrollment.mobile))}
            ${renderRow("Gender", humanize(escapeHtml(enrollment.gender)))}
            ${renderRow("Date of Birth", formatDate(enrollment.dateOfBirth))}
            ${renderRow("Preferred Appointment Date", formatDate(enrollment.preferredAppointmentDate))}
            ${renderRow("Medical Checkup", humanize(escapeHtml(enrollment.previousMedicalCheckup)))}
            ${renderRow("Diabetes", humanize(escapeHtml(enrollment.diabetes)))}
            ${renderRow("Hypertension", humanize(escapeHtml(enrollment.hypertension)))}
            ${renderRow("High Cholesterol", humanize(escapeHtml(enrollment.highCholesterol)))}
            ${renderRow("Heart Disease", humanize(escapeHtml(enrollment.heartDisease)))}
            ${renderRow("Bronchial Asthma", humanize(escapeHtml(enrollment.bronchialAsthma)))}
            ${renderRow("Overweight / Obesity", humanize(escapeHtml(enrollment.overweightObesity)))}
            ${renderRow("Do you smoke?", humanize(escapeHtml(enrollment.smoker)))}
            ${renderRow("Do you drink alcohol?", humanize(escapeHtml(enrollment.alcohol)))}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();

export const sendAlSafwaEnrollmentNotificationEmail = async (enrollment) => {
  const toRecipients = parseEmails(
    process.env.AL_SAFWA_ENROLLMENT_NOTIFICATION_TO || DEFAULT_TO,
  );
  const ccRecipients = parseEmails(
    process.env.AL_SAFWA_ENROLLMENT_NOTIFICATION_CC || DEFAULT_CC,
  );

  if (toRecipients.length === 0) {
    throw new Error("No Al Safwa notification To recipients configured");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: getMailFromAddress(),
    to: toRecipients.join(", "),
    ...(ccRecipients.length ? { cc: ccRecipients.join(", ") } : {}),
    replyTo: enrollment.email || undefined,
    subject: "New Al Safwa Enrollment",
    html: template(enrollment),
  });
};

