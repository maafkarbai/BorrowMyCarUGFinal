// controllers/authController.js - FIXED with consistent response format
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import Car from "../models/Car.js";
import {
  uploadImagesToCloud,
  deleteImagesFromCloud,
} from "../utils/cloudUploader.js";
import { formatUAEPhone, validateUAEPhone } from "../utils/phoneUtils.js";
import emailService from "../utils/emailService.js";

// Enhanced async error handler
const handleAsyncErrorLocal = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Token generator with optional extended expiry for "remember me"
const generateToken = (user, rememberMe = false) => {
  const expiresIn = rememberMe ? "30d" : "7d"; // 30 days for remember me, 7 days for regular login
  
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      isApproved: user.isApproved,
      email: user.email,
      name: user.name,
      rememberMe, // Include remember me flag in token
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

const sendTokenResponse = (user, statusCode, res, message = "Success", rememberMe = false) => {
  const token = generateToken(user, rememberMe);

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isApproved: user.isApproved,
    profileImage: user.profileImage,
    preferredCity: user.preferredCity,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };

  const cookieOptions = {
    expires: new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message,
    user: userData,
    token,
  });
};

// Enhanced data sanitizer
const sanitizeUserData = (data) => {
  const sanitized = {};
  if (data.name) sanitized.name = data.name.toString().trim();
  if (data.email) sanitized.email = data.email.toString().toLowerCase().trim();
  if (data.phone) sanitized.phone = data.phone.toString().trim();
  if (data.password) sanitized.password = data.password.toString();
  if (data.role) sanitized.role = data.role.toString().trim();
  if (data.preferredCity)
    sanitized.preferredCity = data.preferredCity.toString().trim();
  return sanitized;
};

// FIXED validation function
const validateUserData = (data, isSignup = false) => {
  const errors = [];

  if (isSignup) {
    // Name validation
    if (!data.name || data.name.length < 2) {
      errors.push("Name must be at least 2 characters long");
    }

    // Email validation
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("Please provide a valid email address");
    }

    // FIXED: Phone validation
    if (!data.phone) {
      errors.push("Phone number is required");
    } else if (!validateUAEPhone(data.phone)) {
      errors.push("Please provide a valid UAE phone number (e.g., 0501234567)");
    }

    // Password validation
    if (!data.password || data.password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    // Role validation
    if (data.role && !["renter", "owner"].includes(data.role)) {
      errors.push("Role must be either 'renter' or 'owner'");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// SIGNUP STEP 1: Send OTP for email verification
export const signup = handleAsyncErrorLocal(async (req, res) => {
  console.log("=== SIGNUP STEP 1: Send OTP ===");
  console.log("Request body:", req.body);
  console.log(
    "Request files:",
    req.files ? Object.keys(req.files) : "No files"
  );

  // Sanitize input data
  const userData = sanitizeUserData(req.body);
  console.log("Sanitized data:", { ...userData, password: "[HIDDEN]" });

  const {
    name,
    email,
    phone,
    password,
    role = "renter",
    preferredCity,
  } = userData;

  // Validate data
  const validationResult = validateUserData(userData, true);
  if (!validationResult.isValid) {
    console.log("Validation errors:", validationResult.errors);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationResult.errors,
      code: "VALIDATION_ERROR",
    });
  }

  // Format phone number
  const formattedPhone = formatUAEPhone(phone);
  console.log("Phone formatting:", {
    original: phone,
    formatted: formattedPhone,
  });

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone: formattedPhone }],
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message:
        existingUser.email === email
          ? "Email already registered"
          : "Phone number already registered",
      code: "USER_EXISTS",
    });
  }

  // Handle document uploads (store temporarily)
  let documentUrls = {};
  if (req.files) {
    try {
      // Validate required documents
      if (!req.files.drivingLicense) {
        return res.status(400).json({
          success: false,
          message: "Driving license is required",
          code: "MISSING_DOCUMENTS",
        });
      }

      // Upload documents
      if (req.files.drivingLicense) {
        const [drivingLicenseUrl] = await uploadImagesToCloud(
          req.files.drivingLicense
        );
        documentUrls.drivingLicenseUrl = drivingLicenseUrl;
      }

      if (req.files.emiratesId) {
        const [emiratesIdUrl] = await uploadImagesToCloud(req.files.emiratesId);
        documentUrls.emiratesIdUrl = emiratesIdUrl;
      }

      if (req.files.visa) {
        const [visaUrl] = await uploadImagesToCloud(req.files.visa);
        documentUrls.visaUrl = visaUrl;
      }

      if (req.files.passport) {
        const [passportUrl] = await uploadImagesToCloud(req.files.passport);
        documentUrls.passportUrl = passportUrl;
      }

      if (req.files.profileImage) {
        const [profileImageUrl] = await uploadImagesToCloud(
          req.files.profileImage
        );
        documentUrls.profileImage = profileImageUrl;
      }
    } catch (uploadError) {
      console.error("Document upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload documents. Please try again.",
        code: "UPLOAD_FAILED",
      });
    }
  }

  // Prepare temporary user data for OTP storage
  const tempUserData = {
    name,
    email,
    phone: formattedPhone,
    password, // Will be hashed when creating actual user
    role,
    preferredCity,
    ...documentUrls,
    isApproved: false,
    isEmailVerified: false,
  };

  try {
    // Generate and store OTP
    const { otp } = await OTP.createOTP(email, "signup", tempUserData);
    
    // Send OTP email
    const emailResult = await emailService.sendOTPEmail(email, otp, "signup");
    
    if (!emailResult.success) {
      console.error("Failed to send OTP email:", emailResult.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
        code: "EMAIL_SEND_FAILED",
      });
    }

    console.log("OTP sent successfully for:", email);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Verification code sent to your email. Please check your inbox.",
      data: {
        email,
        nextStep: "verify-email",
        expiresIn: "10 minutes",
      },
    });

  } catch (error) {
    console.error("Signup OTP generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process registration. Please try again.",
      code: "INTERNAL_ERROR",
    });
  }
});

