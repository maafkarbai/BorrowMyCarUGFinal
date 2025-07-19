// routes/bookingRoutes.js - FIXED VERSION
import express from "express";
import {
  createBooking,
  getMyBookings,
  getBookingsForOwner,
  updateBookingStatus,
  getBookingById,
  cancelBooking,
  addReview,
} from "../controllers/bookingController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import {
  validateCreateBooking,
  validateUpdateBookingStatus,
  validateAddReview,
  handleValidationErrors,
} from "../utils/validators.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// POST /api/bookings - Create new booking (authenticated users only, role checked in controller)
router.post(
  "/",
  validateCreateBooking,
  handleValidationErrors,
  createBooking
);

// GET /api/bookings/me - Get my bookings (any authenticated user)
router.get("/me", getMyBookings);

// GET /api/bookings/owner - Get bookings for my cars (any authenticated user, role checked in controller)
router.get("/owner", getBookingsForOwner);

// GET /api/bookings/:id - Get single booking details
router.get("/:id", getBookingById);

// PUT /api/bookings/:id - Update booking status (owner can approve/reject, renter can cancel)
router.put(
  "/:id",
  validateUpdateBookingStatus,
  handleValidationErrors,
  updateBookingStatus
);

// PATCH /api/bookings/:id/cancel - Cancel booking
router.patch("/:id/cancel", cancelBooking);

// POST /api/bookings/:id/review - Add review to completed booking
router.post(
  "/:id/review",
  validateAddReview,
  handleValidationErrors,
  addReview
);

export default router;
