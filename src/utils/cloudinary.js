import { v2 as cloudinary } from "cloudinary";
import fs from "fs-extra";
import dotenv from "dotenv";

dotenv.config();

/**
 * Cloudinary config
 * Each service owns its own credentials
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {string} localFilePath - temp file path from multer
 * @param {string} folder - cloudinary folder (service-owned)
 * @param {"image"|"video"|"raw"} resourceType
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadToCloudinary = async (
    localFilePath,
    folder,
    resourceType = "image"
) => {
    try {
        if (!localFilePath) {
            throw new Error("Local file path is required");
        }

        const result = await cloudinary.uploader.upload(localFilePath, {
            folder,
            resource_type: resourceType,
            use_filename: true,
            unique_filename: true,
            overwrite: false,
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    } finally {
        // Always remove temp file (success or failure)
        if (localFilePath) {
            try {
                await fs.remove(localFilePath);
            } catch (error) {
                console.error("Error removing temp file:", error);
            }
        }
    }
};

/**
 * Delete file from Cloudinary (use on update/rollback)
 * @param {string} publicId 
 * @param {"image"|"video"|"raw"} resourceType
 */
export const deleteFromCloudinary = async (
    publicId,
    resourceType = "image"
) => {
    if (!publicId) return;
    
    try {
        await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
    }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url 
 * @returns {string|null}
 */
export const extractPublicId = (url) => {
    if (!url) return null;
    
    try {
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = filename.split('.')[0];
        
        // Get folder path
        const folderParts = urlParts.slice(3, -1);
        const folder = folderParts.join('/');
        
        return folder ? `${folder}/${publicId}` : publicId;
    } catch (error) {
        return null;
    }
};

export default cloudinary;
