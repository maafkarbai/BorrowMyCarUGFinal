// src/Profile.jsx - User Profile Page
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Settings,
  Edit3,
  Car,
  Star,
  Clock,
} from "lucide-react";
import API from "./api";
import ProfilePictureManager from "./components/ProfilePictureManager";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await API.get("/auth/profile");
      setUser(response.data.data.user);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpdate = (updatedUser) => {
    setUser(updatedUser);
    setMessage({
      type: "success",
      text: "Profile picture updated successfully",
    });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleProfilePictureError = (error) => {
    setMessage({ type: "error", text: error });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-40"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-medium mb-2">{error}</div>
          <button
            onClick={() => navigate("/")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{user?.name} - Profile | BorrowMyCar</title>
      </Helmet>

      <div className="max-w-4xl mx-auto p-6">
        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === "error"
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-green-50 border border-green-200 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Cover Background */}
          <div className="h-32 bg-gradient-to-r from-green-400 to-emerald-500"></div>

          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-6">
              <ProfilePictureManager
                user={user}
                onUpdateSuccess={handleProfilePictureUpdate}
                onError={handleProfilePictureError}
                size="xl"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4">
              <Link
                to="/settings"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </div>

            {/* User Info */}
            <div className="mt-12 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.name}
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-gray-600 capitalize text-lg">
                    {user.role}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isApproved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {user.isApproved
                        ? "Verified Account"
                        : "Pending Verification"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Contact Information
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-5 h-5 mr-3 text-gray-400" />
                      <span>{user.email}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Phone className="w-5 h-5 mr-3 text-gray-400" />
                      <span>{user.phone}</span>
                    </div>

                    {user.preferredCity && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                        <span>{user.preferredCity}, UAE</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Account Details
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                      <span>
                        Joined{" "}
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {user.lastLoginAt && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-5 h-5 mr-3 text-gray-400" />
                        <span>
                          Last active{" "}
                          {new Date(user.lastLoginAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* My Bookings */}
          <Link
            to="/my-bookings"
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  My Bookings
                </h3>
                <p className="text-sm text-gray-600">
                  View and manage your car rentals
                </p>
              </div>
            </div>
          </Link>

          {/* Browse Cars or My Cars */}
          <Link
            to={user.role === "owner" ? "/my-cars" : "/browse"}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Car className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {user.role === "owner" ? "My Cars" : "Browse Cars"}
                </h3>
                <p className="text-sm text-gray-600">
                  {user.role === "owner"
                    ? "Manage your car listings"
                    : "Find cars to rent"}
                </p>
              </div>
            </div>
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Settings className="w-8 h-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Settings</h3>
                <p className="text-sm text-gray-600">
                  Manage your account preferences
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Additional Information */}
        {user.role === "owner" && (
          <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Car Owner Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Active Listings</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">5.0</span>
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                to="/list-car"
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center block"
              >
                List a New Car
              </Link>
            </div>
          </div>
        )}

        {/* Security Notice */}
        {!user.isApproved && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start">
              <Shield className="w-6 h-6 text-yellow-600 mt-1 mr-3" />
              <div>
                <h3 className="font-medium text-yellow-800 mb-2">
                  Account Verification Pending
                </h3>
                <p className="text-yellow-700 text-sm">
                  Your account is currently under review. Once approved, you'll
                  have full access to all features. This process typically takes
                  24-48 hours.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
