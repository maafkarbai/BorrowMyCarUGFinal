import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  CheckCircle,
  User,
  Mail,
  Shield,
  Clock,
  ArrowRight,
  Phone,
  FileText,
  AlertCircle,
  Star,
  MessageCircle,
  Info,
  Car,
  Home,
} from "lucide-react";

const RegistrationSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);

  const { user, role } = location.state || {};

  // Auto-redirect after countdown
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate("/profile");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, user]);

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Registration Error - BorrowMyCar</title>
        </Helmet>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Registration Information Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn't find your registration details. Please try registering again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Register Now
              </Link>
              <Link
                to="/login"
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Login Instead
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Welcome to BorrowMyCar - Registration Successful</title>
        <meta
          name="description"
          content="Your account has been successfully created! Welcome to BorrowMyCar."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-4xl mx-auto p-6">
          {/* Success Animation Header */}
          <div className="text-center mb-8 pt-8">
            <div className="relative">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <CheckCircle className="w-16 h-16 text-green-600 animate-bounce" />
              </div>
              {/* Confetti effect */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-3 h-3 bg-green-400 rounded-full animate-ping`}
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${30 + (i % 2) * 20}%`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: "1.5s",
                    }}
                  />
                ))}
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎉 Welcome to BorrowMyCar!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Congratulations! Your account has been successfully created. You're now part of the UAE's premier car sharing community.
            </p>
          </div>

          {/* Main Registration Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header with user info */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Account Created Successfully</h2>
                  <p className="text-green-100 text-lg">
                    Welcome, {user.name}!
                  </p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <p className="text-green-100 text-sm">Account Type</p>
                  <p className="text-white font-semibold capitalize">
                    {role || user.role} Account
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* User Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-6 h-6 mr-3 text-green-600" />
                  Your Account Details
                </h3>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email Address</label>
                        <div className="flex items-center mt-1">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <p className="text-gray-900">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Account Type</label>
                        <p className="text-lg font-semibold text-gray-900 capitalize">
                          {role || user.role}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone Number</label>
                        <div className="flex items-center mt-1">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <p className="text-gray-900">{user.phone || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-green-600" />
                  Account Verification Status
                </h3>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-yellow-900 mb-2">
                        Pending Verification
                      </h4>
                      <p className="text-yellow-800 mb-4">
                        Your account is currently under review by our team. This typically takes 24-48 hours.
                      </p>
                      <div className="space-y-2 text-sm text-yellow-800">
                        <p>✅ Account created successfully</p>
                        <p>⏳ Document verification in progress</p>
                        <p>⭕ Full platform access pending approval</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Info className="w-6 h-6 mr-3 text-green-600" />
                  What Happens Next?
                </h3>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                        1
                      </div>
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Email Confirmation
                    </h4>
                    <p className="text-sm text-blue-700">
                      Check your email for a confirmation link to verify your email address
                    </p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                        2
                      </div>
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-orange-900 mb-2">
                      Document Review
                    </h4>
                    <p className="text-sm text-orange-700">
                      Our team will review your uploaded documents (ID and driving license)
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                        3
                      </div>
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-green-900 mb-2">
                      Account Activation
                    </h4>
                    <p className="text-sm text-green-700">
                      Once approved, you'll receive full access to {role === 'owner' ? 'list cars and manage bookings' : 'browse and book cars'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Role-specific features */}
              {role === 'owner' ? (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Car className="w-6 h-6 mr-3 text-green-600" />
                    Car Owner Features
                  </h3>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-800">
                      <div className="space-y-2">
                        <p>• List your cars for rent</p>
                        <p>• Set your own pricing and availability</p>
                        <p>• Manage booking requests</p>
                        <p>• Track earnings and payments</p>
                      </div>
                      <div className="space-y-2">
                        <p>• Connect with verified renters</p>
                        <p>• Access comprehensive insurance coverage</p>
                        <p>• Get 24/7 support for any issues</p>
                        <p>• Build your car sharing business</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Car className="w-6 h-6 mr-3 text-green-600" />
                    Renter Features
                  </h3>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-800">
                      <div className="space-y-2">
                        <p>• Browse thousands of cars across UAE</p>
                        <p>• Book instantly or request approval</p>
                        <p>• Flexible pickup and return options</p>
                        <p>• Secure payment processing</p>
                      </div>
                      <div className="space-y-2">
                        <p>• Comprehensive insurance included</p>
                        <p>• 24/7 roadside assistance</p>
                        <p>• Rate and review your experiences</p>
                        <p>• Save favorite cars and owners</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/profile"
                  className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 mr-2" />
                  Complete Your Profile
                </Link>

                {role === 'owner' ? (
                  <Link
                    to="/list-car"
                    className="flex items-center justify-center px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <Car className="w-5 h-5 mr-2" />
                    List Your First Car
                  </Link>
                ) : (
                  <Link
                    to="/browse"
                    className="flex items-center justify-center px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <Car className="w-5 h-5 mr-2" />
                    Browse Cars
                  </Link>
                )}

                <Link
                  to="/how-it-works"
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Info className="w-5 h-5 mr-2" />
                  How It Works
                </Link>
              </div>

              {/* Auto redirect notice */}
              <div className="mt-8 text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                <p>
                  🕒 You will be automatically redirected to your profile in{" "}
                  <span className="font-semibold text-green-600">
                    {countdown}
                  </span>{" "}
                  seconds
                </p>
                <button
                  onClick={() => navigate("/profile")}
                  className="text-green-600 hover:text-green-700 underline ml-2"
                >
                  Go now
                </button>{" "}
                or{" "}
                <Link
                  to="/"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  return home
                </Link>
              </div>
            </div>
          </div>

          {/* Important Reminders */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-semibold text-yellow-800 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Important Reminders
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-yellow-800">
              <div className="space-y-2">
                <p>• Check your email regularly for updates</p>
                <p>• Complete your profile with accurate information</p>
                <p>• Upload clear, high-quality documents</p>
              </div>
              <div className="space-y-2">
                <p>• Read our terms and conditions carefully</p>
                <p>• Familiarize yourself with our safety guidelines</p>
                <p>• Contact support if you need any assistance</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-yellow-200">
              <p className="text-sm text-yellow-700">
                <strong>Need help?</strong> Contact our support team at{" "}
                <a href="tel:+971800266669" className="font-semibold underline">
                  +971 800 BORROW
                </a>{" "}
                or{" "}
                <a
                  href="mailto:support@borrowmycar.ae"
                  className="font-semibold underline"
                >
                  support@borrowmycar.ae
                </a>
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Join thousands of satisfied users who trust BorrowMyCar
            </p>
            <div className="flex items-center justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-yellow-400 fill-current"
                />
              ))}
              <span className="ml-2 text-gray-700 font-medium">
                4.9/5 from 12,000+ reviews
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegistrationSuccess;