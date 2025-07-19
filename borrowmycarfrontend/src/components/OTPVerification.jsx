// src/components/OTPVerification.jsx - OTP verification component
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api";

const OTPVerification = ({ email, onVerificationSuccess, onBackToSignup }) => {
  const { verifyEmail } = useAuth();
  const [otp, setOTP] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = useRef([]);

  // Timer for OTP expiration
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Format time for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Handle OTP input change
  const handleOTPChange = (index, value) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return;

    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOTP.every(digit => digit !== "") && !isLoading) {
      handleVerification(newOTP.join(""));
    }
  };

  // Handle backspace/delete
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);
    
    if (digits.length === 6) {
      const newOTP = digits.split("");
      setOTP(newOTP);
      setError("");
      handleVerification(digits);
    }
  };

  // Verify OTP
  const handleVerification = async (otpCode = null) => {
    const otpToVerify = otpCode || otp.join("");
    
    if (otpToVerify.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await verifyEmail(email, otpToVerify);

      if (process.env.NODE_ENV === 'development') {
        console.log("Email verification successful:", result);
      }

      if (result.success) {
        // Call success callback with user data - user should be logged in at this point
        onVerificationSuccess(result);
      } else {
        setError(result.error || "Verification failed");
        setOTP(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
      
    } catch (error) {
      console.error("Email verification error:", error);
      setError("An unexpected error occurred. Please try again.");
      setOTP(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setError("");

    try {
      const response = await API.post("/auth/resend-otp", { email });
      
      if (process.env.NODE_ENV === 'development') {
        console.log("OTP resent successfully:", response.data);
      }
      
      // Reset timer and cooldown
      setTimeLeft(600);
      setResendCooldown(30); // 30 second cooldown between resends
      setOTP(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      
    } catch (error) {
      console.error("Resend OTP error:", error);
      
      if (error.response) {
        const message = error.response.data?.message || "Failed to resend code";
        setError(message);
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:flex-1 lg:max-w-md bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <div className="max-w-md mx-auto space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl shadow-lg flex items-center justify-center text-2xl">
              🚗
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              BorrowMyCar
            </h1>
            <p className="text-gray-600">Your trusted car sharing platform</p>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Email Verification</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
                  ✓
                </div>
                <p className="text-sm font-medium text-green-600">Information Submitted</p>
                <span className="text-lg">📝</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 border-2 border-green-500 flex items-center justify-center text-sm">
                  2
                </div>
                <p className="text-sm font-medium text-green-600">Verify Email</p>
                <span className="text-lg">📧</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm">
                  3
                </div>
                <p className="text-sm font-medium text-gray-500">Account Ready</p>
                <span className="text-lg">🎉</span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Security Notice</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">🔒</span>
                <span>Code expires in {formatTime(timeLeft)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">📱</span>
                <span>Check your spam folder</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">🔐</span>
                <span>Never share your code</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Verification Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-3xl">📧</span>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Check Your Email
              </h2>
              <p className="text-gray-600">
                We've sent a 6-digit verification code to
              </p>
              <p className="font-medium text-gray-900 break-all">{email}</p>
            </div>
          </div>

          {/* OTP Input */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={`w-12 h-12 text-center text-xl font-bold border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      error ? "border-red-500" : "border-gray-300"
                    } ${digit ? "bg-green-50 border-green-500" : ""}`}
                    disabled={isLoading}
                  />
                ))}
              </div>
              
              {error && (
                <p className="text-red-500 text-sm text-center mt-3">{error}</p>
              )}
            </div>

            {/* Timer */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-600">
                  Code expires in <span className="font-medium text-gray-900">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <p className="text-sm text-red-600 font-medium">
                  Verification code has expired
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => handleVerification()}
                disabled={isLoading || otp.some(digit => !digit)}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify Email"
                )}
              </button>

              {/* Resend Code */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?{" "}
                  <button
                    onClick={handleResendOTP}
                    disabled={isResending || resendCooldown > 0}
                    className="font-medium text-green-600 hover:text-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isResending
                      ? "Sending..."
                      : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend Code"
                    }
                  </button>
                </p>
              </div>

              {/* Back to Signup */}
              <div className="text-center">
                <button
                  onClick={onBackToSignup}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Back to Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;