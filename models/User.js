// models/User.js - FIXED to remove duplicate indexes
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  formatUAEPhone,
  validateUAEPhone,
  displayUAEPhone,
} from "../utils/phoneUtils.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return validateUAEPhone(v);
        },
        message: "Please enter a valid UAE phone number (e.g., 0501234567)",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't include password by default
    },
    profileImage: {
      type: String,
    },
    role: {
      type: String,
      enum: ["renter", "owner", "admin"],
      default: "renter",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
    },
    // Document URLs
    drivingLicenseUrl: {
      type: String,
      required: true,
    },
    // Document verification status
    licenseVerified: {
      type: Boolean,
      default: false,
    },
    licenseVerificationNotes: {
      type: String,
    },
    emiratesIdUrl: {
      type: String,
    },
    visaUrl: {
      type: String,
    },
    passportUrl: {
      type: String,
    },
    // User preferences
    preferredCity: {
      type: String,
      enum: [
        "Dubai",
        "Abu Dhabi",
        "Sharjah",
        "Ajman",
        "Fujairah",
        "Ras Al Khaimah",
        "Umm Al Quwain",
      ],
    },
    // Notification preferences
    notificationPreferences: {
      emailBookings: { type: Boolean, default: true },
      emailPromotions: { type: Boolean, default: false },
      smsBookings: { type: Boolean, default: true },
      smsReminders: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
    },
    // Privacy settings
    privacySettings: {
      profileVisibility: {
        type: String,
        enum: ["public", "private"],
        default: "public",
      },
      showPhone: { type: Boolean, default: false },
      showEmail: { type: Boolean, default: false },
      allowMessages: { type: Boolean, default: true },
    },
    // Account status
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    // Account blocking
    isBlocked: { type: Boolean, default: false },
    blockedAt: { type: Date },
    blockReason: { type: String },
    // Soft delete
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Index definitions (unique: true already creates email index)
userSchema.index({ phone: 1 }); // Phone index
userSchema.index({ isApproved: 1, role: 1 }); // Compound index for queries
userSchema.index({ role: 1 }); // Role index
userSchema.index({ deletedAt: 1 }); // Soft delete index

// Pre-save middleware to format phone number
userSchema.pre("save", function (next) {
  if (this.isModified("phone")) {
    this.phone = formatUAEPhone(this.phone);
  }
  next();
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hide deleted users in queries
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ deletedAt: null });
  next();
});

// Virtual for displaying phone in local format
userSchema.virtual("phoneDisplay").get(function () {
  return displayUAEPhone(this.phone);
});

// Method to get public profile data
userSchema.methods.getPublicProfile = function () {
  const publicData = {
    id: this._id,
    name: this.name,
    role: this.role,
    profileImage: this.profileImage,
    preferredCity: this.preferredCity,
    createdAt: this.createdAt,
  };

  // Add contact info based on privacy settings
  if (this.privacySettings?.showEmail) {
    publicData.email = this.email;
  }
  if (this.privacySettings?.showPhone) {
    publicData.phone = this.phone;
  }

  return publicData;
};

// Method to get full profile data (for owner)
userSchema.methods.getPrivateProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    isApproved: this.isApproved,
    profileImage: this.profileImage,
    preferredCity: this.preferredCity,
    notificationPreferences: this.notificationPreferences,
    privacySettings: this.privacySettings,
    isEmailVerified: this.isEmailVerified,
    isPhoneVerified: this.isPhoneVerified,
    createdAt: this.createdAt,
    lastLoginAt: this.lastLoginAt,
  };
};

// Static method to find users with public profiles
userSchema.statics.findPublicProfiles = function (query = {}) {
  return this.find({
    ...query,
    deletedAt: null,
    "privacySettings.profileVisibility": "public",
  });
};

// Ensure virtual fields are serialized
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

// Create and export the model
const User = mongoose.model("User", userSchema);

// Export only default export for consistency
export default User;
