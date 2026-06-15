import nodemailer from "nodemailer";

import {
  createMedicalRecordRequestRepo,
  getMedicalRecordRequestsPaginatedRepo,
  countMedicalRecordRequestsRepo,
  getMedicalRecordRequestByIdRepo,
  deleteMedicalRecordRequestRepo,
} from "../repository/medicalRecordRequest.repository.js";

import { uploadToS3 } from "../../../utils/s3Upload.js";
import { getFileUrl, getS3ObjectBuffer } from "../../../utils/s3Fetch.js";
import {
  medicalRecordRequestEmailTemplate,
  resolveEmailSubject,
} from "../../../utils/shareViaMail.js";
import { getMailFromAddress } from "../../../utils/mailFrom.js";
import toPlainObject from "../../../utils/toPlainObject.js";

const DEFAULT_CREATE_NOTIFICATION_RECIPIENTS = [
  "medicalrecords@royalehayat.com",
  "marketing@royalehayat.com",

];

const ATTACHMENT_FIELDS = [
  "civilIdAttachment",
  "passportOrGovernmentIdAttachment",
  "validProof",
];

const ATTACHMENT_FIELD_LABELS = {
  civilIdAttachment: "civil-id",
  passportOrGovernmentIdAttachment: "passport-id",
  validProof: "valid-proof",
};

const getUploadedFile = (files, fieldName) => files?.[fieldName]?.[0] ?? null;

