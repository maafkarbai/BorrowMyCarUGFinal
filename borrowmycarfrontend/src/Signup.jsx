import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import PhoneInput from "./components/PhoneInput";
import OTPVerification from "./components/OTPVerification";
import { Helmet } from "react-helmet-async";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, verifyEmail, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "renter",
    preferredCity: "Dubai",
  });

  const [files, setFiles] = useState({
    drivingLicense: null,
    emiratesId: null,
    visa: null,
    passport: null,
    profileImage: null,
  });

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const uaeCities = [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Fujairah",
    "Ras Al Khaimah",
    "Umm Al Quwain",
  ];

  // Handle role from navigation state
  useEffect(() => {
    const selectedRole = location.state?.role;
    if (selectedRole) {
      setFormData((prev) => ({ ...prev, role: selectedRole }));
    } else {
      navigate("/auth", { replace: true });
    }
  }, [location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneChange = (phoneValue) => {
    setFormData((prev) => ({ ...prev, phone: phoneValue }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [name]: "File size must be less than 5MB",
        }));
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Only JPEG, PNG, and WebP files are allowed",
        }));
        return;
      }

      setFiles((prev) => ({ ...prev, [name]: file }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, "");
      const validMobile = /^05[0-9]{8}$/.test(phoneDigits);
      const validLandline = /^0[2-4679][0-9]{7}$/.test(phoneDigits);

      if (!validMobile && !validLandline) {
        newErrors.phone =
          "Please enter a valid UAE phone number (e.g., 0501234567)";
      }
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!files.drivingLicense) {
      newErrors.drivingLicense = "Driving license is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep1() || !validateStep2()) {
      return;
    }

    try {
      const userData = {
        ...formData,
        files,
      };

      const result = await signup(userData);

      if (result.success) {
        if (result.requiresVerification) {
          setPendingEmail(formData.email);
          setShowOTPVerification(true);
        } else {
          setStep(4);
        }
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({ submit: "An unexpected error occurred. Please try again." });
    }
  };

  const handleVerificationSuccess = (verificationData) => {
    if (verificationData.user) {
      // User was successfully logged in after email verification
      navigate("/", { replace: true });
    } else {
      // Registration successful but no automatic login
      setShowOTPVerification(false);
      setStep(4);
    }
  };

  const handleBackToSignup = () => {
    setShowOTPVerification(false);
    setPendingEmail("");
    setStep(3);
  };

  // Step 1: Basic Information
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Create Your Account
        </h2>
        <p className="text-gray-600">Let's start with your basic information</p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            UAE Phone Number *
          </label>
          <PhoneInput
            value={formData.phone}
            onChange={handlePhoneChange}
            error={errors.phone}
            placeholder="0501234567"
            required={true}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selected Role
          </label>
          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
            {formData.role === "renter"
              ? "🚗 Rent cars from others"
              : "🔑 List my car for rent"}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            <Link to="/auth" className="text-green-600 hover:underline">
              Change selection
            </Link>
          </p>
        </div>

        <div>
          <label
            htmlFor="preferredCity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Preferred City *
          </label>
          <select
            id="preferredCity"
            name="preferredCity"
            value={formData.preferredCity}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {uaeCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm Password *
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formData.confirmPassword && (
            <div className="mt-1">
              {formData.password === formData.confirmPassword ? (
                <p className="text-xs text-green-600">✓ Passwords match</p>
              ) : (
                <p className="text-xs text-red-600">✗ Passwords do not match</p>
              )}
            </div>
          )}
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Step 2: Document Upload
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Upload Documents</h2>
        <p className="text-gray-600">
          We need to verify your identity for safety
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UAE / International / GCC Driving License *{" "}
            <span className="text-green-600 text-xs ml-1">(Required)</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
            <input
              type="file"
              name="drivingLicense"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="drivingLicense"
            />
            <label htmlFor="drivingLicense" className="cursor-pointer">
              {files.drivingLicense ? (
                <div className="text-green-600">
                  <p className="font-medium">✓ {files.drivingLicense.name}</p>
                  <p className="text-xs">Click to change</p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p className="font-medium">📄 Upload Driving License</p>
                  <p className="text-xs">Click to select file</p>
                </div>
              )}
            </label>
          </div>
          {errors.drivingLicense && (
            <p className="text-red-500 text-xs mt-1">{errors.drivingLicense}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Photo{" "}
            <span className="text-gray-500 text-xs ml-1">(Optional)</span>
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
              {files.profileImage ? (
                <img
                  src={URL.createObjectURL(files.profileImage)}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 text-gray-400">👤</div>
              )}
            </div>
            <div className="flex-1">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                <input
                  type="file"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="profileImage"
                />
                <label htmlFor="profileImage" className="cursor-pointer">
                  {files.profileImage ? (
                    <div className="text-green-600">
                      <p className="font-medium">✓ {files.profileImage.name}</p>
                      <p className="text-xs">Click to change</p>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <p className="font-medium">Upload Profile Photo</p>
                      <p className="text-xs">PNG, JPG, WebP up to 5MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-blue-500 text-lg">ℹ️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Document Guidelines
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc space-y-1 ml-4">
                <li>All files must be less than 5MB</li>
                <li>Accepted formats: JPEG, PNG, WebP</li>
                <li>Ensure documents are clear and readable</li>
                <li>Your information will be kept secure and private</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Review
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Review Your Information
        </h2>
        <p className="text-gray-600">
          Please review your details before submitting
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 mb-3">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <span className="ml-2 font-medium">{formData.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>
              <span className="ml-2 font-medium">{formData.email}</span>
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>
              <span className="ml-2 font-medium">
                🇦🇪 +971{formData.phone.replace(/^0/, "")}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Role:</span>
              <span className="ml-2 font-medium capitalize">
                {formData.role}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Preferred City:</span>
              <span className="ml-2 font-medium">{formData.preferredCity}</span>
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        <div>
          <h3 className="font-medium text-gray-900 mb-3">Uploaded Documents</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <span className="text-green-600">✓</span>
              <span className="ml-2">
                Driving License: {files.drivingLicense?.name}
              </span>
            </div>
            {files.profileImage && (
              <div className="flex items-center">
                <span className="text-green-600">✓</span>
                <span className="ml-2">
                  Profile Photo: {files.profileImage.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-yellow-500 text-lg">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Account Approval Required
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Your account will be reviewed by our team within 24-48 hours.
              You'll receive an email notification once approved.
            </p>
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
          {errors.submit}
        </div>
      )}
    </div>
  );

  // Step 4: Success - Redirect to dedicated success page
  const renderStep4 = () => {
    // Redirect to dedicated registration success page
    navigate("/registration-success", { 
      state: { 
        user: { 
          name: formData.name, 
          email: formData.email,
          phone: formData.phone,
          role: formData.role
        }, 
        role: formData.role 
      },
      replace: true
    });
    
    // Return a loading state while redirecting
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-green-600 text-4xl">✓</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Registration Successful!
          </h2>
          <p className="text-gray-600">
            Redirecting to welcome page...
          </p>
        </div>
      </div>
    );
  };

  // Show OTP verification if needed
  if (showOTPVerification) {
    return (
      <OTPVerification
        email={pendingEmail}
        onVerificationSuccess={handleVerificationSuccess}
        onBackToSignup={handleBackToSignup}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>Sign Up - BorrowMyCar</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
        {/* Left Side - Progress & Branding */}
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
            {step < 4 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">
                  Registration Progress
                </h3>
                <div className="space-y-3">
                  {[
                    { step: 1, label: "Basic Information", icon: "👤" },
                    { step: 2, label: "Document Upload", icon: "📄" },
                    { step: 3, label: "Review & Submit", icon: "✅" },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex items-center space-x-3"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          step >= item.step
                            ? "bg-green-500 text-white"
                            : step === item.step - 1
                            ? "bg-green-100 text-green-600 border-2 border-green-500"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {step > item.step ? "✓" : item.step}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            step >= item.step
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {item.label}
                        </p>
                      </div>
                      <span className="text-lg">{item.icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Why Choose Us?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>24/7 customer support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Flexible rental periods</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Secure payment processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}

              {/* Navigation Buttons */}
              {step < 4 && (
                <div className="flex space-x-4">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      Back
                    </button>
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Creating Account...
                        </span>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  )}
                </div>
              )}
            </form>

            {/* Login Link */}
            {step < 4 && (
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-green-600 hover:text-green-500 hover:underline transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
