// utils/cloudinary.js (Enhanced)
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage instead of CloudinaryStorage for better compatibility
export const storage = multer.memoryStorage();

// Helper function to upload buffer to Cloudinary
export const uploadToCloudinary = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const { fieldname, originalname } = options;
    
    // Determine folder based on file field
    let folder = "borrowmycar/misc";
    let transformation = [{ quality: "auto:good", fetch_format: "auto" }];

    if (fieldname === "images") {
      folder = "borrowmycar/cars";
      transformation = [
        { width: 1200, height: 800, crop: "limit" },
        { quality: "auto:good", fetch_format: "auto" },
      ];
    } else if (
      ["drivingLicense", "emiratesId", "visa", "passport"].includes(fieldname)
    ) {
      folder = "borrowmycar/documents";
    } else if (fieldname === "profileImage") {
      folder = "borrowmycar/profiles";
      transformation = [
        { width: 300, height: 300, crop: "fill", gravity: "face" },
        { quality: "auto:good", fetch_format: "auto" },
      ];
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const publicId = `${fieldname}-${uniqueSuffix}`;

    cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: publicId,
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: transformation,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

// Health check for Cloudinary
export const checkCloudinaryHealth = async () => {
  try {
    const result = await cloudinary.api.ping();
    return {
      status: "connected",
      response: result,
    };
  } catch (error) {
    return {
      status: "error",
      error: error.message,
    };
  }
};

export { cloudinary };
