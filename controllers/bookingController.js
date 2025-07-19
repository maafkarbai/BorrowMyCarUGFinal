// controllers/bookingController.js (Fixed Imports)
import Booking from "../models/Booking.js"; // Default import
import Car from "../models/Car.js"; // Default import
import Notification from "../models/Notification.js"; // Default import

import { handleAsyncError } from "../utils/errorHandler.js";

// Check for booking conflicts
const checkBookingConflicts = async (
  carId,
  startDate,
  endDate,
  excludeBookingId = null
) => {
  const requestStart = new Date(startDate);
  const requestEnd = new Date(endDate);
  
  const filter = {
    car: carId,
    status: { $in: ["pending", "approved", "confirmed", "active"] },
    $and: [
      { startDate: { $lt: requestEnd } },
      { endDate: { $gt: requestStart } }
    ]
  };

  if (excludeBookingId) {
    filter._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(filter);
  return conflictingBooking;
};

// Calculate booking pricing
const calculateBookingPricing = (
  car,
  startDate,
  endDate,
  deliveryRequested = false
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  const dailyRate = car.price;
  const totalAmount = dailyRate * totalDays;
  const securityDeposit = car.securityDeposit || 0;
  const deliveryFee = deliveryRequested ? car.deliveryFee || 0 : 0;
  const totalPayable = totalAmount + securityDeposit + deliveryFee;

  return {
    totalDays,
    dailyRate,
    totalAmount,
    securityDeposit,
    deliveryFee,
    totalPayable,
  };
};

// CREATE BOOKING
export const createBooking = handleAsyncError(async (req, res) => {
  const user = req.user;
  const {
    carId,
    startDate,
    endDate,
    paymentMethod = "Cash",
    pickupLocation,
    returnLocation,
    deliveryRequested = false,
    deliveryAddress,
    renterNotes,
  } = req.body;

  // Basic validation
  if (!carId || !startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: carId, startDate, endDate",
    });
  }

  // Check if user is approved
  if (!user.isApproved) {
    return res.status(403).json({
      success: false,
      message: "Your account must be approved before making bookings",
      code: "ACCOUNT_NOT_APPROVED",
    });
  }

  try {
    // Get car details
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    // Check if car is available
    if (car.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Car is not available for booking",
      });
    }

    // Check if car has valid insurance
    if (car.hasInsurance) {
      const today = new Date();
      const insuranceExpiryDate = new Date(car.insuranceExpiryDate);
      
      if (insuranceExpiryDate <= today) {
        return res.status(400).json({
          success: false,
          message: "This car's insurance has expired. Booking is not available.",
          code: "INSURANCE_EXPIRED",
        });
      }
    } else {
      // If you want to enforce insurance requirement, uncomment the following:
      // return res.status(400).json({
      //   success: false,
      //   message: "This car does not have insurance coverage. Booking is not available.",
      //   code: "NO_INSURANCE",
      // });
      
      // For now, we'll allow bookings but warn the user
      console.warn(`Booking created for uninsured car: ${carId}`);
    }

    // Check if dates are within car availability range
    const requestStart = new Date(startDate);
    const requestEnd = new Date(endDate);
    const carAvailableFrom = new Date(car.availabilityFrom);
    const carAvailableTo = new Date(car.availabilityTo);

    if (requestStart < carAvailableFrom || requestEnd > carAvailableTo) {
      return res.status(400).json({
        success: false,
        message: `Selected dates must be between ${carAvailableFrom.toDateString()} and ${carAvailableTo.toDateString()}`,
      });
    }

    // Ensure user is not booking their own car
    if (car.owner.toString() === user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own car",
      });
    }

    // Check for booking conflicts
    const conflict = await checkBookingConflicts(carId, startDate, endDate);
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Car is not available for the selected dates",
        conflictingBooking: conflict._id,
      });
    }

    // Calculate pricing
    const pricing = calculateBookingPricing(
      car,
      startDate,
      endDate,
      deliveryRequested
    );

    // Create booking
    const booking = new Booking({
      renter: user.id,
      car: carId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalDays: pricing.totalDays,
      dailyRate: pricing.dailyRate,
      totalAmount: pricing.totalAmount,
      securityDeposit: pricing.securityDeposit,
      deliveryFee: pricing.deliveryFee,
      totalPayable: pricing.totalPayable,
      paymentMethod,
      pickupLocation: pickupLocation || "To be determined",
      returnLocation: returnLocation || "To be determined",
      deliveryRequested,
      deliveryAddress,
      renterNotes: renterNotes || "",
    });

    const savedBooking = await booking.save();

    // Send notifications
    try {
      // Notify renter about booking creation
      await Notification.createBookingNotification(
        user.id,
        "booking_created",
        savedBooking._id,
        car.title,
        { carId: car._id }
      );

      // Notify owner about new booking request
      await Notification.createBookingNotification(
        car.owner,
        "new_booking_request",
        savedBooking._id,
        car.title,
        { carId: car._id }
      );
    } catch (notificationError) {
      console.error("Failed to send booking notifications:", notificationError);
      // Continue with the response even if notification fails
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: { booking: savedBooking },
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    });
  }
});

