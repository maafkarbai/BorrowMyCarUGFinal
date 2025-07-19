import { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";
import API from "../api";

const AdminAuthContext = createContext();

const adminAuthReducer = (state, action) => {
  switch (action.type) {
    case "ADMIN_LOGIN_START":
      return { ...state, loading: true, error: null };
    case "ADMIN_LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        isAdminAuthenticated: true,
        adminUser: action.payload.user,
        adminToken: action.payload.token,
        error: null,
      };
    case "ADMIN_LOGIN_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAdminAuthenticated: false,
        adminUser: null,
        adminToken: null,
      };
    case "ADMIN_LOGOUT":
      return {
        ...state,
        isAdminAuthenticated: false,
        adminUser: null,
        adminToken: null,
        error: null,
        loading: false,
      };
    case "ADMIN_CLEAR_ERROR":
      return { ...state, error: null };
    case "ADMIN_SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

// Helper functions for admin token storage (separate from regular auth)
const getStoredAdminToken = () => {
  // Check localStorage first (for remember me), then sessionStorage
  const localToken = localStorage.getItem("adminToken");
  if (localToken) return localToken;
  
  return sessionStorage.getItem("adminToken");
};

const getStoredAdminUser = () => {
  try {
    // Check localStorage first (for remember me), then sessionStorage
    const localUserData = localStorage.getItem("adminUser");
    if (localUserData) return JSON.parse(localUserData);
    
    const sessionUserData = sessionStorage.getItem("adminUser");
    return sessionUserData ? JSON.parse(sessionUserData) : null;
  } catch {
    return null;
  }
};

const storeAdminAuthData = (token, user, rememberMe = false) => {
  if (rememberMe) {
    // For remember me - use localStorage (persists across browser sessions)
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminUser", JSON.stringify(user));
    // Remove from sessionStorage if it exists
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
  } else {
    // For regular login - use sessionStorage (cleared when browser closes)
    sessionStorage.setItem("adminToken", token);
    sessionStorage.setItem("adminUser", JSON.stringify(user));
    // Remove from localStorage if it exists
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  }
};

const clearAdminAuthData = () => {
  // Remove from both storages
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  sessionStorage.removeItem("adminToken");
  sessionStorage.removeItem("adminUser");
};

// Create admin API instance - hybrid approach for admin role switching
const createAdminAPI = (token) => {
  if (!token) {
    return API; // Use cookie-based auth if no token
  }
  
  // Create new instance with token for admin role switching
  const adminAPI = axios.create({
    baseURL: API.defaults.baseURL,
    timeout: API.defaults.timeout,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  return adminAPI;
};

const initialState = {
  isAdminAuthenticated: !!getStoredAdminToken() && !!getStoredAdminUser(),
  adminUser: getStoredAdminUser(),
  adminToken: getStoredAdminToken(),
  loading: false,
  error: null,
  previousUserState: null, // Store previous user state
};

export const AdminAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminAuthReducer, initialState);

  // Check if admin is logged in on app start
  useEffect(() => {
    const token = getStoredAdminToken();
    if (token) {
      getCurrentAdminUser();
    }
  }, []);

  const getCurrentAdminUser = async () => {
    try {
      dispatch({ type: "ADMIN_SET_LOADING", payload: true });
      
      const adminToken = getStoredAdminToken();
      if (!adminToken) {
        throw new Error("No admin token found");
      }
      
      // Create admin API instance with stored token
      const adminAPI = createAdminAPI(adminToken);
      const res = await adminAPI.get("/auth/profile");

      let user = null;
      if (res.data.data?.user) {
        user = res.data.data.user;
      } else if (res.data.user) {
        user = res.data.user;
      } else if (res.data.data && !res.data.data.user) {
        user = res.data.data;
      }

      if (user && user.role === 'admin') {
        dispatch({
          type: "ADMIN_LOGIN_SUCCESS",
          payload: {
            user,
            token: adminToken,
          },
        });
      } else {
        throw new Error("Not an admin user");
      }
    } catch (error) {
      console.error("Get current admin user error:", error);
      clearAdminAuthData();
      dispatch({ type: "ADMIN_LOGOUT" });
    } finally {
      dispatch({ type: "ADMIN_SET_LOADING", payload: false });
    }
  };

  const adminLogin = async (credentials, currentUserState = null) => {
    dispatch({ type: "ADMIN_LOGIN_START" });

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Admin login attempt with:", { email: credentials.email, rememberMe: !!credentials.rememberMe });
      }
      
      const res = await API.post("/auth/login", {
        email: credentials.email.trim(),
        password: credentials.password,
        rememberMe: credentials.rememberMe,
      });

      if (process.env.NODE_ENV === 'development') {
        console.log("Admin login response:", res.data);
      }

      let token = null;
      let user = null;

      // Handle different response formats
      if (res.data.token && res.data.user) {
        token = res.data.token;
        user = res.data.user;
      } else if (res.data.data?.token && res.data.data?.user) {
        token = res.data.data.token;
        user = res.data.data.user;
      } else if (res.data.success && res.data.token) {
        token = res.data.token;
        user = res.data.user;
      } else if (res.data.accessToken) {
        token = res.data.accessToken;
        user = res.data.user || res.data.data?.user;
      }

      if (token && user) {
        // Verify user is admin
        if (user.role !== 'admin') {
          throw new Error("Access denied. Admin credentials required.");
        }

        // Store previous user state if provided
        if (currentUserState) {
          sessionStorage.setItem("previousUserState", JSON.stringify(currentUserState));
        }

        // Store admin authentication data with remember me preference
        storeAdminAuthData(token, user, credentials.rememberMe);

        dispatch({
          type: "ADMIN_LOGIN_SUCCESS",
          payload: { user, token },
        });

        return { success: true, user };
      } else {
        console.error("Invalid admin login response format:", res.data);
        throw new Error("Invalid response format - missing token or user data");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Admin login failed. Please check your credentials.";

      dispatch({ type: "ADMIN_LOGIN_FAILURE", payload: message });
      return { success: false, error: message };
    }
  };

  const adminLogout = () => {
    // Get previous user state from sessionStorage
    let previousState = null;
    try {
      const storedState = sessionStorage.getItem("previousUserState");
      if (storedState) {
        previousState = JSON.parse(storedState);
      }
    } catch (error) {
      console.error("Error parsing previous user state:", error);
    }

    // Clear admin auth data and previous state
    clearAdminAuthData();
    sessionStorage.removeItem("previousUserState");

    // Clear admin state
    dispatch({ type: "ADMIN_LOGOUT" });

    // Return previous user state for restoration
    return previousState;
  };

  const clearAdminError = () => {
    dispatch({ type: "ADMIN_CLEAR_ERROR" });
  };

  // Provide admin API instance with current token
  const getAdminAPI = () => {
    return createAdminAPI(state.adminToken);
  };

  const value = {
    ...state,
    adminLogin,
    adminLogout,
    clearAdminError,
    getCurrentAdminUser,
    getAdminAPI,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

export default AdminAuthProvider;