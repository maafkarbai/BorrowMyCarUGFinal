import Stripe from "stripe";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import Notification from "../models/Notification.js";
import { handleAsyncError } from "../utils/errorHandler.js";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Get Stripe Configuration
export const getStripeConfig = handleAsyncError(async (req, res) => {
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    return res.status(500).json({
      success: false,
      message: "Payment system not configured",
      code: "STRIPE_NOT_CONFIGURED",
    });
  }

  res.json({
    success: true,
    data: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      currency: "aed",
      country: "AE",
    },
  });
});

// Process Payment Endpoint (handles cash and card payments only)
export const processPayment = handleAsyncError(async (req, res) => {
  const {
    paymentMethod,
    bookingId,
    amount,
    currency = "aed",
    cashDetails,
    carId,
    carTitle,
    startDate,
    endDate,
    numberOfDays,
  } = req.body;

  console.log("Processing payment:", { paymentMethod, bookingId, amount });

  try {
    let result = {};
    let booking;

    // If bookingId is provided, find existing booking
    if (bookingId && !bookingId.startsWith('temp_')) {
      booking = await Booking.findById(bookingId)
        .populate("car", "title price owner")
        .populate("renter", "name email");

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
          code: "BOOKING_NOT_FOUND",
        });
      }
    }

    // Process based on payment method
    switch (paymentMethod) {
      case "Card":
      case "stripe":
        if (!stripe) {
          return res.status(500).json({
            success: false,
            message: "Card payments not available",
            code: "STRIPE_NOT_CONFIGURED",
          });
        }

        try {
          // Create payment intent with Stripe
          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert AED to fils
            currency: "aed",
            payment_method_types: ["card"],
            metadata: {
              bookingId: bookingId || "temp",
              carId: carId || "",
              carTitle: carTitle || "",
              numberOfDays: numberOfDays || "1",
            },
          });

          result = {
            success: true,
            paymentId: paymentIntent.id,
            paymentMethod: "Card",
            status: "completed",
            amount: amount,
            currency: currency,
            clientSecret: paymentIntent.client_secret,
          };

          // Update booking if it exists
          if (booking) {
            booking.paymentStatus = "paid";
            booking.paymentMethod = "Card";
            booking.status = "confirmed";
            booking.paidAt = new Date();
            await booking.save();

            // Send payment success notification
            try {
              await Notification.createPaymentNotification(
                booking.renter,
                "payment_successful",
                booking.totalAmount,
                booking._id
              );
            } catch (notificationError) {
              console.error("Failed to send payment success notification:", notificationError);
            }
          }
        } catch (stripeError) {
          console.error("Stripe error:", stripeError);
          return res.status(400).json({
            success: false,
            message: stripeError.message,
            code: "STRIPE_ERROR",
          });
        }
        break;

      case "Cash":
      case "cash_on_pickup":
        if (!cashDetails) {
          return res.status(400).json({
            success: false,
            message: "Cash payment details are required",
            code: "MISSING_CASH_DETAILS",
          });
        }

        result = {
          success: true,
          paymentId: `cash_${Date.now()}`,
          paymentMethod: "Cash",
          status: "pending_pickup",
          meetingDetails: {
            location: cashDetails.meetingLocation,
            time: cashDetails.meetingTime,
            notes: cashDetails.notes,
            amount: amount,
            currency: currency,
          },
        };

        // Update booking if it exists
        if (booking) {
          booking.paymentStatus = "pending";
          booking.paymentMethod = "Cash";
          booking.status = "approved";
          booking.pickupLocation = cashDetails.meetingLocation;
          await booking.save();
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported payment method. Only cash and card payments are accepted.",
          code: "INVALID_PAYMENT_METHOD",
        });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({
      success: false,
      message: "Payment processing failed",
      error: error.message,
      code: "PAYMENT_PROCESSING_ERROR",
    });
  }
});

// Create Payment Intent (Stripe specific)
export const createPaymentIntent = handleAsyncError(async (req, res) => {
  const { bookingId, amount, currency = "aed" } = req.body;

  if (!stripe) {
    return res.status(500).json({
      success: false,
      message: "Stripe not configured",
      code: "STRIPE_NOT_CONFIGURED",
    });
  }

  try {
    let bookingAmount = amount;

    // If bookingId is provided, get amount from booking
    if (bookingId && !bookingId.startsWith("temp_")) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        bookingAmount = booking.totalPayable;
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(bookingAmount * 100), // Convert to fils
      currency: currency,
      payment_method_types: ["card"],
      metadata: {
        bookingId: bookingId || "temp",
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: bookingAmount,
        currency: currency,
      },
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      code: "PAYMENT_INTENT_ERROR",
    });
  }
});

