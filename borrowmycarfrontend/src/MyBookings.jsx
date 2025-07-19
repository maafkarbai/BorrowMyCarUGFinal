import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Calendar,
  Car,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import API from "./api";
import { useAuth } from "./context/AuthContext";
import UserAvatar from "./components/UserAvatar";

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [updateLoading, setUpdateLoading] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }

    // Show success message if coming from booking
    if (location.state?.message) {
      setMessage({ type: "success", text: location.state.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  }, [location.state, user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      // Get user role to determine endpoint
      const userRole = user?.role || "renter";
      const endpoint =
        userRole === "owner" ? "/bookings/owner" : "/bookings/me";
      console.log("Fetching bookings from:", endpoint);

      const response = await API.get(endpoint);
      console.log("Bookings response:", response.data);

      // Handle different response structures
      let bookingsData = [];
      if (response.data.data?.bookings) {
        bookingsData = response.data.data.bookings;
      } else if (response.data.bookings) {
        bookingsData = response.data.bookings;
      } else if (Array.isArray(response.data.data)) {
        bookingsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        bookingsData = response.data;
      }

      setBookings(bookingsData);
    } catch (err) {
      console.error("Booking fetch error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch bookings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setUpdateLoading(bookingId);

      const response = await API.put(`/bookings/${bookingId}`, {
        status: newStatus,
      });

      console.log("Status update response:", response.data);

      // Refresh bookings
      await fetchBookings();

      setMessage({
        type: "success",
        text: `Booking ${newStatus} successfully`,
      });

      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error("Status update error:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update booking status",
      });

      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } finally {
      setUpdateLoading("");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-blue-100 text-blue-800 border-blue-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      active: "bg-purple-100 text-purple-800 border-purple-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filterBookings = (status) => {
    if (status === "all") return bookings;
    if (status === "active") {
      return bookings.filter((b) =>
        ["pending", "approved", "confirmed", "active"].includes(b.status)
      );
    }
    return bookings.filter((b) => b.status === status);
  };

  const filteredBookings = filterBookings(activeTab);

  // Calculate total earnings for owners
  const calculateEarnings = () => {
    if (user?.role !== "owner") return 0;
    return bookings
      .filter((b) => ["completed"].includes(b.status))
      .reduce(
        (total, booking) =>
          total + (booking.totalCost || booking.totalPayable || 0),
        0
      );
  };

  const tabs = [
    { id: "all", label: "All Bookings" },
    { id: "active", label: "Active" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  if (loading) {
    return (
      <>
        <Helmet>
          <title>My Bookings - BorrowMyCar</title>
        </Helmet>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {user?.role === "owner" ? "Booking Requests" : "My Bookings"} -
          BorrowMyCar
        </title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.role === "owner" ? "Booking Requests" : "My Bookings"}
          </h1>
          <p className="text-gray-600">
            {user?.role === "owner"
              ? "Manage booking requests for your vehicles"
              : "Track your car rental history and active bookings"}
          </p>

          {/* Owner Earnings Summary */}
          {user?.role === "owner" && bookings.length > 0 && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-900">Total Earnings</h3>
                  <p className="text-2xl font-bold text-green-600">
                    AED {calculateEarnings().toLocaleString()}
                  </p>
                </div>
                <div className="text-green-600">
                  <Car className="w-8 h-8" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center border ${
              message.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
            }`}
          >
            {message.type === "error" ? (
              <XCircle className="w-5 h-5 mr-2" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {filterBookings(tab.id).length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
            <XCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Error Loading Bookings
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchBookings}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Bookings List */}
        {filteredBookings.length === 0 && !error ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === "all"
                ? user?.role === "owner"
                  ? "You haven't received any booking requests yet."
                  : "You haven't made any bookings yet."
                : `No ${activeTab} bookings found.`}
            </p>
            {user?.role === "renter" && (
              <button
                onClick={() => navigate("/browse")}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Browse Cars
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Main Content */}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Car Info */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Car Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={
                            booking.car?.images?.[0] ||
                            "https://via.placeholder.com/120x80?text=Car"
                          }
                          alt={booking.car?.title || "Car"}
                          className="w-20 h-16 sm:w-24 sm:h-18 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/120x80?text=Car";
                          }}
                        />
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg truncate">
                            {booking.car?.title || "Car Details Not Available"}
                          </h3>
                          <div className="flex items-center ml-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">
                                {booking.status}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Booking Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(booking.startDate).toLocaleDateString()}{" "}
                              - {new Date(booking.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {booking.numberOfDays || booking.totalDays || 1}{" "}
                              day
                              {(booking.numberOfDays ||
                                booking.totalDays ||
                                1) !== 1
                                ? "s"
                                : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-green-600 font-medium">
                              AED{" "}
                              {booking.totalCost || booking.totalPayable || 0}
                            </span>
                          </div>
                          {booking.car?.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{booking.car.city}</span>
                            </div>
                          )}
                        </div>

                        {/* Renter/Owner Info */}
                        {user?.role === "owner" && booking.renter && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-gray-900 mb-2">
                              Renter Information
                            </h4>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <UserAvatar user={booking.renter} size="sm" />
                                <span className="font-medium">
                                  {booking.renter.name}
                                </span>
                              </div>
                              {booking.renter.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{booking.renter.phone}</span>
                                </div>
                              )}
                              {booking.renter.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  <span>{booking.renter.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {user?.role === "renter" && booking.car?.owner && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-gray-900 mb-2">
                              Car Owner
                            </h4>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <UserAvatar user={booking.car.owner} size="sm" />
                                <span className="font-medium">
                                  {booking.car.owner.name}
                                </span>
                              </div>
                              {booking.car.owner.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{booking.car.owner.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {(booking.renterNotes || booking.ownerNotes) && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <h4 className="font-medium text-blue-900 mb-1">
                              Notes
                            </h4>
                            <p className="text-blue-800 text-sm">
                              {booking.renterNotes || booking.ownerNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:min-w-[120px]">
                      {/* Owner Actions */}
                      {user?.role === "owner" &&
                        booking.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking._id, "approved")
                              }
                              disabled={updateLoading === booking._id}
                              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              {updateLoading === booking._id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approve
                                </>
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking._id, "rejected")
                              }
                              disabled={updateLoading === booking._id}
                              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              {updateLoading === booking._id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Reject
                                </>
                              )}
                            </button>
                          </>
                        )}

                      {/* Mark as completed for active bookings */}
                      {user?.role === "owner" &&
                        booking.status === "active" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking._id, "completed")
                            }
                            disabled={updateLoading === booking._id}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {updateLoading === booking._id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Complete
                              </>
                            )}
                          </button>
                        )}

                      {/* Renter Actions */}
                      {user?.role === "renter" &&
                        ["pending", "approved"].includes(booking.status) && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking._id, "cancelled")
                            }
                            disabled={updateLoading === booking._id}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {updateLoading === booking._id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Cancel
                              </>
                            )}
                          </button>
                        )}

                      {/* View Details Button */}
                      <button
                        onClick={() => navigate(`/cars/${booking.car?._id}`)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Car
                      </button>

                    </div>
                  </div>
                </div>

                {/* Additional Details - Expandable */}
                <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Booking ID:</span>
                      <span className="ml-1 font-mono text-xs">
                        {booking._id}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <span className="ml-1">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Payment:</span>
                      <span className="ml-1 capitalize">
                        {booking.paymentMethod || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More / Pagination */}
        {filteredBookings.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              Showing {filteredBookings.length} of {bookings.length} total
              bookings
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default MyBookings;
