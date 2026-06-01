import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const extractKey = (keyOrUrl) => {
    if (!keyOrUrl) return null;

    try {
        if (keyOrUrl.startsWith("http")) {
            const url = new URL(keyOrUrl);
            return decodeURIComponent(url.pathname.replace(/^\/+/, ""));
        }
        return keyOrUrl.trim();
    } catch {
        return keyOrUrl.trim();
    }
};

export const getFileUrl = async (key) => {
    if (!key || typeof key !== "string") {
        console.warn("Skipping invalid S3 key:", key);
        return null;
    }

    try {
        const cleanKey = extractKey(key);

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: cleanKey,
        });

        return await getSignedUrl(s3, command, { expiresIn: 3600 });
    } catch (error) {
        console.error("Error generating signed URL for key:", key, error);
        return null;
    }
};

export const getMultipleFileUrls = async (keys) => {
    if (!Array.isArray(keys) || keys.length === 0) {
        console.warn("No S3 keys provided for multiple URL generation");
        return [];
    }

    const urls = await Promise.all(keys.map((key) => getFileUrl(key)));

    return urls.filter((url) => Boolean(url));
};