// SIGNUP STEP 2: Verify OTP and create user account
export const verifyEmail = handleAsyncErrorLocal(async (req, res) => {
  console.log("=== SIGNUP STEP 2: Verify OTP ===");
  
  const { email, otp } = req.body;

  // Validate input
  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required",
      code: "MISSING_FIELDS",
    });
  }

  try {
    // Verify OTP
    const verificationResult = await OTP.verifyOTP(email.toLowerCase().trim(), otp, "signup");
    
    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message,
        code: "OTP_VERIFICATION_FAILED",
      });
    }

    // Get user data from OTP record
    const tempUserData = verificationResult.userData;
    if (!tempUserData) {
      return res.status(400).json({
        success: false,
        message: "User data not found. Please restart registration.",
        code: "USER_DATA_MISSING",
      });
    }

    // Check if user already exists (double-check)
    const existingUser = await User.findOne({
      $or: [{ email: tempUserData.email }, { phone: tempUserData.phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
        code: "USER_EXISTS",
      });
    }

    // Create the actual user account
    const userCreateData = {
      ...tempUserData,
      isEmailVerified: true,
    };

    const user = await User.create(userCreateData);
    console.log("User created successfully after email verification:", user._id);

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.name, user.role);

    // Send token response
    sendTokenResponse(
      user,
      201,
      res,
      "Account created successfully! Welcome to BorrowMyCar."
    );

  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify email. Please try again.",
      code: "INTERNAL_ERROR",
    });
  }
});

