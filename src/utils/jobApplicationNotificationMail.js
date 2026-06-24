import nodemailer from "nodemailer";
import { getMailFromAddress } from "./mailFrom.js";
import { getS3ObjectBuffer } from "./s3Fetch.js";

const DEFAULT_RECIPIENTS =
  "hr@royalehayat.com,marketing@royalehayat.com";

const KUWAIT_TIMEZONE = "Asia/Kuwait";

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

const escapeHtmlAttr = (value) => escapeHtml(value).replace(/`/g, "&#96;");

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

export const jobApplicationNotificationEmailTemplate = (
  application,
  job,
  { hasResumeAttachment = false } = {},
) => {
  const applicationId = escapeHtml(application.applicationId || "—");
  const submittedAt = formatDateTime(application.createdAt || application.appliedDate);
  const resumeUrl = application.resume
    ? `<a href="${escapeHtmlAttr(application.resume)}" style="color: #991b1b; text-decoration: underline;">View resume</a>`
    : "N/A";
  const resumeCell = hasResumeAttachment
    ? `${resumeUrl}<br /><span style="font-size:12px;color:#64748b;">Resume attached to this email</span>`
    : resumeUrl;
  const coverLetter = application.coverLetter
    ? escapeHtml(application.coverLetter).replace(/\n/g, "<br />")
    : "N/A";

  const jobTitle = escapeHtml(job?.title);
  const jobRef = escapeHtml(job?.jobId || job?._id?.toString?.() || job?._id);
  const jobLocation = escapeHtml(job?.location);
  const jobType = escapeHtml(job?.type);
  const jobClassification = escapeHtml(job?.classification);

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Job Application</title>
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
                  New Job Application
                </h1>
                <p style="margin: 10px 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">
                  Submitted from the website careers page
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 32px 8px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px;">
                  <tr>
                    <td style="padding: 14px 18px;">
                      <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; color: #991b1b;">Application ID</p>
                      <p style="margin: 0; font-size: 18px; font-weight: 700; color: #7f1d1d; font-family: 'Courier New', Courier, monospace;">${applicationId}</p>
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
              <td style="padding: 8px 32px 4px;">
                <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.06em;">Position</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                  ${renderRow("Job Title", jobTitle)}
                  ${renderRow("Job Ref", jobRef)}
                  ${renderRow("Classification", jobClassification)}
                  ${renderRow("Location", jobLocation)}
                  ${renderRow("Work Type", jobType)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 32px 24px;">
                <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.06em;">Applicant</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                  ${renderRow("Full Name", escapeHtml(application.fullName))}
                  ${renderRow("Email", escapeHtml(application.email))}
                  ${renderRow("Phone", escapeHtml(application.phone))}
                  ${renderRow("Resume", resumeCell)}
                  ${renderRow("Cover Letter", coverLetter)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 32px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #64748b; text-align: center;">
                  You can reply directly to this email to reach the applicant.
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

const buildResumeAttachment = async (application, resumeFile) => {
  if (resumeFile?.buffer?.length) {
    return {
      filename: resumeFile.originalname || "resume.pdf",
      content: resumeFile.buffer,
      contentType: resumeFile.mimetype || "application/pdf",
    };
  }

  if (!application?.resume) return null;

  const s3File = await getS3ObjectBuffer(application.resume);
  if (!s3File?.buffer?.length) return null;

  return {
    filename: s3File.filename || "resume.pdf",
    content: s3File.buffer,
    contentType: s3File.contentType || "application/pdf",
  };
};

export const sendJobApplicationNotificationEmail = async (
  application,
  job,
  resumeFile,
) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP_USER or SMTP_PASS missing");
  }

  const recipients = (
    process.env.JOB_APPLICATION_NOTIFICATION_EMAILS || DEFAULT_RECIPIENTS
  )
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    throw new Error("No job application notification recipients configured");
  }

  const resumeAttachment = await buildResumeAttachment(application, resumeFile);
  const attachments = resumeAttachment ? [resumeAttachment] : [];

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const applicationId = application.applicationId || "New";
  const jobTitle = job?.title || "Position";
  await transporter.sendMail({
    from: getMailFromAddress(),
    to: recipients.join(", "),
    replyTo: application.email,
    subject: `New Job Application — ${applicationId} (${jobTitle})`,
    html: jobApplicationNotificationEmailTemplate(application, job, {
      hasResumeAttachment: attachments.length > 0,
    }),
    attachments,
  });
};
