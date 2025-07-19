import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Logo from "./assets/BorrowMyCar.png";
import { Helmet } from "react-helmet-async";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const result = await login(formData);

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - BorrowMyCar</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto h-20 w-48 flex items-center justify-center">
                <img
                  src={Logo}
                  alt="BorrowMyCar"
                  className="h-full w-full object-contain"
                />
              </div>
              <h1 className="mt-6 text-3xl font-bold text-gray-900">
                Welcome Back
              </h1>
              <p className="mt-2 text-gray-600">
                Sign in to your{" "}
                <span className="font-semibold text-green-500">
                  BorrowMyCar
                </span>{" "}
                account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    required
                    autoComplete="email"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    autoComplete="current-password"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="ml-2 text-gray-700">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-green-600 hover:text-green-700 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/auth"
                  className="font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right Side - Welcome Section */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-8">
          <div className="text-center max-w-md space-y-6">
            <div className="w-64 m-auto h-48 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl shadow-lg flex items-center justify-center text-white text-6xl">
              🚗
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-gray-800">
                Welcome Back! 👋
              </h2>
              <p className="text-gray-600 text-lg">
                Ready to hit the road again?
              </p>
              <p className="text-sm text-gray-500">
                Access your bookings, browse available cars, and manage your
                rentals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
