import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a single multer file (memory storage) to S3.
 * @param {Express.Multer.File} file
 * @param {string} folder  - S3 key prefix / folder name
 * @returns {Promise<{ url: string, key: string }>}
 */
export const putObject = async (file, folder = "uploads") => {
  const safeName = file.originalname.replace(/\s+/g, "_");
  const key = `${folder}/${Date.now()}-${safeName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return { url, key };
};
