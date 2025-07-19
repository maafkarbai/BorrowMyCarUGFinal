// routes/adminRoutes.js - Admin panel routes
import express from "express";
import {
  getAdminStats,
  getAllUsers,
  updateUserApproval,
  modifyUser,
  blockUser,
  getAllCars,
  updateCarApproval,
  getAllBookings,
  deleteUser,
  deleteCar,
  verifyDrivingLicense,
  getUserDetails,
  bulkUserActions,
  getAdminActivityLog,
  getSystemConfig,
  updateSystemConfig,
  exportData,
} from "../controllers/adminController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { body } from "express-validator";
import { handleValidationErrors } from "../utils/validators.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo("admin"));

// Dashboard stats
router.get("/stats", getAdminStats);

// User management
router.get("/users", getAllUsers);
router.patch(
  "/users/:userId/approval",
  [
    body("isApproved").isBoolean().withMessage("isApproved must be boolean"),
    body("reason")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Reason must be less than 500 characters"),
  ],
  handleValidationErrors,
  updateUserApproval
);
// Simplified approve/reject endpoints for frontend
router.patch("/users/:userId/approve", updateUserApproval);
router.patch("/users/:userId/reject", updateUserApproval);

// Modify user endpoint
router.put(
  "/users/:userId",
  [
    body("name").optional().trim().notEmpty().withMessage("Name is required"),
    body("email").optional().isEmail().withMessage("Invalid email"),
    body("phone").optional().matches(/^[0-9+()-\s]+$/).withMessage("Invalid phone number"),
    body("role").optional().isIn(["renter", "owner", "admin"]).withMessage("Invalid role"),
    body("preferredCity").optional().isIn([
      "Dubai", "Abu Dhabi", "Sharjah", "Ajman",
      "Fujairah", "Ras Al Khaimah", "Umm Al Quwain"
    ]).withMessage("Invalid city"),
    body("isApproved").optional().isBoolean().withMessage("isApproved must be boolean"),
  ],
  handleValidationErrors,
  modifyUser
);

// Block/unblock user endpoint
router.patch(
  "/users/:userId/block",
  [
    body("isBlocked").isBoolean().withMessage("isBlocked must be boolean"),
    body("blockReason")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Block reason must be less than 500 characters"),
  ],
  handleValidationErrors,
  blockUser
);

router.delete("/users/:userId", deleteUser);

// Car management
router.get("/cars", getAllCars);
router.patch(
  "/cars/:carId/approval",
  [
    body("status")
      .isIn(["active", "rejected", "pending"])
      .withMessage("Status must be active, rejected, or pending"),
    body("reason")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Reason must be less than 500 characters"),
    body("adminNotes")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Admin notes must be less than 1000 characters"),
  ],
  handleValidationErrors,
  updateCarApproval
);
router.delete("/cars/:carId", deleteCar);

// Booking management
router.get("/bookings", getAllBookings);

// Document verification
router.patch(
  "/users/:userId/verify-license",
  [
    body("verified").isBoolean().withMessage("verified must be boolean"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes must be less than 500 characters"),
  ],
  handleValidationErrors,
  verifyDrivingLicense
);

// Enhanced user management
router.get("/users/:userId/details", getUserDetails);
router.post(
  "/users/bulk-actions",
  [
    body("userIds").isArray({ min: 1 }).withMessage("User IDs array is required"),
    body("action")
      .isIn(["approve", "reject", "delete"])
      .withMessage("Action must be approve, reject, or delete"),
    body("reason")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Reason must be less than 500 characters"),
  ],
  handleValidationErrors,
  bulkUserActions
);

// Admin activity and reporting
router.get("/activity-log", getAdminActivityLog);
router.get("/export", exportData);

// System configuration
router.get("/config", getSystemConfig);
router.patch(
  "/config",
  [
    body("autoApproval").optional().isBoolean(),
    body("maintenanceMode").optional().isBoolean(),
    body("registrationOpen").optional().isBoolean(),
  ],
  handleValidationErrors,
  updateSystemConfig
);

export default router;