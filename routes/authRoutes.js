// routes/authRoutes.js - Enhanced with Profile Picture Management
import express from "express";
import {
  signup,
  verifyEmail, // NEW
  resendOTP, // NEW
  forgotPassword, // NEW
  resetPassword, // NEW
  resendPasswordResetOTP, // NEW
  login,
  getProfile,
  getPublicUserProfile, // NEW
  updateProfile,
  updateProfilePicture, // NEW
  removeProfilePicture, // NEW
  changePassword,
  updatePreferences,
  exportUserData,
  deleteAccount,
  logout,
} from "../controllers/authController.js";
import { protect, authLimiter } from "../middlewares/authMiddleware.js";
import {
  uploadUserDocuments,
  uploadProfileImage,
} from "../middlewares/multer.js";
import {
  validateSignup,
  validateLogin,
  handleValidationErrors,
} from "../utils/validators.js";
import { body } from "express-validator";

const router = express.Router();

// Validation rules for profile updates
const validateProfileUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("preferredCity")
    .optional()
    .isIn([
      "Dubai",
      "Abu Dhabi",
      "Sharjah",
      "Ajman",
      "Fujairah",
      "Ras Al Khaimah",
      "Umm Al Quwain",
    ])
    .withMessage("Please select a valid UAE city"),
];

// Validation rules for preferences
const validatePreferences = [
  body("notifications.emailBookings")
    .optional()
    .isBoolean()
    .withMessage("Email bookings preference must be true or false"),
  body("notifications.emailPromotions")
    .optional()
    .isBoolean()
    .withMessage("Email promotions preference must be true or false"),
  body("notifications.smsBookings")
    .optional()
    .isBoolean()
    .withMessage("SMS bookings preference must be true or false"),
  body("notifications.smsReminders")
    .optional()
    .isBoolean()
    .withMessage("SMS reminders preference must be true or false"),
  body("notifications.pushNotifications")
    .optional()
    .isBoolean()
    .withMessage("Push notifications preference must be true or false"),
  body("privacy.profileVisibility")
    .optional()
    .isIn(["public", "private"])
    .withMessage("Profile visibility must be public or private"),
  body("privacy.showPhone")
    .optional()
    .isBoolean()
    .withMessage("Show phone preference must be true or false"),
  body("privacy.showEmail")
    .optional()
    .isBoolean()
    .withMessage("Show email preference must be true or false"),
  body("privacy.allowMessages")
    .optional()
    .isBoolean()
    .withMessage("Allow messages preference must be true or false"),
];

// PUBLIC ROUTES (No authentication required)
router.post(
  "/signup",
  authLimiter,
  uploadUserDocuments,
  validateSignup,
  handleValidationErrors,
  signup
);

router.post(
  "/register", // Alternative endpoint name
  authLimiter,
  uploadUserDocuments,
  validateSignup,
  handleValidationErrors,
  signup
);

router.post(
  "/login",
  authLimiter,
  validateLogin,
  handleValidationErrors,
  login
);

// Email verification routes
router.post(
  "/verify-email",
  authLimiter,
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("otp")
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage("OTP must be a 6-digit number"),
  handleValidationErrors,
  verifyEmail
);

router.post(
  "/resend-otp",
  authLimiter,
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  handleValidationErrors,
  resendOTP
);

// Password reset routes
router.post(
  "/forgot-password",
  authLimiter,
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  handleValidationErrors,
  forgotPassword
);

router.post(
  "/reset-password",
  authLimiter,
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("otp")
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage("OTP must be a 6-digit number"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  handleValidationErrors,
  resetPassword
);

router.post(
  "/resend-password-reset-otp",
  authLimiter,
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  handleValidationErrors,
  resendPasswordResetOTP
);

// Public user profile route (no authentication required)
router.get("/users/:userId", getPublicUserProfile);

// PROTECTED ROUTES (Authentication required)
router.use(protect); // Apply protection to all routes below

// Profile management
router.get("/profile", getProfile);

router.patch(
  "/profile",
  uploadProfileImage, // Handle single profile image upload
  validateProfileUpdate,
  handleValidationErrors,
  updateProfile
);

// NEW: Profile picture specific routes
router.put(
  "/profile-picture",
  uploadProfileImage, // Handle single profile image upload
  updateProfilePicture
);

router.delete("/profile-picture", removeProfilePicture);

// Security
router.patch("/change-password", changePassword);

// Preferences (notifications and privacy)
router.patch(
  "/preferences",
  validatePreferences,
  handleValidationErrors,
  updatePreferences
);

// Data management
router.get("/export-data", exportUserData);
router.delete("/account", deleteAccount);

// Logout
router.post("/logout", logout);

export default router;
