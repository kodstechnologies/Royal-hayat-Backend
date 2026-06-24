import path from "path";
import { S3Client, PutObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const DEFAULT_PUBLIC_PATH_PREFIX = "Runtime/uploads";

/** Default public path from filename, e.g. /Runtime/uploads/AlLiwan.pdf */
export function buildDocumentPublicPath(filename) {
  const basename = path.basename(String(filename || "").trim());
  if (!basename) {
    throw new Error("A valid filename is required");
  }
  return joinPublicPath(DEFAULT_PUBLIC_PATH_PREFIX, basename);
}

/** Join mount prefix + relative segments into a normalized /path/to/file.ext */
export function joinPublicPath(prefix, relativePath) {
  const cleanPrefix = String(prefix || "").replace(/^\/+|\/+$/g, "");
  const cleanRelative = String(relativePath || "").replace(/^\/+/, "");
  if (!cleanRelative) return null;
  return `/${[cleanPrefix, cleanRelative].filter(Boolean).join("/")}`.replace(/\/+/g, "/");
}

/**
 * Normalize admin-provided path or pasted URL to any site path, e.g.
 * /Runtime/uploads/foo.pdf, /wp-content/uploads/2026/04/menu.pdf, /documents/brochure.pdf
 */
export function normalizeDocumentPublicPath(input, fallbackFilename) {
  let value = String(input ?? "").trim();

  if (!value) {
    if (!fallbackFilename) {
      throw new Error("Public path is required");
    }
    return buildDocumentPublicPath(fallbackFilename);
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      value = new URL(value).pathname;
    } catch {
      throw new Error("Invalid public URL");
    }
  }

  value = decodeURIComponent(value).trim();

  if (value.includes("..")) {
    throw new Error("Public path cannot contain '..'");
  }

  if (!value.startsWith("/")) {
    value = `/${value}`;
  }

  value = value.replace(/\/+/g, "/");

  if (!path.posix.basename(value) || value === "/") {
    throw new Error("Public path must include a filename");
  }

  if (!hasPublicDocumentExtension(value) && fallbackFilename) {
    const ext = path.extname(fallbackFilename);
    if (ext) {
      value = `${value.replace(/\/+$/, "")}${ext}`;
    }
  }

  if (!hasPublicDocumentExtension(value)) {
    throw new Error(
      "Public path must end with a supported file extension (.pdf, .png, .jpg, .jpeg, .webp)",
    );
  }

  return value;
}

/** S3 object key matching the public path (no leading slash). */
export function buildDocumentS3Key(publicPath) {
  return String(publicPath || "").trim().replace(/^\/+/, "");
}

/** Relative public path — works on any host (local or production). */
export function getDocumentPublicPath(publicPath) {
  const normalizedPath = String(publicPath || "").startsWith("/")
    ? publicPath
    : `/${publicPath}`;
  return normalizedPath.replace(/\/+/g, "/");
}

/**
 * Optional absolute URL when PUBLIC_SITE_URL is configured.
 * Prefer returning the relative path from the API and building absolute URLs on the client.
 */
export function getDocumentPublicUrl(publicPath, siteBase) {
  const normalizedPath = getDocumentPublicPath(publicPath);
  const base = String(siteBase ?? process.env.PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  return base ? `${base}${normalizedPath}` : normalizedPath;
}

export async function uploadDocumentToS3(file, publicPath) {
  const key = buildDocumentS3Key(publicPath);

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: "no-cache, no-store, must-revalidate",
    }),
  );

  const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return { key, url, publicPath };
}

