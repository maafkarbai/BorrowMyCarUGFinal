// src/Settings.jsx - Enhanced with Profile Picture Management
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Shield,
  Bell,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  Key,
  Database,
  Download,
  UserX,
  User,
  Edit3,
} from "lucide-react";
import API from "./api";
import ProfilePictureManager from "./components/ProfilePictureManager";
import { useNotifications } from "./context/NotificationContext";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const { preferences, updatePreferences } = useNotifications();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    preferredCity: "",
  });

  // Security settings
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification settings - initialized from context
  const [notifications, setNotifications] = useState(preferences);

  // Sync notification preferences from context
  useEffect(() => {
    setNotifications(preferences);
  }, [preferences]);

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showPhone: false,
    showEmail: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await API.get("/auth/profile");
      const userData = response.data.data.user;
      setUser(userData);

      // Initialize profile form
      setProfileForm({
        name: userData.name || "",
        preferredCity: userData.preferredCity || "",
      });

      // Load user preferences (mock data for now)
      // In real app, these would come from the API
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setMessage({
          type: "error",
          text: "Failed to load user data",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);

    try {
      const response = await API.patch("/auth/profile", profileForm);
      if (response.data.success) {
        setUser(response.data.data.user);
        showMessage("success", "Profile updated successfully");
      }
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleProfilePictureUpdate = (updatedUser) => {
    setUser(updatedUser);
    showMessage("success", "Profile picture updated successfully");
  };

  const handleProfilePictureError = (error) => {
    showMessage("error", error);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("error", "New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters long");
      return;
    }

    setUpdateLoading(true);
    try {
      await API.patch("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showMessage("success", "Password updated successfully");
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.message || "Failed to update password"
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setUpdateLoading(true);
    try {
      await updatePreferences(notifications);
      showMessage("success", "Notification preferences updated");
    } catch {
      showMessage("error", "Failed to update notification preferences");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    setUpdateLoading(true);
    try {
      await API.patch("/auth/preferences", { privacy });
      showMessage("success", "Privacy settings updated");
    } catch {
      showMessage("error", "Failed to update privacy settings");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDataExport = async () => {
    setUpdateLoading(true);
    try {
      const response = await API.get("/auth/export-data", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "borrowmycar-data.json");
      document.body.appendChild(link);
      link.click();
      link.remove();
      showMessage(
        "success",
        "Data export started. Download will begin shortly."
      );
    } catch {
      showMessage("error", "Failed to export data");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmDelete) return;

    const finalConfirm = window.confirm(
      "This will permanently delete all your data, bookings, and car listings. Type 'DELETE' to confirm."
    );
    if (!finalConfirm) return;

    setUpdateLoading(true);
    try {
      await API.delete("/auth/account");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/", { replace: true });
    } catch {
      showMessage("error", "Failed to delete account");
    } finally {
      setUpdateLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Eye },
    { id: "data", label: "Data & Account", icon: Database },
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Account Settings - BorrowMyCar</title>
      </Helmet>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account preferences and security settings
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === "error"
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-green-50 border border-green-200 text-green-700"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle className="w-5 h-5 mr-2" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Profile Information
                  </h2>

                  <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8 space-y-6 lg:space-y-0">
                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center space-y-4">
                      <ProfilePictureManager
                        user={user}
                        onUpdateSuccess={handleProfilePictureUpdate}
                        onError={handleProfilePictureError}
                        size="xl"
                      />
                      <div className="text-center">
                        <h3 className="font-medium text-gray-900">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {user.role}
                        </p>
                        <div className="flex items-center justify-center mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isApproved
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {user.isApproved ? "Verified" : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Profile Form */}
                    <div className="flex-1">
                      <form
                        onSubmit={handleProfileUpdate}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Email cannot be changed for security reasons
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            value={user.phone}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Phone number cannot be changed for security reasons
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred City
                          </label>
                          <select
                            value={profileForm.preferredCity}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                preferredCity: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">Select a city</option>
                            {[
                              "Dubai",
                              "Abu Dhabi",
                              "Sharjah",
                              "Ajman",
                              "Fujairah",
                              "Ras Al Khaimah",
                              "Umm Al Quwain",
                            ].map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={updateLoading}
                          className="flex items-center bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          {updateLoading ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Update Profile
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Password & Security
                  </h2>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              current: !showPasswords.current,
                            })
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        >
                          {showPasswords.current ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              new: !showPasswords.new,
                            })
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              confirm: !showPasswords.confirm,
                            })
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="flex items-center bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      {updateLoading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Two-Factor Authentication */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Two-Factor Authentication
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          SMS Authentication
                        </p>
                        <p className="text-sm text-gray-600">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Notification Preferences
                  </h2>
                  <div className="space-y-4">
                    {/* Email Notifications */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Email Notifications
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              Booking Updates
                            </p>
                            <p className="text-sm text-gray-600">
                              Get notified about booking confirmations,
                              cancellations, and changes
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.emailBookings}
                              onChange={(e) =>
                                setNotifications({
                                  ...notifications,
                                  emailBookings: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              Promotions & Offers
                            </p>
                            <p className="text-sm text-gray-600">
                              Receive emails about special deals and promotions
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.emailPromotions}
                              onChange={(e) =>
                                setNotifications({
                                  ...notifications,
                                  emailPromotions: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* SMS Notifications */}
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        SMS Notifications
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              Booking Alerts
                            </p>
                            <p className="text-sm text-gray-600">
                              Important booking updates via SMS
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.smsBookings}
                              onChange={(e) =>
                                setNotifications({
                                  ...notifications,
                                  smsBookings: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              Pickup Reminders
                            </p>
                            <p className="text-sm text-gray-600">
                              Reminders about upcoming car pickups
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.smsReminders}
                              onChange={(e) =>
                                setNotifications({
                                  ...notifications,
                                  smsReminders: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleNotificationUpdate}
                        disabled={updateLoading}
                        className="flex items-center bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        {updateLoading ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Preferences
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Privacy Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Profile Visibility
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="public"
                            name="profileVisibility"
                            value="public"
                            checked={privacy.profileVisibility === "public"}
                            onChange={(e) =>
                              setPrivacy({
                                ...privacy,
                                profileVisibility: e.target.value,
                              })
                            }
                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                          />
                          <label htmlFor="public" className="ml-3">
                            <span className="font-medium text-gray-900">
                              Public
                            </span>
                            <p className="text-sm text-gray-600">
                              Your profile is visible to all users
                            </p>
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="private"
                            name="profileVisibility"
                            value="private"
                            checked={privacy.profileVisibility === "private"}
                            onChange={(e) =>
                              setPrivacy({
                                ...privacy,
                                profileVisibility: e.target.value,
                              })
                            }
                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                          />
                          <label htmlFor="private" className="ml-3">
                            <span className="font-medium text-gray-900">
                              Private
                            </span>
                            <p className="text-sm text-gray-600">
                              Only you can see your full profile details
                            </p>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              Show Phone Number
                            </p>
                            <p className="text-sm text-gray-600">
                              Allow other users to see your phone number
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={privacy.showPhone}
                              onChange={(e) =>
                                setPrivacy({
                                  ...privacy,
                                  showPhone: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              Show Email Address
                            </p>
                            <p className="text-sm text-gray-600">
                              Allow other users to see your email address
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={privacy.showEmail}
                              onChange={(e) =>
                                setPrivacy({
                                  ...privacy,
                                  showEmail: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>

                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handlePrivacyUpdate}
                        disabled={updateLoading}
                        className="flex items-center bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        {updateLoading ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Settings
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data & Account Tab */}
            {activeTab === "data" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Data & Account Management
                  </h2>
                  <div className="space-y-6">
                    {/* Data Export */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <Download className="w-6 h-6 text-blue-600 mt-1 mr-3" />
                        <div className="flex-1">
                          <h3 className="font-medium text-blue-900 mb-2">
                            Export Your Data
                          </h3>
                          <p className="text-blue-800 mb-4">
                            Download a copy of all your personal data, including
                            profile information, bookings, and car listings.
                          </p>
                          <button
                            onClick={handleDataExport}
                            disabled={updateLoading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            {updateLoading ? "Preparing..." : "Download Data"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Account Deletion */}
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <UserX className="w-6 h-6 text-red-600 mt-1 mr-3" />
                        <div className="flex-1">
                          <h3 className="font-medium text-red-900 mb-2">
                            Delete Account
                          </h3>
                          <p className="text-red-800 mb-4">
                            Permanently delete your account and all associated
                            data. This action cannot be undone.
                          </p>
                          <div className="space-y-2 text-sm text-red-700 mb-4">
                            <p>• All your bookings will be cancelled</p>
                            <p>• Your car listings will be removed</p>
                            <p>
                              • Your profile and data will be permanently
                              deleted
                            </p>
                            <p>
                              • You will lose access to all account features
                            </p>
                          </div>
                          <button
                            onClick={handleAccountDeletion}
                            disabled={updateLoading}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {updateLoading ? "Deleting..." : "Delete Account"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
