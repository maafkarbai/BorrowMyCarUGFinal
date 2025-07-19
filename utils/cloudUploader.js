// utils/cloudUploader.js (Enhanced)
import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "./cloudinary.js";

// Upload multiple images to Cloudinary
export const uploadImagesToCloud = async (files) => {
  try {
    if (!files || files.length === 0) {
      throw new Error("No files provided for upload");
    }

    // Handle both array of files and single file
    const fileArray = Array.isArray(files) ? files : [files];

    const uploadPromises = fileArray.map(async (file) => {
      // For memory storage, files have buffer instead of path
      if (file.buffer) {
        const result = await uploadToCloudinary(file.buffer, {
          fieldname: file.fieldname,
          originalname: file.originalname,
        });
        return result.secure_url;
      }

      // Fallback for file path if needed
      if (file.path) {
        return file.path;
      }

      // Manual upload if file has different structure
      const result = await cloudinary.uploader.upload(
        file.path || file.buffer,
        {
          folder: "borrowmycar/uploads",
          quality: "auto:good",
          fetch_format: "auto",
        }
      );

      return result.secure_url;
    });

    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

// Delete images from Cloudinary
export const deleteImagesFromCloud = async (imageUrls) => {
  try {
    if (!imageUrls || imageUrls.length === 0) {
      return { success: true, message: "No images to delete" };
    }

    // Handle both array and single URL
    const urlArray = Array.isArray(imageUrls) ? imageUrls : [imageUrls];

    const deletePromises = urlArray.map(async (url) => {
      try {
        // Extract public_id from Cloudinary URL
        const publicId = extractPublicIdFromUrl(url);

        if (publicId) {
          const result = await cloudinary.uploader.destroy(publicId);
          return {
            url,
            publicId,
            result: result.result,
            success: result.result === "ok",
          };
        }

        return {
          url,
          publicId: null,
          result: "invalid_url",
          success: false,
        };
      } catch (error) {
        console.error(`Failed to delete image ${url}:`, error);
        return {
          url,
          error: error.message,
          success: false,
        };
      }
    });

    const results = await Promise.all(deletePromises);

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    return {
      success: failureCount === 0,
      total: results.length,
      successful: successCount,
      failed: failureCount,
      details: results,
    };
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

// Extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  try {
    if (!url || typeof url !== "string") {
      return null;
    }

    // Handle Cloudinary URLs
    if (url.includes("cloudinary.com")) {
      // Extract everything after the last folder and before file extension
      const matches = url.match(
        /\/([^\/]+)\.(jpg|jpeg|png|gif|webp|bmp|tiff|svg)$/i
      );
      if (matches) {
        // Get the full path including folders
        const pathMatch = url.match(
          /\/upload\/(?:v\d+\/)?(.+)\.(jpg|jpeg|png|gif|webp|bmp|tiff|svg)$/i
        );
        return pathMatch ? pathMatch[1] : matches[1];
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting public_id:", error);
    return null;
  }
};

// Upload single file with specific transformations
export const uploadSingleImage = async (file, options = {}) => {
  try {
    if (!file) {
      throw new Error("No file provided for upload");
    }

    // For memory storage, use buffer
    if (file.buffer) {
      const result = await uploadToCloudinary(file.buffer, {
        fieldname: file.fieldname,
        originalname: file.originalname,
        ...options,
      });
      return result.secure_url;
    }

    // Fallback for file path
    if (file.path) {
      return file.path;
    }

    // Manual upload with options
    const uploadOptions = {
      folder: options.folder || "borrowmycar/uploads",
      quality: options.quality || "auto:good",
      fetch_format: "auto",
      ...options,
    };

    const result = await cloudinary.uploader.upload(
      file.path || file.buffer,
      uploadOptions
    );
    return result.secure_url;
  } catch (error) {
    console.error("Single image upload error:", error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

// Get image info from Cloudinary
export const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      image_metadata: true,
      colors: true,
      faces: true,
    });

    return {
      success: true,
      data: {
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        url: result.secure_url,
        createdAt: result.created_at,
        metadata: result.image_metadata,
        colors: result.colors,
        faces: result.faces,
      },
    };
  } catch (error) {
    console.error("Get image info error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Optimize image URL with transformations
export const optimizeImageUrl = (url, transformations = {}) => {
  try {
    if (!url || !url.includes("cloudinary.com")) {
      return url;
    }

    const {
      width,
      height,
      crop = "fill",
      quality = "auto:good",
      format = "auto",
    } = transformations;

    // Build transformation string
    let transformString = "";

    if (width || height) {
      transformString += `w_${width || "auto"},h_${
        height || "auto"
      },c_${crop}/`;
    }

    transformString += `q_${quality},f_${format}`;

    // Insert transformation into URL
    const transformedUrl = url.replace(
      "/upload/",
      `/upload/${transformString}/`
    );

    return transformedUrl;
  } catch (error) {
    console.error("URL optimization error:", error);
    return url; // Return original URL on error
  }
};
