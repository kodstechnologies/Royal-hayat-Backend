import nodemailer from "nodemailer";
import { getJobApplicantMailFromAddress } from "./mailFrom.js";

const KUWAIT_TIMEZONE = "Asia/Kuwait";

const createJobApplicantTransporter = () => {
  const host = process.env.JOB_APPLICANT_SMTP_HOST?.trim();
  const user = process.env.JOB_APPLICANT_SMTP_USER?.trim();
  const pass = process.env.JOB_APPLICANT_SMTP_PASS?.trim();
  const port = Number(process.env.JOB_APPLICANT_SMTP_PORT || 587);
  const secure = process.env.JOB_APPLICANT_SMTP_SECURE === "true";

  if (!host || !user || !pass) {
    throw new Error(
      "JOB_APPLICANT_SMTP_HOST, JOB_APPLICANT_SMTP_USER, or JOB_APPLICANT_SMTP_PASS missing",
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

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
    hour12: false,
    timeZone: KUWAIT_TIMEZONE,
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
    <td style="padding: 10px 16px; width: 40%; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
      ${label}
    </td>
    <td style="padding: 10px 16px; font-size: 14px; color: #0f172a; font-weight: 500; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
      ${value}
    </td>
  </tr>
`;

export const jobApplicationApplicantEmailTemplate = (application, job) => {
  const applicantName = escapeHtml(application.fullName);
  const applicationId = escapeHtml(application.applicationId || "—");
  const jobRole = escapeHtml(job?.title);
  const jobRef = escapeHtml(job?.jobId || job?._id?.toString?.() || job?._id);
  const submittedAt = formatDateTime(
    application.createdAt || application.appliedDate,
  );

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Job Application Received</title>
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
                  Application Received
                </h1>
                <p style="margin: 10px 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">
                  Thank you for applying with us
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 32px 8px;">
                <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #334155;">
                  Dear ${applicantName},
                </p>
                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #334155;">
                  You have successfully applied for the job. Our HR team has received your application and will review it shortly.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 32px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                  ${renderRow("Job Role", jobRole)}
                  ${renderRow("Job ID", jobRef)}
                  ${renderRow("Application ID", applicationId)}
                  ${renderRow("Submitted On", submittedAt)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 32px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #64748b; text-align: center;">
                  Please keep this email for your records. If you are shortlisted, our team will contact you using the details you provided.
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

export const sendJobApplicationConfirmationEmail = async (application, job) => {
  const applicantEmail = String(application?.email || "")
    .trim()
    .toLowerCase();

  if (!applicantEmail) {
    throw new Error("Applicant email is required");
  }

  const from = getJobApplicantMailFromAddress();
  const transporter = createJobApplicantTransporter();
  try {
    await transporter.verify();
    console.log("SMTP connection successful");
  } catch (err) {
    console.error("SMTP verification failed:", err);
  }
  const applicationId = application.applicationId || "Application";
  const jobTitle = job?.title || "Position";

  await transporter.sendMail({
    from,
    to: applicantEmail,
    subject: `Application Received — ${applicationId} (${jobTitle})`,
    html: jobApplicationApplicantEmailTemplate(application, job),
  });
};