// Confirm Payment
export const confirmPayment = handleAsyncError(async (req, res) => {
  const { paymentIntentId, bookingId } = req.body;

  try {
    let booking;

    if (bookingId && !bookingId.startsWith("temp_")) {
      booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
          code: "BOOKING_NOT_FOUND",
        });
      }

      // Update booking status
      booking.status = "confirmed";
      booking.paymentStatus = "paid";
      booking.paidAt = new Date();
      booking.transactionId = paymentIntentId;
      await booking.save();

      // Send payment success notification
      try {
        await Notification.createPaymentNotification(
          booking.renter,
          "payment_successful",
          booking.totalAmount,
          booking._id
        );
      } catch (notificationError) {
        console.error("Failed to send payment success notification:", notificationError);
      }
    }

    res.json({
      success: true,
      message: "Payment confirmed successfully",
      data: { booking },
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      code: "PAYMENT_CONFIRMATION_ERROR",
    });
  }
});

// Get Payment History
export const getPaymentHistory = handleAsyncError(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const bookings = await Booking.find({
      renter: req.user.id,
      paymentStatus: { $ne: "pending" },
    })
      .populate("car", "title make model images")
      .sort({ paidAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments({
      renter: req.user.id,
      paymentStatus: { $ne: "pending" },
    });

    res.json({
      success: true,
      data: {
        payments: bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCount: total,
          hasNext: parseInt(page) < Math.ceil(total / limit),
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      code: "PAYMENT_HISTORY_ERROR",
    });
  }
});

// Get Saved Payment Methods
export const getSavedPaymentMethods = handleAsyncError(async (req, res) => {
  // For demo purposes, return empty array
  // In a real app, you'd fetch from Stripe Customer API
  res.json({
    success: true,
    data: {
      cards: [], // Would contain saved cards from Stripe
    },
  });
});

// Delete Saved Payment Method
export const deleteSavedPaymentMethod = handleAsyncError(async (req, res) => {
  const { paymentMethodId } = req.params;

  // For demo purposes
  res.json({
    success: true,
    message: "Payment method deleted successfully",
  });
});

// Refund Payment
export const refundPayment = handleAsyncError(async (req, res) => {
  const { paymentId } = req.params;
  const { amount, reason } = req.body;

  if (!stripe) {
    return res.status(500).json({
      success: false,
      message: "Stripe not configured",
      code: "STRIPE_NOT_CONFIGURED",
    });
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason || "requested_by_customer",
    });

    res.json({
      success: true,
      message: "Refund processed successfully",
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
    });
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      code: "REFUND_ERROR",
    });
  }
});

// Webhook Handler
export const handleStripeWebhook = handleAsyncError(async (req, res) => {
  const sig = req.headers["stripe-signature"];

  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.json({ received: true });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);
        // Update booking status based on metadata
        if (
          paymentIntent.metadata.bookingId &&
          !paymentIntent.metadata.bookingId.startsWith("temp_")
        ) {
          const booking = await Booking.findById(
            paymentIntent.metadata.bookingId
          );
          if (booking) {
            booking.status = "confirmed";
            booking.paymentStatus = "paid";
            booking.paidAt = new Date();
            booking.transactionId = paymentIntent.id;
            await booking.save();

            // Send payment success notification
            try {
              await Notification.createPaymentNotification(
                booking.renter,
                "payment_successful",
                booking.totalAmount,
                booking._id
              );
            } catch (notificationError) {
              console.error("Failed to send payment success notification:", notificationError);
            }
          }
        }
        break;
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.log("Payment failed:", failedPayment.id);
        
        // Send payment failure notification
        if (
          failedPayment.metadata.bookingId &&
          !failedPayment.metadata.bookingId.startsWith("temp_")
        ) {
          try {
            const booking = await Booking.findById(failedPayment.metadata.bookingId);
            if (booking) {
              await Notification.createPaymentNotification(
                booking.renter,
                "payment_failed",
                booking.totalAmount,
                booking._id
              );
            }
          } catch (notificationError) {
            console.error("Failed to send payment failure notification:", notificationError);
          }
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});