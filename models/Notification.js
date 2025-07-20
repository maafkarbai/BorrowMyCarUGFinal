import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "account_approved",
        "account_rejected",
        "booking_created",
        "booking_approved",
        "booking_rejected",
        "booking_completed",
        "booking_cancelled",
        "payment_successful",
        "payment_failed",
        "car_approved",
        "car_rejected",
        "car_listing_request",
        "new_booking_request",
        "reminder",
        "system_announcement",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    // Additional data specific to notification type
    data: {
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
      carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
      },
      amount: {
        type: Number,
      },
      // For admin actions
      actionBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rejectionReason: {
        type: String,
      },
      // For redirecting user to specific page
      redirectUrl: {
        type: String,
      },
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    // For scheduled notifications
    scheduledFor: {
      type: Date,
    },
    isSent: {
      type: Boolean,
      default: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    // Notification channels
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
    },
    // For email/sms delivery tracking
    deliveryStatus: {
      email: {
        sent: { type: Boolean, default: false },
        sentAt: { type: Date },
        error: { type: String },
      },
      sms: {
        sent: { type: Boolean, default: false },
        sentAt: { type: Date },
        error: { type: String },
      },
      push: {
        sent: { type: Boolean, default: false },
        sentAt: { type: Date },
        error: { type: String },
      },
    },
    // Soft delete
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
notificationSchema.index({ user: 1, createdAt: -1 }); // User notifications ordered by date
notificationSchema.index({ user: 1, isRead: 1 }); // Unread notifications
notificationSchema.index({ user: 1, type: 1 }); // Notifications by type
notificationSchema.index({ deletedAt: 1 }); // Soft delete
notificationSchema.index({ scheduledFor: 1, isSent: 1 }); // Scheduled notifications
notificationSchema.index({ priority: 1, createdAt: -1 }); // Priority notifications

// Pre-save middleware to set readAt when isRead changes to true
notificationSchema.pre("save", function (next) {
  if (this.isModified("isRead") && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Hide deleted notifications in queries
notificationSchema.pre(/^find/, function (next) {
  this.find({ deletedAt: null });
  next();
});

// Static method to create different types of notifications
notificationSchema.statics.createAccountApprovalNotification = function (userId) {
  return this.create({
    user: userId,
    type: "account_approved",
    title: "Account Approved! 🎉",
    message: "Your account has been approved! You can now start using BorrowMyCar.",
    priority: "high",
    data: {
      redirectUrl: "/profile",
    },
    channels: {
      inApp: true,
      email: true,
      sms: false,
      push: true,
    },
  });
};

notificationSchema.statics.createAccountRejectionNotification = function (
  userId,
  reason
) {
  return this.create({
    user: userId,
    type: "account_rejected",
    title: "Account Verification Required",
    message: `Your account verification was not successful. ${reason}`,
    priority: "high",
    data: {
      rejectionReason: reason,
      redirectUrl: "/profile",
    },
    channels: {
      inApp: true,
      email: true,
      sms: false,
      push: true,
    },
  });
};

notificationSchema.statics.createBookingNotification = function (
  userId,
  type,
  bookingId,
  carTitle,
  additionalData = {}
) {
  const notifications = {
    booking_created: {
      title: "Booking Request Sent! 📋",
      message: `Your booking request for "${carTitle}" has been sent to the owner.`,
      priority: "medium",
    },
    booking_approved: {
      title: "Booking Approved! ✅",
      message: `Your booking for "${carTitle}" has been approved!`,
      priority: "high",
    },
    booking_rejected: {
      title: "Booking Declined",
      message: `Unfortunately, your booking for "${carTitle}" was declined.`,
      priority: "medium",
    },
    booking_completed: {
      title: "Trip Completed! 🚗",
      message: `Your trip with "${carTitle}" has been completed. Please rate your experience.`,
      priority: "medium",
    },
    booking_cancelled: {
      title: "Booking Cancelled",
      message: `Your booking for "${carTitle}" has been cancelled.`,
      priority: "medium",
    },
    new_booking_request: {
      title: "New Booking Request! 🔔",
      message: `You have a new booking request for your "${carTitle}".`,
      priority: "high",
    },
  };

  const notificationData = notifications[type];
  if (!notificationData) {
    throw new Error(`Invalid notification type: ${type}`);
  }

  return this.create({
    user: userId,
    type,
    title: notificationData.title,
    message: notificationData.message,
    priority: notificationData.priority,
    data: {
      bookingId,
      ...additionalData,
      redirectUrl: "/my-bookings",
    },
    channels: {
      inApp: true,
      email: true,
      sms: true,
      push: true,
    },
  });
};

notificationSchema.statics.createPaymentNotification = function (
  userId,
  type,
  amount,
  bookingId,
  additionalData = {}
) {
  const notifications = {
    payment_successful: {
      title: "Payment Successful! 💳",
      message: `Your payment of AED ${amount} has been processed successfully.`,
      priority: "medium",
    },
    payment_failed: {
      title: "Payment Failed",
      message: `Your payment of AED ${amount} could not be processed. Please try again.`,
      priority: "high",
    },
  };

  const notificationData = notifications[type];
  if (!notificationData) {
    throw new Error(`Invalid payment notification type: ${type}`);
  }

  return this.create({
    user: userId,
    type,
    title: notificationData.title,
    message: notificationData.message,
    priority: notificationData.priority,
    data: {
      bookingId,
      amount,
      ...additionalData,
      redirectUrl: "/my-bookings",
    },
    channels: {
      inApp: true,
      email: true,
      sms: false,
      push: true,
    },
  });
};

notificationSchema.statics.createCarListingRequestNotification = function (
  userId,
  carData
) {
  return this.create({
    user: userId,
    type: "car_listing_request",
    title: "Car Listing Request Submitted! 🚗",
    message: `Your ${carData.title} has been submitted for review. Our team will approve your listing within 24 hours and you'll receive a notification once it's live on the platform.`,
    priority: "medium",
    data: {
      carId: carData._id,
      carTitle: carData.title,
      carMake: carData.make,
      carModel: carData.model,
      carYear: carData.year,
      carPrice: carData.price,
      carCity: carData.city,
      redirectUrl: "/seller/listings",
    },
    channels: {
      inApp: true,
      email: true,
      sms: false,
      push: true,
    },
  });
};

// Instance methods
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  return this.save();
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({
    user: userId,
    isRead: false,
    deletedAt: null,
  });
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsReadForUser = function (userId) {
  return this.updateMany(
    { user: userId, isRead: false, deletedAt: null },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to get user notifications with pagination
notificationSchema.statics.getUserNotifications = function (
  userId,
  options = {}
) {
  const { page = 1, limit = 20, unreadOnly = false } = options;
  const skip = (page - 1) * limit;

  const query = { user: userId, deletedAt: null };
  if (unreadOnly) {
    query.isRead = false;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("data.bookingId", "startDate endDate totalAmount")
    .populate("data.carId", "title images")
    .populate("data.actionBy", "name");
};

// Ensure virtual fields are serialized
notificationSchema.set("toJSON", { virtuals: true });
notificationSchema.set("toObject", { virtuals: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;