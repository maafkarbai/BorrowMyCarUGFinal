// middlewares/authMiddleware.js (Fixed Imports)
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import rateLimit from "express-rate-limit";

// Enhanced async error handler
const handleAsyncError = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Enhanced JWT protection middleware
export const protect = handleAsyncError(async (req, res, next) => {
  let token;

  // Extract token from different sources
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
      code: "NO_TOKEN_PROVIDED",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "The user belonging to this token no longer exists.",
        code: "USER_NOT_FOUND",
      });
    }

    // Check if user account is not deleted
    if (user.deletedAt) {
      return res.status(401).json({
        success: false,
        message: "User account has been deactivated.",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    // Check if user account is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: user.blockReason || "Your account has been blocked. Please contact support.",
        code: "ACCOUNT_BLOCKED",
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    let message = "Invalid token";
    let code = "INVALID_TOKEN";

    if (error.name === "TokenExpiredError") {
      message = "Token has expired";
      code = "TOKEN_EXPIRED";
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid token format";
      code = "MALFORMED_TOKEN";
    }

    return res.status(401).json({
      success: false,
      message,
      code,
    });
  }
});

// Role-based authorization middleware
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }
    next();
  };
};

// Account approval requirement middleware
export const requireApproval = (req, res, next) => {
  if (!req.user.isApproved) {
    return res.status(403).json({
      success: false,
      message:
        "Your account must be approved by admin before performing this action.",
      code: "ACCOUNT_NOT_APPROVED",
    });
  }
  next();
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = handleAsyncError(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (user && !user.deletedAt && !user.isBlocked) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
      console.log("Optional auth failed:", error.message);
    }
  }

  next();
});

// Auth rate limiter (stricter for login/signup)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
});

// Upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads per hour
  message: {
    success: false,
    message: "Too many upload attempts, please try again later.",
    code: "UPLOAD_RATE_LIMIT_EXCEEDED",
  },
});
