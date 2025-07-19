// middlewares/multer.js (Enhanced)
import multer from "multer";
import path from "path";
import { storage } from "../utils/cloudinary.js";

// Enhanced file filter with comprehensive validation
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  // Check file type
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error(
      "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
    );
    error.code = "INVALID_FILE_TYPE";
    return cb(error, false);
  }

  // Check file extension as additional security
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    const error = new Error("Invalid file extension.");
    error.code = "INVALID_FILE_EXTENSION";
    return cb(error, false);
  }

  cb(null, true);
};

// Enhanced multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10, // Maximum 10 files per request
  },
});

// Different upload configurations for different use cases
export const uploadCarImages = upload.array("images", 10);

export const uploadUserDocuments = upload.fields([
  { name: "drivingLicense", maxCount: 1 },
  { name: "emiratesId", maxCount: 1 },
  { name: "visa", maxCount: 1 },
  { name: "passport", maxCount: 1 },
  { name: "profileImage", maxCount: 1 },
]);

export const uploadProfileImage = upload.single("profileImage");

// Default export for backward compatibility
export default upload;
