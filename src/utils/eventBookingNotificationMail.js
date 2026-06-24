import nodemailer from "nodemailer";
import { getMailFromAddress } from "./mailFrom.js";

const DEFAULT_RECIPIENTS =
  "events@royalehayat.com,rola.boufalgha@royalehayat.com,rosemary.creer@royalehayat.com,marketing@royalehayat.com";

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

const humanizeHall = (hall) => {
  const labels = {
    aljouri: "Al Jouri",
    gardenia: "Gardenia",
    "in-room-event": "In-Room Event",
    "in-room-event-services": "In-Room Event Services",
  };
  return labels[hall] || String(hall || "N/A").replace(/-/g, " ");
};

const humanizeEventType = (eventType, otherEventType) => {
  const labels = {
    birth: "Birth",
    workshop: "Workshop",
    social: "Social",
    other: "Other",
  };
  const base = labels[eventType] || String(eventType || "N/A");
  if (eventType === "other" && otherEventType?.trim()) {
    return `${base} — ${otherEventType.trim()}`;
  }
  return base;
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

export const eventBookingNotificationEmailTemplate = (event) => {
  const submittedAt = formatDateTime(event.createdAt);

  return `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:700px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:18px 22px;background:#7f1d1d;color:#fff;">
          <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.75);">
            Royale Hayat Hospital
          </p>
          <h2 style="margin:0;font-size:22px;">New Event Booking Request</h2>
          <p style="margin:10px 0 0;font-size:14px;color:rgba(255,255,255,0.9);">
            Submitted ${submittedAt}
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 22px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
            ${renderRow("Hall / Venue", escapeHtml(humanizeHall(event.hall)))}
            ${renderRow("Event Type", escapeHtml(humanizeEventType(event.eventType, event.otherEventType)))}
            ${renderRow("Proposed Event Date", formatDate(event.proposedDate))}
            ${renderRow("Number of Days", escapeHtml(event.days))}
            ${renderRow("Due Date of Expecting Mother", formatDate(event.dueDateOfExpectingMother))}
            ${renderRow("Contact Name", escapeHtml(event.name))}
            ${renderRow("Mobile Number", escapeHtml(event.mobileNumber))}
            ${renderRow("Email", escapeHtml(event.email))}
            ${renderRow("MRN", escapeHtml(event.mrn))}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 22px 22px;background:#f8fafc;border-top:1px solid #e2e8f0;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;text-align:center;">
            You can reply directly to this email to reach the requester.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
};

export const sendEventBookingNotificationEmail = async (event) => {
  const recipients = parseEmails(
    process.env.EVENT_BOOKING_NOTIFICATION_EMAILS || DEFAULT_RECIPIENTS,
  );

  if (recipients.length === 0) {
    throw new Error("No event booking notification recipients configured");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const contactName = event.name || "Event Request";
  await transporter.sendMail({
    from: getMailFromAddress(),
    to: recipients.join(", "),
    ...(event.email ? { replyTo: event.email } : {}),
    subject: `New Event Booking Request — ${contactName}`,
    html: eventBookingNotificationEmailTemplate(event),
  });
};
