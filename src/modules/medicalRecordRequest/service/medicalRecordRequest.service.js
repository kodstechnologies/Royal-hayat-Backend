import nodemailer from "nodemailer";

import {
  createMedicalRecordRequestRepo,
  getAllMedicalRecordRequestsRepo,
  getMedicalRecordRequestByIdRepo,
  deleteMedicalRecordRequestRepo,
} from "../repository/medicalRecordRequest.repository.js";

import { uploadToS3 } from "../../../utils/s3Upload.js";
import { getFileUrl } from "../../../utils/s3Fetch.js";
import {
  medicalRecordRequestEmailTemplate,
  resolveEmailSubject,
} from "../../../utils/shareViaMail.js";
import { getMailFromAddress } from "../../../utils/mailFrom.js";
import toPlainObject from "../../../utils/toPlainObject.js";

const ATTACHMENT_FIELDS = [
  "civilIdAttachment",
  "passportOrGovernmentIdAttachment",
  "validProof",
];

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
    delete sanitized.specialRequest;
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

const resolvePrimaryAttachmentUrl = async (request) => {
  const key =
    request.civilIdAttachment ||
    request.passportOrGovernmentIdAttachment ||
    request.validProof;

  if (!key) return null;
  return getFileUrl(key);
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

  return createMedicalRecordRequestRepo(payload);
};

export const getAllMedicalRecordRequestsService = async () => {
  const requests = await getAllMedicalRecordRequestsRepo();

  return Promise.all(
    requests.map((request) => enrichRequestWithAttachmentUrls(request)),
  );
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

  const normalizedLanguages =
    Array.isArray(languages) && languages.length > 0
      ? [...new Set(languages.filter((lang) => lang === "en" || lang === "ar"))]
      : ["en"];

  if (normalizedLanguages.length === 0) {
    throw new Error("At least one language (en or ar) is required");
  }

  const recipients = emailId
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

  const passportFileUrl = await resolvePrimaryAttachmentUrl(request);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const htmlContent = medicalRecordRequestEmailTemplate(
    request,
    passportFileUrl,
    normalizedLanguages,
  );

  const subject = resolveEmailSubject(normalizedLanguages);
  await transporter.sendMail({
    from: getMailFromAddress(),
    to: recipients.join(", "),
    subject,
    html: htmlContent,
  });

  return {
    success: true,
    message: `Medical record request shared successfully to ${recipients.length} recipient(s)`,
  };
};
