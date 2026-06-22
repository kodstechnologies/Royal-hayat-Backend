import nodemailer from "nodemailer";
import { getMailFromAddress } from "./mailFrom.js";
import { formatSlotTimesForDisplay } from "../modules/appintmentRequest/utils/appointmentSlotTimes.js";

const DEFAULT_RECIPIENTS =
  "prajwalanagekar@gmail.com";

const parseEmails = (value) =>
  String(value || "")
    .split(/[;,]/)
    .map((email) => email.trim())
    .filter(Boolean);

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

export const appointmentBookingNotificationEmailTemplate = (booking) => {
  const submittedAt = formatDateTime(booking.createdAt);
  const symptoms =
    Array.isArray(booking.symptoms) && booking.symptoms.length
      ? escapeHtml(booking.symptoms.join(", "))
      : "N/A";
  const dob = booking.dob ? formatDateTime(booking.dob).split(",")[0] : "N/A";

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Appointment Booking</title>
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
                  New Appointment Booking
                </h1>
                <p style="margin: 10px 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">
                  A confirmed appointment has been booked via the website
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 32px 8px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px;">
                  <tr>
                    <td style="padding: 14px 18px;">
                      <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; color: #991b1b;">Patient</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #7f1d1d;">${escapeHtml(booking.fullname)}</p>
                    </td>
                    <td style="padding: 14px 18px; border-left: 1px solid #fecaca;">
                      <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; color: #991b1b;">Booked</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #7f1d1d;">${submittedAt}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 32px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                  ${renderRow("Full Name", escapeHtml(booking.fullname))}
                  ${renderRow("Phone", escapeHtml(booking.phone))}
                  ${renderRow("Email", escapeHtml(booking.email))}
                  ${renderRow("Gender", escapeHtml(booking.gender))}
                  ${renderRow("Age", booking.age != null ? escapeHtml(booking.age) : "N/A")}
                  ${renderRow("Date of Birth", dob)}
                  ${renderRow("Nationality", escapeHtml(booking.nationality))}
                  ${renderRow("Patient ID", escapeHtml(booking.patient_id))}
                  ${renderRow("National ID", escapeHtml(booking.national_id))}
                  ${renderRow("URN", escapeHtml(booking.urn))}
                  ${renderRow("Department", escapeHtml(booking.department))}
                  ${renderRow("Doctor", escapeHtml(booking.doctor))}
                  ${renderRow("Appointment Date", escapeHtml(booking.date))}
                  ${renderRow("Appointment Time", escapeHtml(formatSlotTimesForDisplay(booking)))}
                  ${renderRow("Symptoms", symptoms)}
                  ${renderRow("Additional Notes", escapeHtml(booking.additionalNotes).replace(/\n/g, "<br />"))}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 32px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #64748b; text-align: center;">
                  ${booking.email ? "You can reply directly to this email to reach the patient." : "Contact the patient using the phone number provided."}
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

export const sendAppointmentBookingNotificationEmail = async (booking) => {
  const recipients = parseEmails(
    process.env.APPOINTMENT_BOOKING_NOTIFICATION_EMAILS || DEFAULT_RECIPIENTS,
  );

  if (recipients.length === 0) {
    throw new Error("No appointment booking notification recipients configured");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const patientName = booking.fullname || "Patient";
  await transporter.sendMail({
    from: getMailFromAddress(),
    to: recipients.join(", "),
    ...(booking.email ? { replyTo: booking.email } : {}),
    subject: `New Appointment Booking — ${patientName}`,
    html: appointmentBookingNotificationEmailTemplate(booking),
  });
};
