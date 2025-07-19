// routes/paymentRoutes.js - COMPLETE FIXED VERSION
import express from "express";
import {
  getStripeConfig,
  processPayment,
  createPaymentIntent,
  confirmPayment,
  handleStripeWebhook,
  getPaymentHistory,
  getSavedPaymentMethods,
  deleteSavedPaymentMethod,
  refundPayment,
} from "../controllers/paymentController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { body, param } from "express-validator";
import { handleValidationErrors } from "../utils/validators.js";

const router = express.Router();

// PUBLIC ROUTES

// Webhook route (MUST be before express.json middleware)
router.post("/webhook", handleStripeWebhook);

// Get Stripe configuration (public)
router.get("/stripe-config", getStripeConfig);

// PROTECTED ROUTES
router.use(protect); // All routes below require authentication

// MAIN Payment Processing Route (handles all payment methods)
router.post(
  "/process",
  [
    body("paymentMethod")
      .isIn(["stripe", "cash_on_pickup", "Cash", "Card"])
      .withMessage("Invalid payment method"),
    body("amount")
      .isFloat({ min: 50, max: 50000 })
      .withMessage("Amount must be between 50 and 50,000 AED"),
    body("currency")
      .optional()
      .isIn(["aed", "AED"])
      .withMessage("Currency must be AED"),
    // Conditional validation based on payment method
    body("cardDetails")
      .if(body("paymentMethod").isIn(["stripe", "Card"]))
      .notEmpty(),
    body("cashDetails")
      .if(body("paymentMethod").isIn(["cash_on_pickup", "Cash"]))
      .notEmpty(),
  ],
  handleValidationErrors,
  processPayment
);

// Stripe-specific routes
router.post(
  "/create-intent",
  restrictTo("renter"),
  [
    body("bookingId")
      .optional()
      .isMongoId()
      .withMessage("Valid booking ID required"),
    body("amount")
      .optional()
      .isFloat({ min: 50 })
      .withMessage("Amount must be at least 50 AED"),
  ],
  handleValidationErrors,
  createPaymentIntent
);

router.post(
  "/confirm",
  restrictTo("renter"),
  [
    body("paymentIntentId")
      .notEmpty()
      .withMessage("Payment intent ID required"),
    body("bookingId")
      .optional()
      .isMongoId()
      .withMessage("Valid booking ID required"),
  ],
  handleValidationErrors,
  confirmPayment
);

// Payment method management
router.get("/saved-methods", getSavedPaymentMethods);
router.get("/saved-cards", getSavedPaymentMethods); // Alias for compatibility

router.delete(
  "/saved-methods/:paymentMethodId",
  [
    param("paymentMethodId")
      .notEmpty()
      .withMessage("Payment method ID required"),
  ],
  handleValidationErrors,
  deleteSavedPaymentMethod
);

// Payment history
router.get("/history", getPaymentHistory);

// Refund routes (for admins and in specific cases)
router.post(
  "/:paymentId/refund",
  [
    body("amount")
      .optional()
      .isFloat({ min: 1 })
      .withMessage("Refund amount must be positive"),
    body("reason")
      .optional()
      .isLength({ min: 5, max: 200 })
      .withMessage("Reason must be between 5 and 200 characters"),
  ],
  handleValidationErrors,
  refundPayment
);

// Legacy/compatibility routes (for old frontend implementations)
router.post("/create-payment-intent", createPaymentIntent); // Alternative name
router.post("/stripe-payment", processPayment); // Legacy stripe-specific route

export default router;
