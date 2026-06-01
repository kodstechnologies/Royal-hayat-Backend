import { v2 as cloudinary } from "cloudinary";
import fs from "fs-extra";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
    localFilePath,
    folder,
    resourceType = "image"
) => {
    try {
        if (!localFilePath) {
            throw new Error("Local file path is required");
        }

        // Check if file exists
        if (!await fs.pathExists(localFilePath)) {
            throw new Error(`File does not exist: ${localFilePath}`);
        }

        // Check Cloudinary configuration
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            throw new Error("Cloudinary configuration is missing. Please check environment variables.");
        }

        console.log(`Uploading file: ${localFilePath} to folder: ${folder}`);

        const result = await cloudinary.uploader.upload(localFilePath, {
            folder,
            resource_type: resourceType,
            use_filename: true,
            unique_filename: true,
            overwrite: false,
        });

        console.log("Cloudinary upload successful:", result.public_id);

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    } catch (error) {
        console.error("Cloudinary upload error:", error.message);
        throw error;
    } finally {
        // Always remove temp file (success or failure)
        if (localFilePath) {
            try {
                await fs.remove(localFilePath);
                console.log("Temp file removed:", localFilePath);
            } catch (error) {
                console.error("Error removing temp file:", error);
            }
        }
    }
};

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

export const extractPublicId = (url) => {
    if (!url) return null;
    
    try {
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = filename.split('.')[0];
        
        const folderParts = urlParts.slice(3, -1);
        const folder = folderParts.join('/');
        
        return folder ? `${folder}/${publicId}` : publicId;
    } catch (error) {
        return null;
    }
};

export default cloudinary;