// Resend OTP for email verification
export const resendOTP = handleAsyncErrorLocal(async (req, res) => {
  console.log("=== RESEND OTP ===");
  
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
      code: "MISSING_EMAIL",
    });
  }

  try {
    // Check if there's a pending OTP for this email
    const existingOTP = await OTP.findOne({
      email: email.toLowerCase().trim(),
      purpose: "signup",
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!existingOTP) {
      return res.status(404).json({
        success: false,
        message: "No pending verification found. Please restart registration.",
        code: "NO_PENDING_VERIFICATION",
      });
    }

    // Generate new OTP (this will delete the old one)
    const { otp } = await OTP.createOTP(email.toLowerCase().trim(), "signup", existingOTP.userData);
    
    // Send OTP email
    const emailResult = await emailService.sendOTPEmail(email, otp, "signup");
    
    if (!emailResult.success) {
      console.error("Failed to resend OTP email:", emailResult.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
        code: "EMAIL_SEND_FAILED",
      });
    }

    console.log("OTP resent successfully for:", email);

    res.status(200).json({
      success: true,
      message: "New verification code sent to your email.",
      data: {
        email,
        expiresIn: "10 minutes",
      },
    });

  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend verification code. Please try again.",
      code: "INTERNAL_ERROR",
    });
  }
});

export const login = handleAsyncErrorLocal(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
      code: "MISSING_CREDENTIALS",
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, "Login successful", Boolean(rememberMe));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

// GET USER PROFILE - FIXED
export const getProfile = handleAsyncErrorLocal(async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isApproved: user.isApproved,
          profileImage: user.profileImage,
          preferredCity: user.preferredCity,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      code: "INTERNAL_ERROR",
    });
  }
});

// UPDATE USER PROFILE - FIXED
export const updateProfile = handleAsyncErrorLocal(async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = sanitizeUserData(req.body);

    // Remove sensitive fields
    delete updates.password;
    delete updates.email;
    delete updates.role;
    delete updates.isApproved;

    // Validate updates
    if (updates.name && updates.name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long",
        code: "INVALID_NAME",
      });
    }

    // Handle profile image upload
    if (req.file) {
      try {
        const user = await User.findById(userId);

        // Delete old profile image
        if (user.profileImage) {
          await deleteImagesFromCloud([user.profileImage]).catch(console.error);
        }

        // Upload new profile image
        const [profileImageUrl] = await uploadImagesToCloud([req.file]);
        updates.profileImage = profileImageUrl;
      } catch (uploadError) {
        console.error("Profile image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload profile image",
          code: "UPLOAD_FAILED",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          isApproved: updatedUser.isApproved,
          profileImage: updatedUser.profileImage,
          preferredCity: updatedUser.preferredCity,
        },
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      code: "INTERNAL_ERROR",
    });
  }
});

// NEW: UPDATE PROFILE PICTURE ONLY
export const updateProfilePicture = handleAsyncErrorLocal(async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image file is required",
        code: "NO_FILE_PROVIDED",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Delete old profile image
    if (user.profileImage) {
      await deleteImagesFromCloud([user.profileImage]).catch(console.error);
    }

    // Upload new profile image
    const [profileImageUrl] = await uploadImagesToCloud([req.file]);

    // Update user
    user.profileImage = profileImageUrl;
    await user.save();

    res.json({
      success: true,
      message: "Profile picture updated successfully",
      data: {
        profileImage: profileImageUrl,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isApproved: user.isApproved,
          profileImage: user.profileImage,
          preferredCity: user.preferredCity,
        },
      },
    });
  } catch (error) {
    console.error("Update profile picture error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile picture",
      code: "INTERNAL_ERROR",
    });
  }
});

// REMOVE PROFILE PICTURE
export const removeProfilePicture = handleAsyncErrorLocal(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    if (!user.profileImage) {
      return res.status(400).json({
        success: false,
        message: "No profile picture to remove",
        code: "NO_PROFILE_PICTURE",
      });
    }

    // Delete from cloud storage
    await deleteImagesFromCloud([user.profileImage]).catch(console.error);

    // Remove from user document
    user.profileImage = null;
    await user.save();

    res.json({
      success: true,
      message: "Profile picture removed successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isApproved: user.isApproved,
          profileImage: null,
          preferredCity: user.preferredCity,
        },
      },
    });
  } catch (error) {
    console.error("Remove profile picture error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove profile picture",
      code: "INTERNAL_ERROR",
    });
  }
});

