import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import API from "../api";

const NotificationContext = createContext();

const notificationReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_NOTIFICATIONS":
      return {
        ...state,
        notifications: action.payload.notifications,
        pagination: action.payload.pagination,
        loading: false,
      };
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case "MARK_AS_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification._id === action.payload
            ? { ...notification, isRead: true, readAt: new Date() }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case "MARK_ALL_AS_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: new Date(),
        })),
        unreadCount: 0,
      };
    case "DELETE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification._id !== action.payload
        ),
      };
    case "DELETE_ALL_NOTIFICATIONS":
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    case "SET_UNREAD_COUNT":
      return { ...state, unreadCount: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "UPDATE_PREFERENCES":
      return { ...state, preferences: action.payload };
    default:
      return state;
  }
};

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalNotifications: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  preferences: {
    emailBookings: true,
    emailPromotions: false,
    smsBookings: true,
    smsReminders: true,
    pushNotifications: true,
  },
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1, unreadOnly = false) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await API.get(`/notifications?page=${page}&unreadOnly=${unreadOnly}`);
      
      if (response.data.success) {
        dispatch({
          type: "SET_NOTIFICATIONS",
          payload: response.data.data,
        });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error.response?.data?.message || "Failed to fetch notifications",
      });
    }
  }, []);

  // Get unread count
  const getUnreadCount = async () => {
    try {
      const response = await API.get("/notifications/unread-count");
      if (response.data.success) {
        dispatch({
          type: "SET_UNREAD_COUNT",
          payload: response.data.data.unreadCount,
        });
      }
    } catch (error) {
      console.error("Failed to get unread count:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await API.put(`/notifications/${notificationId}/read`);
      if (response.data.success) {
        dispatch({ type: "MARK_AS_READ", payload: notificationId });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error.response?.data?.message || "Failed to mark notification as read",
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await API.put("/notifications/read-all");
      if (response.data.success) {
        dispatch({ type: "MARK_ALL_AS_READ" });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error.response?.data?.message || "Failed to mark all notifications as read",
      });
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await API.delete(`/notifications/${notificationId}`);
      if (response.data.success) {
        dispatch({ type: "DELETE_NOTIFICATION", payload: notificationId });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error.response?.data?.message || "Failed to delete notification",
      });
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    try {
      const response = await API.delete("/notifications");
      if (response.data.success) {
        dispatch({ type: "DELETE_ALL_NOTIFICATIONS" });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error.response?.data?.message || "Failed to delete all notifications",
      });
    }
  };

  // Update notification preferences
  const updatePreferences = async (preferences) => {
    try {
      const response = await API.put("/notifications/preferences", {
        preferences,
      });
      if (response.data.success) {
        dispatch({ type: "UPDATE_PREFERENCES", payload: preferences });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error.response?.data?.message || "Failed to update preferences",
      });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Poll for new notifications (every 30 seconds when user is authenticated)
  useEffect(() => {
    let pollInterval;
    
    // Only poll if user is authenticated (checking for token)
    const token = localStorage.getItem('token');
    if (token) {
      pollInterval = setInterval(() => {
        getUnreadCount();
      }, 30000); // Poll every 30 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []);

  // Poll more frequently when page is visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh count when user returns to page
        getUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Initial fetch of unread count
  useEffect(() => {
    getUnreadCount();
  }, []);

  const value = {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    preferences: state.preferences,

    // Actions
    fetchNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    updatePreferences,
    clearError,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

export default NotificationContext;