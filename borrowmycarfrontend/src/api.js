// borrowmycarfrontend/src/api.js - Fixed API client
import axios from "axios";

// Create API instance with cookie-based authentication
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 30000, // 30 second timeout
  withCredentials: true, // Include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Cookie-based authentication - no token handling needed
// Cookies are automatically sent with requests

// Request interceptor for cookie-based auth
API.interceptors.request.use(
  (req) => {
    // Cookies are automatically included - no manual token handling needed
    
    // Handle FormData for file uploads
    if (req.data instanceof FormData) {
      delete req.headers["Content-Type"]; // Let browser set it for FormData
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${req.method?.toUpperCase()} ${req.url}`, {
        headers: req.headers,
        data: req.data instanceof FormData ? "FormData" : req.data,
      });
    }

    return req;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for enhanced error handling and token management
API.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ Response ${response.status}:`, response.data);
    }
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error);

    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401: {
          // Unauthorized - redirect to login (cookies cleared by server)
          console.log("🔐 Authentication failed - redirecting to login");

          // Check if this is a logout request or profile check
          const isLogoutRequest = error.config?.url?.includes('/auth/logout');
          const isProfileCheck = error.config?.url?.includes('/auth/profile');
          
          // Only redirect if not already on auth pages and not during initial app load
          const currentPath = window.location.pathname;
          if (
            !isLogoutRequest && // Don't redirect on logout requests
            !currentPath.includes("/login") &&
            !currentPath.includes("/signup") &&
            !currentPath.includes("/auth") &&
            !currentPath.includes("/forgot-password") &&
            document.readyState === 'complete' // Only redirect after page is fully loaded
          ) {
            // Skip redirect if this is a profile check that happens during logout
            if (isProfileCheck && window.location.pathname === '/') {
              console.log("Skipping redirect - likely during logout flow");
            } else {
              // Longer delay to prevent redirect loops during auth checks
              setTimeout(() => {
                window.location.href = "/login";
              }, 500);
            }
          }
          break;
        }

        case 403:
          console.log("🚫 Access forbidden");
          break;

        case 404:
          console.log("❓ Resource not found");
          break;

        case 422:
          console.log("⚠️ Validation error:", data.errors);
          break;

        case 429:
          console.log("🐌 Rate limit exceeded");
          break;

        case 500:
          console.log("💥 Server error");
          break;

        default:
          console.log(`❌ HTTP Error ${status}`);
      }

      // Use server error message if available
      if (data?.message) {
        error.message = data.message;
      } else if (data?.error) {
        error.message = data.error;
      }
    } else if (error.code === "ECONNABORTED") {
      // Timeout error
      error.message =
        "Request timeout. Please check your connection and try again.";
    } else if (!error.response) {
      // Network error
      error.message =
        "Network error. Please check your connection and try again.";
    }

    return Promise.reject(error);
  }
);

// Helper functions for common API operations
export const apiGet = async (url, config = {}) => {
  try {
    const response = await API.get(url, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const apiPost = async (url, data = {}, config = {}) => {
  try {
    const response = await API.post(url, data, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const apiPut = async (url, data = {}, config = {}) => {
  try {
    const response = await API.put(url, data, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const apiPatch = async (url, data = {}, config = {}) => {
  try {
    const response = await API.patch(url, data, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const apiDelete = async (url, config = {}) => {
  try {
    const response = await API.delete(url, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Upload file with progress tracking
export const uploadFile = async (url, formData, onProgress = null) => {
  try {
    const response = await API.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: onProgress,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Cookie-based auth - these functions are no longer needed
// Authentication state is managed by the server via HTTP-only cookies

// Check if user is authenticated (deprecated - use API call instead)
export const isAuthenticated = () => {
  console.warn('isAuthenticated() is deprecated with cookie-based auth. Use API call to check auth status.');
  return false;
};

// Get current user (deprecated - use API call instead)
export const getCurrentUser = () => {
  console.warn('getCurrentUser() is deprecated with cookie-based auth. Use API call to get user data.');
  return null;
};

// Clear authentication data (deprecated - use logout API instead)
export const clearAuth = () => {
  console.warn('clearAuth() is deprecated with cookie-based auth. Use logout API endpoint.');
};

// API Health check
export const checkAPIHealth = async () => {
  try {
    const response = await API.get("/health");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Refresh token (deprecated with cookie-based auth)
export const refreshToken = async () => {
  console.warn('refreshToken() is deprecated with cookie-based auth. Tokens are managed by the server.');
  return { success: false, error: 'Not implemented with cookie-based auth' };
};

// Cars API functions
export const getCars = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await API.get(
      `/cars${queryString ? `?${queryString}` : ""}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCar = async (carId) => {
  try {
    const response = await API.get(`/cars/${carId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const createCar = async (carData) => {
  try {
    const response = await API.post("/cars", carData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Bookings API functions
export const getBookings = async (type = "me") => {
  try {
    const endpoint = type === "owner" ? "/bookings/owner" : "/bookings/me";
    const response = await API.get(endpoint);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const createBooking = async (bookingData) => {
  try {
    const response = await API.post("/bookings", bookingData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateBooking = async (bookingId, updateData) => {
  try {
    const response = await API.put(`/bookings/${bookingId}`, updateData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Auth API functions
export const loginUser = async (credentials) => {
  try {
    const response = await API.post("/auth/login", credentials);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await API.post("/auth/signup", userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async () => {
  try {
    const response = await API.get("/auth/profile");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Export the main API instance as default
export default API;