// CHANGE PASSWORD
export const changePassword = handleAsyncErrorLocal(async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
        code: "MISSING_FIELDS",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
        code: "INVALID_PASSWORD",
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    const isPasswordValid = await user.matchPassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
        code: "INVALID_CURRENT_PASSWORD",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      code: "INTERNAL_ERROR",
    });
  }
});

// UPDATE USER PREFERENCES
export const updatePreferences = handleAsyncErrorLocal(async (req, res) => {
  try {
    const userId = req.user.id;
    const { notifications, privacy } = req.body;

    const updates = {};

    if (notifications) {
      updates.notificationPreferences = {
        emailBookings: Boolean(notifications.emailBookings),
        emailPromotions: Boolean(notifications.emailPromotions),
        smsBookings: Boolean(notifications.smsBookings),
        smsReminders: Boolean(notifications.smsReminders),
        pushNotifications: Boolean(notifications.pushNotifications),
      };
    }

    if (privacy) {
      updates.privacySettings = {
        profileVisibility: privacy.profileVisibility || "public",
        showPhone: Boolean(privacy.showPhone),
        showEmail: Boolean(privacy.showEmail),
        allowMessages: Boolean(privacy.allowMessages),
      };
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({
      success: true,
      message: "Preferences updated successfully",
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          notificationPreferences: updatedUser.notificationPreferences,
          privacySettings: updatedUser.privacySettings,
        },
      },
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update preferences",
      code: "INTERNAL_ERROR",
    });
  }
});

// GET PUBLIC USER PROFILE WITH THEIR CARS
export const getPublicUserProfile = handleAsyncErrorLocal(async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        code: "MISSING_USER_ID",
      });
    }

    // Get user profile (public fields only)
    const user = await User.findById(userId).select(
      "name email phone profileImage preferredCity createdAt averageRating totalBookings"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Get user's active car listings
    const cars = await Car.find({ 
      owner: userId, 
      status: "active",
      availabilityTo: { $gte: new Date() }
    })
    .select("-owner") // Don't include owner details since we already have the user
    .sort({ createdAt: -1 })
    .lean();

    // Add pricePerDay field for frontend compatibility
    const enhancedCars = cars.map((car) => ({
      ...car,
      pricePerDay: car.price,
    }));

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email, // Show email for contact
          phone: user.phone, // Show phone for contact
          profileImage: user.profileImage,
          preferredCity: user.preferredCity,
          createdAt: user.createdAt,
          averageRating: user.averageRating || 0,
          totalBookings: user.totalBookings || 0,
          totalListings: cars.length,
        },
        cars: enhancedCars,
      },
    });
  } catch (error) {
    console.error("Get public user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      code: "INTERNAL_ERROR",
    });
  }
});

// EXPORT USER DATA
export const exportUserData = handleAsyncErrorLocal(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        preferredCity: user.preferredCity,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="borrowmycar-data.json"'
    );
    res.json(exportData);
  } catch (error) {
    console.error("Export data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export data",
      code: "INTERNAL_ERROR",
    });
  }
});

// DELETE USER ACCOUNT
export const deleteAccount = handleAsyncErrorLocal(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Delete images from cloud storage
    const imagesToDelete = [
      user.profileImage,
      user.drivingLicenseUrl,
      user.emiratesIdUrl,
      user.visaUrl,
      user.passportUrl,
    ].filter(Boolean);

    if (imagesToDelete.length > 0) {
      await deleteImagesFromCloud(imagesToDelete).catch(console.error);
    }

    // Soft delete
    user.deletedAt = new Date();
    user.email = `deleted_${user._id}@borrowmycar.deleted`;
    user.phone = `deleted_${user._id}`;
    await user.save();

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
      code: "INTERNAL_ERROR",
    });
  }
});