// GET MY BOOKINGS
export const getMyBookings = handleAsyncError(async (req, res) => {
  try {
    // Get bookings based on user role
    let bookings;
    if (req.user.role === "owner") {
      // For owners, show bookings for their cars
      const ownedCars = await Car.find({ owner: req.user.id }).select("_id");
      const carIds = ownedCars.map((car) => car._id);
      
      bookings = await Booking.find({ car: { $in: carIds } })
        .populate("car", "title make model year price images city")
        .populate("renter", "name email phone")
        .sort({ createdAt: -1 });
    } else {
      // For renters, show their bookings
      bookings = await Booking.find({ renter: req.user.id })
        .populate("car", "title make model year price images city")
        .populate({
          path: "car",
          populate: {
            path: "owner",
            select: "name email phone"
          }
        })
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      data: { bookings },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
});

// GET BOOKINGS FOR OWNER
export const getBookingsForOwner = handleAsyncError(async (req, res) => {
  try {
    // Check if user is an owner
    if (req.user.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only car owners can access this endpoint",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }

    // Get all cars owned by the user
    const ownedCars = await Car.find({ owner: req.user.id }).select("_id");
    const carIds = ownedCars.map((car) => car._id);

    const bookings = await Booking.find({ car: { $in: carIds } })
      .populate("car", "title make model year price images city")
      .populate("renter", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { bookings },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch owner bookings",
      error: error.message,
    });
  }
});

// UPDATE BOOKING STATUS
export const updateBookingStatus = handleAsyncError(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const booking = await Booking.findById(id).populate("car");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Enhanced authorization check
    const isOwner = booking.car.owner.toString() === req.user.id;
    const isRenter = booking.renter.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isRenter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }

    // Additional business logic checks
    if (isRenter && !["cancelled"].includes(status)) {
      return res.status(403).json({
        success: false,
        message: "Renters can only cancel bookings",
        code: "INVALID_STATUS_CHANGE",
      });
    }

    if (isOwner && status === "cancelled" && booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Owners cannot cancel bookings that are already approved",
        code: "INVALID_STATUS_CHANGE",
      });
    }

    // Update booking status
    booking.status = status;
    await booking.save();

    // Send notifications based on status change
    try {
      if (status === "approved") {
        // Notify renter about booking approval
        await Notification.createBookingNotification(
          booking.renter,
          "booking_approved",
          booking._id,
          booking.car.title,
          { carId: booking.car._id }
        );
      } else if (status === "rejected") {
        // Notify renter about booking rejection
        await Notification.createBookingNotification(
          booking.renter,
          "booking_rejected",
          booking._id,
          booking.car.title,
          { carId: booking.car._id }
        );
      } else if (status === "completed") {
        // Notify both renter and owner about completion
        await Notification.createBookingNotification(
          booking.renter,
          "booking_completed",
          booking._id,
          booking.car.title,
          { carId: booking.car._id }
        );
        // Note: Owner can also get a completion notification if needed
      } else if (status === "cancelled") {
        // Notify the other party about cancellation
        const notificationReceiver = isRenter ? booking.car.owner : booking.renter;
        await Notification.createBookingNotification(
          notificationReceiver,
          "booking_cancelled",
          booking._id,
          booking.car.title,
          { carId: booking.car._id }
        );
      }
    } catch (notificationError) {
      console.error("Failed to send booking status notifications:", notificationError);
      // Continue with the response even if notification fails
    }

    res.json({
      success: true,
      message: "Booking status updated successfully",
      data: { booking },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update booking status",
      error: error.message,
    });
  }
});

