import { createContext, useContext, useReducer, useEffect } from "react";
import API from "../api";

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
        user: null,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
        loading: false,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app start
  useEffect(() => {
    let isMounted = true;
    
    const checkAuthStatus = async () => {
      if (isMounted) {
        await checkAuth(isMounted);
      }
    };
    
    checkAuthStatus();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  const checkAuth = async (isMounted = true) => {
    try {
      if (isMounted) dispatch({ type: "SET_LOADING", payload: true });
      
      const response = await API.get("/auth/profile");
      
      if (isMounted) {
        if (response.data.success && response.data.data?.user) {
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { user: response.data.data.user },
          });
        } else {
          dispatch({ type: "LOGOUT" });
        }
      }
    } catch (error) {
      if (isMounted) {
        // Only logout if it's not a network error
        if (error.response?.status === 401 || error.response?.status === 403) {
          dispatch({ type: "LOGOUT" });
        } else {
          // For network errors, just stop loading but don't logout
          dispatch({ type: "SET_LOADING", payload: false });
        }
      }
    } finally {
      if (isMounted) {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await API.post("/auth/login", {
        email: credentials.email.trim(),
        password: credentials.password,
        rememberMe: credentials.rememberMe || false,
      });

      if (response.data.success && response.data.user) {
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user: response.data.user },
        });
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Login failed";
      dispatch({ type: "LOGIN_FAILURE", payload: message });
      return { success: false, error: message };
    }
  };

  const signup = async (userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const formData = new FormData();

      // Append form fields
      Object.keys(userData).forEach((key) => {
        if (key !== "confirmPassword" && key !== "files" && typeof userData[key] !== "object") {
          formData.append(key, userData[key]);
        }
      });

      // Append files
      if (userData.files) {
        Object.keys(userData.files).forEach((key) => {
          if (userData.files[key]) {
            formData.append(key, userData.files[key]);
          }
        });
      }

      const response = await API.post("/auth/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        if (response.data.user) {
          // User was created and logged in
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { user: response.data.user },
          });
          return { success: true, user: response.data.user };
        } else {
          // Registration successful, but needs verification/approval
          dispatch({ type: "SET_LOADING", payload: false });
          return { 
            success: true, 
            requiresVerification: true, 
            data: response.data.data 
          };
        }
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Registration failed";
      dispatch({ type: "LOGIN_FAILURE", payload: message });
      return { success: false, error: message };
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await API.post("/auth/verify-email", { email, otp });

      if (response.data.success && response.data.user) {
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user: response.data.user },
        });
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.data.message || "Verification failed");
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Verification failed";
      dispatch({ type: "LOGIN_FAILURE", payload: message });
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      // Continue with logout even if API call fails
    }
    dispatch({ type: "LOGOUT" });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const updateUser = (userData) => {
    dispatch({ type: "UPDATE_USER", payload: userData });
  };

  const value = {
    ...state,
    login,
    signup,
    verifyEmail,
    logout,
    clearError,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;