const parseMultipartBody = (body) => {
  const parsed = { ...body };

  if (typeof parsed.specificDocumentTypes === "string") {
    const raw = parsed.specificDocumentTypes.trim();
    if (raw.startsWith("[")) {
      try {
        parsed.specificDocumentTypes = JSON.parse(raw);
      } catch {
        parsed.specificDocumentTypes = [];
      }
    } else if (raw.includes(",")) {
      parsed.specificDocumentTypes = raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (raw) {
      parsed.specificDocumentTypes = [raw];
    } else {
      parsed.specificDocumentTypes = [];
    }
  }

  return parsed;
};

const sanitizeAuthorizationPayload = (payload) => {
  const sanitized = { ...payload };

  if (sanitized.specificAuthorization === "Discharge Summary") {
    delete sanitized.specificDocumentTypes;
    delete sanitized.specificDocumentsOther;

    if (!sanitized.specificAuthorizationDate && sanitized.specificFromDate) {
      sanitized.specificAuthorizationDate = sanitized.specificFromDate;
    }

    delete sanitized.specificFromDate;
    delete sanitized.specificToDate;
  }

  if (sanitized.specificAuthorization === "specific documents") {
    delete sanitized.specificAuthorizationDate;
  }

  return sanitized;
};

const enrichRequestWithAttachmentUrls = async (request) => {
  const plain = toPlainObject(request);

  await Promise.all(
    ATTACHMENT_FIELDS.map(async (field) => {
      if (plain[field]) {
        plain[field] = await getFileUrl(plain[field]);
      }
    }),
  );

  return plain;
};

const resolveAttachmentUrls = async (request) => {
  const urls = {};

  await Promise.all(
    ATTACHMENT_FIELDS.map(async (field) => {
      if (request[field]) {
        urls[field] = await getFileUrl(request[field]);
      }
    }),
  );

  return urls;
};

const buildEmailAttachments = async (request) => {
  const results = await Promise.all(
    ATTACHMENT_FIELDS.map(async (field) => {
      const key = request[field];
      if (!key) return null;

      const file = await getS3ObjectBuffer(key);
      if (!file) return null;

      return {
        filename: `${ATTACHMENT_FIELD_LABELS[field]}-${file.filename}`,
        content: file.buffer,
        contentType: file.contentType,
      };
    }),
  );

  return results.filter(Boolean);
};

const normalizeRecipients = (emailId) => {
  const recipients = String(emailId ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalid = recipients.find((email) => !emailRegex.test(email));

  if (recipients.length === 0) {
    throw new Error("At least one valid email address is required");
  }

  if (invalid) {
    throw new Error(`Invalid email address: ${invalid}`);
  }

  return recipients;
};

const normalizeLanguages = (languages) => {
  const normalized =
    Array.isArray(languages) && languages.length > 0
      ? [...new Set(languages.filter((lang) => lang === "en" || lang === "ar"))]
      : ["en"];

  if (normalized.length === 0) {
    throw new Error("At least one language (en or ar) is required");
  }

  return normalized;
};

const sendMedicalRecordRequestEmail = async (request, recipients, languages = ["en", "ar"]) => {
  const plainRequest = toPlainObject(request);
  const normalizedRecipients = Array.isArray(recipients)
    ? recipients.map((email) => String(email).trim()).filter(Boolean)
    : normalizeRecipients(recipients);

  const normalizedLanguages = normalizeLanguages(languages);
  const [attachmentUrls, emailAttachments] = await Promise.all([
    resolveAttachmentUrls(plainRequest),
    buildEmailAttachments(plainRequest),
  ]);
  const hasEmailAttachments = emailAttachments.length > 0;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const htmlContent = medicalRecordRequestEmailTemplate(plainRequest, {
    attachmentUrls,
    hasEmailAttachments,
  });

  const subject = resolveEmailSubject(normalizedLanguages);

  await transporter.sendMail({
    from: getMailFromAddress(),
    to: normalizedRecipients.join(", "),
    subject,
    html: htmlContent,
    attachments: emailAttachments,
  });

  return normalizedRecipients.length;
};

export const createMedicalRecordRequestService = async (body, files = {}) => {
  const parsedBody = parseMultipartBody(body);
  const validIdentification = parsedBody.validIdentification;
  const requestedBy = parsedBody.requestedBy;

  const payload = sanitizeAuthorizationPayload({ ...parsedBody });

  if (validIdentification === "civilId") {
    const civilIdFile = getUploadedFile(files, "civilIdAttachment");
    if (!civilIdFile) {
      throw new Error("civilIdAttachment is required");
    }
    const uploaded = await uploadToS3(civilIdFile);
    payload.civilIdAttachment = uploaded.key;
  } else if (validIdentification === "passportORGovtId") {
    const passportFile = getUploadedFile(files, "passportOrGovernmentIdAttachment");
    if (!passportFile) {
      throw new Error("passportOrGovernmentIdAttachment is required");
    }
    const uploaded = await uploadToS3(passportFile);
    payload.passportOrGovernmentIdAttachment = uploaded.key;
  } else {
    throw new Error("validIdentification is required");
  }

  if (requestedBy === "Legal Representative") {
    const proofFile = getUploadedFile(files, "validProof");
    if (!proofFile) {
      throw new Error("validProof is required");
    }
    const uploaded = await uploadToS3(proofFile);
    payload.validProof = uploaded.key;
  }

  const request = await createMedicalRecordRequestRepo(payload);

  try {
    await sendMedicalRecordRequestEmail(
      request,
      DEFAULT_CREATE_NOTIFICATION_RECIPIENTS,
      ["en", "ar"],
    );
  } catch (error) {
    console.error(
      "Failed to send medical record request notification email:",
      error.message,
    );
  }

  return request;
};

export const getAllMedicalRecordRequestsService = async (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const search = String(query.search || "").trim();
  const status = ["all", "pending", "received"].includes(query.status)
    ? query.status
    : "all";

  const [[requests, totalRecords], totalCount, pendingCount, receivedCount] =
    await Promise.all([
      getMedicalRecordRequestsPaginatedRepo({ page, limit, search, status }),
      countMedicalRecordRequestsRepo({}),
      countMedicalRecordRequestsRepo({ isViewed: false }),
      countMedicalRecordRequestsRepo({ isViewed: true }),
    ]);

  return {
    requests,
    meta: {
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit) || 0,
      counts: {
        total: totalCount,
        pending: pendingCount,
        received: receivedCount,
      },
    },
  };
};

export const getMedicalRecordRequestByIdService = async (id) => {
  const request = await getMedicalRecordRequestByIdRepo(id);

  if (!request) {
    throw new Error("Medical record request not found");
  }

  return enrichRequestWithAttachmentUrls(request);
};

export const deleteMedicalRecordRequestService = async (id) => {
  return deleteMedicalRecordRequestRepo(id);
};

export const shareMedicalRecordRequestViaEmailService = async (id, body) => {
  const request = await getMedicalRecordRequestByIdRepo(id);

  if (!request) {
    throw new Error("Medical record request not found");
  }

  const { emailId, languages } = body;

  if (!emailId?.trim()) {
    throw new Error("emailId is required");
  }

  const recipientCount = await sendMedicalRecordRequestEmail(
    request,
    emailId,
    languages,
  );

  return {
    success: true,
    message: `Medical record request shared successfully to ${recipientCount} recipient(s)`,
  };
};