// GET SINGLE BOOKING
export const getBookingById = handleAsyncError(async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id)
      .populate("car", "title make model year price images city")
      .populate("renter", "name email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
});

// CANCEL BOOKING
export const cancelBooking = handleAsyncError(async (req, res) => {
  const { id } = req.params;
  const { cancellationReason } = req.body;

  try {
    const booking = await Booking.findById(id).populate("car");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        code: "BOOKING_NOT_FOUND",
      });
    }

    // Authorization check - only renter, owner, or admin can cancel
    const isOwner = booking.car.owner.toString() === req.user.id;
    const isRenter = booking.renter.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isRenter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }

    // Business logic checks
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
        code: "ALREADY_CANCELLED",
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed booking",
        code: "BOOKING_COMPLETED",
      });
    }

    // Additional restrictions for owners
    if (isOwner && booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Owners can only cancel pending bookings",
        code: "INVALID_STATUS_CHANGE",
      });
    }

    // Update booking with cancellation details
    booking.status = "cancelled";
    booking.cancelledBy = isRenter ? "renter" : isOwner ? "owner" : "admin";
    if (cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }
    await booking.save();

    // Send cancellation notifications
    try {
      if (isRenter) {
        // Notify owner about renter cancellation
        await Notification.createBookingNotification(
          booking.car.owner,
          "booking_cancelled",
          booking._id,
          booking.car.title,
          { carId: booking.car._id }
        );
      } else if (isOwner) {
        // Notify renter about owner cancellation
        await Notification.createBookingNotification(
          booking.renter,
          "booking_cancelled",
          booking._id,
          booking.car.title,
          { carId: booking.car._id }
        );
      } else if (isAdmin) {
        // Notify both parties about admin cancellation
        await Notification.createBookingNotification(
          booking.renter,
          "booking_cancelled",
          booking._id,
          booking.car.title,
          { carId: booking.car._id }
        );
        await Notification.createBookingNotification(
          booking.car.owner,
          "booking_cancelled",
          booking._id,
          booking.car.title,
          { carId: booking.car._id }
        );
      }
    } catch (notificationError) {
      console.error("Failed to send cancellation notifications:", notificationError);
      // Continue with the response even if notification fails
    }

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: { booking },
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message,
      code: "CANCELLATION_ERROR",
    });
  }
});

// ADD REVIEW
export const addReview = handleAsyncError(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Simple review logic - you can enhance this
    const reviewData = {
      rating: parseInt(rating),
      comment: comment || "",
      reviewedAt: new Date(),
    };

    // Determine if this is renter or owner review
    const isRenter = booking.renter.toString() === req.user.id;

    if (isRenter) {
      booking.renterReview = reviewData;
    } else {
      booking.ownerReview = reviewData;
    }

    await booking.save();

    res.json({
      success: true,
      message: "Review added successfully",
      data: { booking },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add review",
      error: error.message,
    });
  }
});