// FORGOT PASSWORD - Send reset OTP
export const forgotPassword = handleAsyncErrorLocal(async (req, res) => {
  console.log("=== FORGOT PASSWORD REQUEST ===");
  
  const { email } = req.body;

  // Validate input
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
      code: "MISSING_EMAIL",
    });
  }

  const userEmail = email.toLowerCase().trim();

  try {
    // Check if user exists
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      // For security, don't reveal if email doesn't exist
      return res.status(200).json({
        success: true,
        message: "If your email is registered, you will receive a password reset code shortly.",
        data: {
          email: userEmail,
          nextStep: "check-email",
        },
      });
    }

    // Generate and store OTP for password reset
    const { otp } = await OTP.createOTP(userEmail, "password-reset");
    
    // Send password reset email
    const emailResult = await emailService.sendPasswordResetEmail(userEmail, otp);
    
    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again.",
        code: "EMAIL_SEND_FAILED",
      });
    }

    console.log("Password reset OTP sent successfully for:", userEmail);

    // Return success response (same message regardless of whether user exists)
    res.status(200).json({
      success: true,
      message: "If your email is registered, you will receive a password reset code shortly.",
      data: {
        email: userEmail,
        nextStep: "verify-reset-code",
        expiresIn: "10 minutes",
      },
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process password reset request. Please try again.",
      code: "INTERNAL_ERROR",
    });
  }
});

// RESET PASSWORD - Verify OTP and update password
export const resetPassword = handleAsyncErrorLocal(async (req, res) => {
  console.log("=== RESET PASSWORD REQUEST ===");
  
  const { email, otp, newPassword } = req.body;

  // Validate input
  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, OTP, and new password are required",
      code: "MISSING_FIELDS",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters long",
      code: "INVALID_PASSWORD",
    });
  }

  const userEmail = email.toLowerCase().trim();

  try {
    // Verify OTP
    const verificationResult = await OTP.verifyOTP(userEmail, otp, "password-reset");
    
    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message,
        code: "OTP_VERIFICATION_FAILED",
      });
    }

    // Find user
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    console.log("Password reset successfully for:", userEmail);

    // Send success response
    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password.",
      data: {
        email: userEmail,
        nextStep: "login",
      },
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again.",
      code: "INTERNAL_ERROR",
    });
  }
});

// RESEND PASSWORD RESET OTP
export const resendPasswordResetOTP = handleAsyncErrorLocal(async (req, res) => {
  console.log("=== RESEND PASSWORD RESET OTP ===");
  
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
      code: "MISSING_EMAIL",
    });
  }

  const userEmail = email.toLowerCase().trim();

  try {
    // Check if there's a pending password reset OTP for this email
    const existingOTP = await OTP.findOne({
      email: userEmail,
      purpose: "password-reset",
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!existingOTP) {
      return res.status(404).json({
        success: false,
        message: "No pending password reset found. Please start the process again.",
        code: "NO_PENDING_RESET",
      });
    }

    // Check if user still exists
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Generate new OTP (this will delete the old one)
    const { otp } = await OTP.createOTP(userEmail, "password-reset");
    
    // Send password reset email
    const emailResult = await emailService.sendPasswordResetEmail(userEmail, otp);
    
    if (!emailResult.success) {
      console.error("Failed to resend password reset email:", emailResult.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again.",
        code: "EMAIL_SEND_FAILED",
      });
    }

    console.log("Password reset OTP resent successfully for:", userEmail);

    res.status(200).json({
      success: true,
      message: "New password reset code sent to your email.",
      data: {
        email: userEmail,
        expiresIn: "10 minutes",
      },
    });

  } catch (error) {
    console.error("Resend password reset OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend password reset code. Please try again.",
      code: "INTERNAL_ERROR",
    });
  }
});

// LOGOUT - Clear HTTP-only cookie
export const logout = handleAsyncErrorLocal(async (req, res) => {
  // Clear the JWT cookie
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// Export alternative names for compatibility
export const register = signup;
