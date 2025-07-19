// models/OTP.js - OTP verification model
import mongoose from "mongoose";
import crypto from "crypto";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["signup", "password-reset", "email-verification"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3, // Maximum 3 verification attempts
    },
    userData: {
      type: mongoose.Schema.Types.Mixed, // Store temporary user data for signup
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired documents

// Generate 6-digit OTP using cryptographically secure random
otpSchema.statics.generateOTP = function () {
  return crypto.randomInt(100000, 999999).toString();
};

// Create OTP record
otpSchema.statics.createOTP = async function (email, purpose, userData = null) {
  // Delete any existing OTPs for this email and purpose
  await this.deleteMany({ email, purpose });

  const otp = this.generateOTP();
  const otpRecord = await this.create({
    email,
    otp,
    purpose,
    userData,
  });

  return { otp, record: otpRecord };
};

// Verify OTP
otpSchema.statics.verifyOTP = async function (email, otp, purpose) {
  const otpRecord = await this.findOne({
    email,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!otpRecord) {
    return { success: false, message: "Invalid or expired OTP" };
  }

  // Increment attempts
  otpRecord.attempts += 1;
  await otpRecord.save();

  // Check if too many attempts
  if (otpRecord.attempts > 3) {
    await otpRecord.deleteOne();
    return { success: false, message: "Too many attempts. Please request a new OTP" };
  }

  // Verify OTP
  if (otpRecord.otp !== otp) {
    return { success: false, message: "Invalid OTP" };
  }

  // Mark as used
  otpRecord.isUsed = true;
  await otpRecord.save();

  return { 
    success: true, 
    message: "OTP verified successfully",
    userData: otpRecord.userData 
  };
};

// Clean up expired OTPs (called manually if needed)
otpSchema.statics.cleanupExpired = async function () {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  return result.deletedCount;
};

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;