const encodeCopySource = (bucket, key) =>
  `${bucket}/${String(key)
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;

export async function copyS3ObjectToKey(sourceKey, destinationKey, contentType = "application/pdf") {
  const bucket = process.env.AWS_BUCKET_NAME;
  const source = String(sourceKey || "").trim();
  const destination = String(destinationKey || "").trim();

  if (!source || !destination) {
    throw new Error("Source and destination S3 keys are required");
  }

  if (source === destination) {
    return { key: destination };
  }

  await s3.send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: encodeCopySource(bucket, source),
      Key: destination,
      ContentType: contentType,
      MetadataDirective: "REPLACE",
    }),
  );

  return { key: destination };
}

export async function uploadLocalFileToS3(localFilePath, publicPath, contentType = "application/pdf") {
  const { readFile } = await import("fs/promises");
  const buffer = await readFile(localFilePath);
  const key = buildDocumentS3Key(publicPath);

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return { key, url, publicPath };
}

export const PUBLIC_DOCUMENT_FILE_RE = /\.(pdf|png|jpe?g|webp)$/i;

export function hasPublicDocumentExtension(value) {
  const basename = path.posix.basename(String(value || "").replace(/\/+$/, ""));
  return PUBLIC_DOCUMENT_FILE_RE.test(basename);
}

export function isPublicDocumentPath(pathname) {
  const cleanPath = String(pathname || "").split("?")[0].split("#")[0];
  return PUBLIC_DOCUMENT_FILE_RE.test(cleanPath);
}

const legacySpacedBasename = (basename) => {
  if (!basename || basename.includes(" ")) return null;

  const ext = path.posix.extname(basename);
  const stem = ext ? basename.slice(0, -ext.length) : basename;
  const parts = stem.split("_");
  if (parts.length < 3) return null;

  let splitAt = parts.length;
  for (let i = 0; i < parts.length; i += 1) {
    if (/\d/.test(parts[i])) {
      splitAt = i;
      break;
    }
  }

  if (splitAt < 2) return null;

  return `${parts.slice(0, splitAt).join(" ")}_${parts.slice(splitAt).join("_")}${ext}`;
};

/** Build lookup candidates for the same logical public path. */
export function buildPublicPathLookupCandidates(publicPath) {
  const normalized = getDocumentPublicPath(publicPath);
  const candidates = new Set([normalized, String(publicPath || "").trim()]);

  try {
    candidates.add(decodeURIComponent(normalized));
  } catch {
    // ignore decode errors
  }

  try {
    candidates.add(decodeURIComponent(String(publicPath || "").trim()));
  } catch {
    // ignore decode errors
  }

  const addPathVariant = (value) => {
    const clean = String(value || "").trim().replace(/\/+/g, "/");
    if (!clean) return;
    candidates.add(clean.startsWith("/") ? clean : `/${clean}`);

    const encodedSegments = clean
      .split("/")
      .map((segment, index) => {
        if (index === 0 && !segment) return "";
        if (!segment) return segment;
        return encodeURIComponent(decodeURIComponent(segment));
      })
      .join("/");
    candidates.add(encodedSegments);
  };

  const addFilenameVariants = (pathname) => {
    const cleanPath = getDocumentPublicPath(pathname);
    const segments = cleanPath.split("/").filter(Boolean);
    if (!segments.length) return;

    const basename = segments[segments.length - 1];
    const dirSegments = segments.slice(0, -1);
    const basenameVariants = new Set([
      basename,
      basename.replace(/ /g, "_"),
    ]);

    const legacySpaced = legacySpacedBasename(basename);
    if (legacySpaced) {
      basenameVariants.add(legacySpaced);
      basenameVariants.add(legacySpaced.replace(/ /g, "_"));
    }

    for (const variant of basenameVariants) {
      addPathVariant(`/${[...dirSegments, variant].join("/")}`);
    }
  };

  addPathVariant(normalized);
  addFilenameVariants(normalized);

  return [...candidates]
    .map((candidate) => candidate.replace(/\/+/g, "/"))
    .filter(Boolean);
}

/** Build likely S3 key variants for the same logical document file. */
export function buildDocumentStorageKeyCandidates(keyOrPath) {
  const cleanKey = String(keyOrPath || "").trim().replace(/^\/+/, "");
  if (!cleanKey) return [];

  const candidates = new Set([cleanKey]);
  const basename = path.posix.basename(cleanKey);
  const dir = cleanKey.slice(0, Math.max(0, cleanKey.length - basename.length));

  const basenameVariants = new Set([
    basename,
    basename.replace(/ /g, "_"),
  ]);
  const legacySpaced = legacySpacedBasename(basename);
  if (legacySpaced) {
    basenameVariants.add(legacySpaced);
    basenameVariants.add(legacySpaced.replace(/ /g, "_"));
  }

  for (const variant of basenameVariants) {
    candidates.add(`${dir}${variant}`.replace(/\/+/g, "/"));
  }

  return [...candidates].filter(Boolean);
}
