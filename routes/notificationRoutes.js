import express from "express";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationById,
  sendSystemAnnouncement,
  getNotificationStats,
  updateNotificationPreferences,
} from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/notifications - Get user notifications with pagination and filtering
router.get("/", getUserNotifications);

// GET /api/notifications/unread-count - Get unread notification count
router.get("/unread-count", getUnreadCount);

// GET /api/notifications/stats - Admin only: Get notification statistics
router.get("/stats", getNotificationStats);

// GET /api/notifications/:notificationId - Get specific notification
router.get("/:notificationId", getNotificationById);

// PUT /api/notifications/:notificationId/read - Mark notification as read
router.put("/:notificationId/read", markAsRead);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put("/read-all", markAllAsRead);

// PUT /api/notifications/preferences - Update notification preferences
router.put("/preferences", updateNotificationPreferences);

// DELETE /api/notifications/:notificationId - Delete specific notification
router.delete("/:notificationId", deleteNotification);

// DELETE /api/notifications - Delete all notifications for user
router.delete("/", deleteAllNotifications);

// POST /api/notifications/system-announcement - Admin only: Send system announcement
router.post("/system-announcement", sendSystemAnnouncement);

export default router;