import Notification from "../models/Notification.js";

// Enhanced async error handler
const handleAsyncErrorLocal = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Get user notifications with pagination and filtering
export const getUserNotifications = handleAsyncErrorLocal(async (req, res) => {
  const userId = req.user.id;
  const {
    page = 1,
    limit = 20,
    unreadOnly = false,
    type,
    priority,
  } = req.query;

  const skip = (page - 1) * limit;
  const query = { user: userId, deletedAt: null };

  // Apply filters
  if (unreadOnly === "true") {
    query.isRead = false;
  }
  if (type) {
    query.type = type;
  }
  if (priority) {
    query.priority = priority;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("data.bookingId", "startDate endDate totalAmount status")
    .populate("data.carId", "title images city")
    .populate("data.actionBy", "name email");

  const totalNotifications = await Notification.countDocuments(query);
  const unreadCount = await Notification.getUnreadCount(userId);

  res.status(200).json({
    success: true,
    message: "Notifications retrieved successfully",
    data: {
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalNotifications / limit),
        totalNotifications,
        hasNextPage: page * limit < totalNotifications,
        hasPrevPage: page > 1,
      },
      unreadCount,
    },
  });
});

// Get unread notification count
export const getUnreadCount = handleAsyncErrorLocal(async (req, res) => {
  const userId = req.user.id;
  const unreadCount = await Notification.getUnreadCount(userId);

  res.status(200).json({
    success: true,
    message: "Unread count retrieved successfully",
    data: {
      unreadCount,
    },
  });
});

// Mark notification as read
export const markAsRead = handleAsyncErrorLocal(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId,
    deletedAt: null,
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  if (!notification.isRead) {
    await notification.markAsRead();
  }

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: {
      notification,
    },
  });
});

// Mark all notifications as read
export const markAllAsRead = handleAsyncErrorLocal(async (req, res) => {
  const userId = req.user.id;

  const result = await Notification.markAllAsReadForUser(userId);

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} notifications marked as read`,
    data: {
      modifiedCount: result.modifiedCount,
    },
  });
});

// Delete notification (soft delete)
export const deleteNotification = handleAsyncErrorLocal(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId,
    deletedAt: null,
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  await notification.softDelete();

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
});

// Delete all notifications for user
export const deleteAllNotifications = handleAsyncErrorLocal(async (req, res) => {
  const userId = req.user.id;

  const result = await Notification.updateMany(
    { user: userId, deletedAt: null },
    { deletedAt: new Date() }
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} notifications deleted`,
    data: {
      deletedCount: result.modifiedCount,
    },
  });
});

// Get notification by ID
export const getNotificationById = handleAsyncErrorLocal(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId,
    deletedAt: null,
  })
    .populate("data.bookingId")
    .populate("data.carId")
    .populate("data.actionBy", "name email");

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  // Mark as read if not already read
  if (!notification.isRead) {
    await notification.markAsRead();
  }

  res.status(200).json({
    success: true,
    message: "Notification retrieved successfully",
    data: {
      notification,
    },
  });
});

// Admin: Send system announcement
export const sendSystemAnnouncement = handleAsyncErrorLocal(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }

  const { title, message, priority = "medium", targetUsers } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      success: false,
      message: "Title and message are required",
    });
  }

  let userQuery = { deletedAt: null };
  if (targetUsers && targetUsers.length > 0) {
    userQuery._id = { $in: targetUsers };
  }

  // Get all target users
  const User = (await import("../models/User.js")).default;
  const users = await User.find(userQuery).select("_id");

  // Create notifications for all users
  const notifications = users.map((user) => ({
    user: user._id,
    type: "system_announcement",
    title,
    message,
    priority,
    data: {
      actionBy: req.user.id,
    },
    channels: {
      inApp: true,
      email: priority === "high" || priority === "urgent",
      sms: false,
      push: priority === "high" || priority === "urgent",
    },
  }));

  const createdNotifications = await Notification.insertMany(notifications);

  res.status(201).json({
    success: true,
    message: `System announcement sent to ${createdNotifications.length} users`,
    data: {
      notificationCount: createdNotifications.length,
    },
  });
});

// Admin: Get notification statistics
export const getNotificationStats = handleAsyncErrorLocal(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }

  const stats = await Notification.aggregate([
    {
      $match: { deletedAt: null }
    },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        unreadNotifications: {
          $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] }
        },
        notificationsByType: {
          $push: "$type"
        },
        notificationsByPriority: {
          $push: "$priority"
        }
      }
    }
  ]);

  const typeStats = await Notification.aggregate([
    { $match: { deletedAt: null } },
    { $group: { _id: "$type", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const priorityStats = await Notification.aggregate([
    { $match: { deletedAt: null } },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    success: true,
    message: "Notification statistics retrieved successfully",
    data: {
      overview: stats[0] || {
        totalNotifications: 0,
        unreadNotifications: 0
      },
      typeBreakdown: typeStats,
      priorityBreakdown: priorityStats,
    },
  });
});

// Update notification preferences
export const updateNotificationPreferences = handleAsyncErrorLocal(async (req, res) => {
  const userId = req.user.id;
  const { preferences } = req.body;

  if (!preferences || typeof preferences !== "object") {
    return res.status(400).json({
      success: false,
      message: "Valid preferences object is required",
    });
  }

  const User = (await import("../models/User.js")).default;
  const user = await User.findByIdAndUpdate(
    userId,
    { notificationPreferences: preferences },
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Notification preferences updated successfully",
    data: {
      preferences: user.notificationPreferences,
    },
  });
});

// Helper function to create and send notification (used by other controllers)
export const createAndSendNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    
    // Here you can add logic to send email/SMS/push notifications
    // based on the channels specified in the notification
    
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};