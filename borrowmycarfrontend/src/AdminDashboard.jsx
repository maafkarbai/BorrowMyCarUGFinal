import { useState, useEffect } from "react";
import { useAdminAuth } from "./context/AdminAuthProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import API from "./api";

// Dashboard Stats Component
const DashboardStats = ({ stats }) => {
  if (!stats) return null;

  const statCards = [
    {
      title: "Total Users",
      value: stats.users.total,
      subtext: `${stats.users.pending} pending approval`,
      color: "blue",
      icon: "👥",
    },
    {
      title: "Total Cars",
      value: stats.cars.total,
      subtext: `${stats.cars.pending} pending approval`,
      color: "green",
      icon: "🚗",
    },
    {
      title: "Total Bookings",
      value: stats.bookings.total,
      subtext: `${stats.bookings.thisMonth} this month`,
      color: "purple",
      icon: "📅",
    },
    {
      title: "Total Revenue",
      value: `AED ${stats.revenue.total?.toLocaleString() || 0}`,
      subtext: `${stats.metrics.fiveStarRatio}% 5-star ratings`,
      color: "yellow",
      icon: "💰",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 truncate">
                {stat.title}
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1 truncate">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                {stat.subtext}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <div
                className={`w-12 h-12 lg:w-14 lg:h-14 rounded-lg ${
                  stat.color === 'blue' ? 'bg-blue-50' :
                  stat.color === 'green' ? 'bg-green-50' :
                  stat.color === 'yellow' ? 'bg-yellow-50' :
                  stat.color === 'red' ? 'bg-red-50' :
                  'bg-gray-50'
                } flex items-center justify-center`}
              >
                <span className="text-2xl lg:text-3xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Search and Filter Component
const SearchAndFilter = ({
  type,
  searchTerm,
  handleSearch,
  filterRole,
  filterStatus,
  handleFilter,
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-6">
    <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
      <div className="flex-1">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder={`Search ${type}...`}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>
      {type === "users" && (
        <>
          <select
            value={filterRole}
            onChange={(e) => handleFilter("role", e.target.value)}
            className="min-w-0 sm:min-w-[120px] px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
          >
            <option value="">All Roles</option>
            <option value="renter">Renter</option>
            <option value="owner">Owner</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => handleFilter("status", e.target.value)}
            className="min-w-0 sm:min-w-[120px] px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
          >
            <option value="">All Status</option>
            <option value="true">Approved</option>
            <option value="false">Pending</option>
          </select>
        </>
      )}
      {type === "cars" && (
        <select
          value={filterStatus}
          onChange={(e) => handleFilter("status", e.target.value)}
          className="min-w-0 sm:min-w-[120px] px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      )}
    </div>
  </div>
);

// Car Card Component
const CarCard = ({ car, updateCarStatus, deleteCar }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4 hover:shadow-md transition-shadow duration-200">
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-4">
          {car.images && car.images[0] && (
            <img
              src={car.images[0]}
              alt={car.title}
              className="w-20 h-16 lg:w-24 lg:h-18 rounded-lg mr-4 object-cover flex-shrink-0 border border-gray-200"
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">
              {car.title}
            </h3>
            <p className="text-gray-600 truncate">
              {car.make} {car.model} ({car.year})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Owner</p>
            <p className="font-medium text-gray-900 truncate">
              {car.owner?.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-medium text-gray-900">AED {car.price}/day</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">City</p>
            <p className="font-medium text-gray-900 truncate">{car.city}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                car.status === "active"
                  ? "bg-green-100 text-green-800"
                  : car.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {car.status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-row lg:flex-col gap-2 justify-end">
        {car.status === "pending" && (
          <>
            <button
              onClick={() => updateCarStatus(car._id, "active")}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Approve
            </button>
            <button
              onClick={() =>
                updateCarStatus(car._id, "rejected", "Not meeting requirements")
              }
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Reject
            </button>
          </>
        )}
        <button
          onClick={() => deleteCar(car._id)}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete
        </button>
      </div>
    </div>
  </div>
);

// Booking Card Component
const BookingCard = ({ booking }) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-4">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {booking.car?.title || "Car Details Unavailable"}
            </h3>
            <p className="text-gray-600">
              Renter: {booking.renter?.name} ({booking.renter?.email})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Start Date</p>
            <p className="font-medium">
              {new Date(booking.startDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">End Date</p>
            <p className="font-medium">
              {new Date(booking.endDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-medium">AED {booking.totalPayable}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                booking.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : booking.status === "active"
                  ? "bg-blue-100 text-blue-800"
                  : booking.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {booking.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Payment Status</p>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                booking.paymentStatus === "paid"
                  ? "bg-green-100 text-green-800"
                  : booking.paymentStatus === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {booking.paymentStatus || "pending"}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="font-medium">
              {new Date(booking.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Pagination Component
const Pagination = ({ currentPagination, onPageChange }) => {
  if (!currentPagination || currentPagination.totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPagination.currentPage - 1)}
        disabled={!currentPagination.hasPrev}
        className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Previous
      </button>
      <span className="px-4 py-2 text-sm text-gray-600">
        Page {currentPagination.currentPage} of {currentPagination.totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPagination.currentPage + 1)}
        disabled={!currentPagination.hasNext}
        className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
};

// User Card Component
const UserCard = ({
  user,
  showActions = true,
  activeTab,
  selectedUsers,
  toggleUserSelection,
  fetchUserDetails,
  approveUser,
  rejectUser,
  deleteUser,
  modifyUser,
  toggleBlockUser,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div className="flex items-start flex-1 min-w-0">
          {activeTab === "users" && (
            <input
              type="checkbox"
              checked={selectedUsers.includes(user._id)}
              onChange={() => toggleUserSelection(user._id)}
              className="mr-4 mt-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-4">
              {user.profileImage && (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-14 h-14 rounded-full mr-4 border-2 border-gray-200 object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">
                  {user.name}
                </h3>
                <p className="text-gray-600 truncate">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900 truncate">
                  {user.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === "owner"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preferred City</p>
                <p className="font-medium text-gray-900 truncate">
                  {user.preferredCity || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="flex flex-col gap-1">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      user.isApproved
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.isApproved ? "Approved" : "Pending"}
                  </span>
                  {user.isBlocked && (
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Blocked
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Documents</p>
              <div className="flex flex-wrap gap-2">
                {user.drivingLicenseUrl && (
                  <a
                    href={user.drivingLicenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-2 py-1 rounded"
                  >
                    Driving License
                  </a>
                )}
                {user.emiratesIdUrl && (
                  <a
                    href={user.emiratesIdUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-2 py-1 rounded"
                  >
                    Emirates ID
                  </a>
                )}
                {user.visaUrl && (
                  <a
                    href={user.visaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-2 py-1 rounded"
                  >
                    Visa
                  </a>
                )}
                {user.passportUrl && (
                  <a
                    href={user.passportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-2 py-1 rounded"
                  >
                    Passport
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row lg:flex-col gap-2 justify-end">
          <button
            onClick={() => fetchUserDetails(user._id)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View Details
          </button>
          <button
            onClick={() => modifyUser(user._id)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Modify
          </button>
          <button
            onClick={() => toggleBlockUser(user._id, user.isBlocked)}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium text-white ${
              user.isBlocked
                ? "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                : "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  user.isBlocked
                    ? "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    : "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                }
              />
            </svg>
            {user.isBlocked ? "Unblock" : "Block"}
          </button>
          {showActions && !user.isApproved && (
            <>
              <button
                onClick={() => approveUser(user._id)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Approve
              </button>
              <button
                onClick={() => rejectUser(user._id, "Documents not clear")}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Reject
              </button>
            </>
          )}
          <button
            onClick={() => deleteUser(user._id)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// User Details Modal Component
const UserDetailsModal = ({ showUserDetails, setShowUserDetails }) => {
  if (!showUserDetails) return null;

  const { user: userDetails, cars, bookings } = showUserDetails;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
            <button
              onClick={() => setShowUserDetails(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Personal Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Name</label>
                  <p className="font-medium">{userDetails.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{userDetails.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="font-medium">{userDetails.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Role</label>
                  <p className="font-medium">{userDetails.role}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      userDetails.isApproved
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {userDetails.isApproved ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Account Activity</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Cars Listed</label>
                  <p className="font-medium">{cars.length}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Total Bookings
                  </label>
                  <p className="font-medium">{bookings.length}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Member Since</label>
                  <p className="font-medium">
                    {new Date(userDetails.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {cars.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Listed Cars</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cars.map((car) => (
                  <div
                    key={car._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-medium">{car.title}</h4>
                    <p className="text-sm text-gray-600">
                      {car.make} {car.model} ({car.year})
                    </p>
                    <p className="text-sm">Price: AED {car.price}/day</p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                        car.status === "active"
                          ? "bg-green-100 text-green-800"
                          : car.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {car.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// System Configuration Modal
const SystemConfigModal = ({
  showSystemConfig,
  setShowSystemConfig,
  systemConfig,
  updateSystemConfig,
}) => {
  if (!showSystemConfig || !systemConfig) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">
              System Configuration
            </h2>
            <button
              onClick={() => setShowSystemConfig(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Auto Approval
                    </label>
                    <p className="text-sm text-gray-500">
                      Automatically approve new users
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemConfig.features.autoApproval}
                    onChange={(e) =>
                      updateSystemConfig({ autoApproval: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Maintenance Mode
                    </label>
                    <p className="text-sm text-gray-500">
                      Put the platform in maintenance mode
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemConfig.features.maintenanceMode}
                    onChange={(e) =>
                      updateSystemConfig({ maintenanceMode: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Registration Open
                    </label>
                    <p className="text-sm text-gray-500">
                      Allow new user registrations
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemConfig.features.registrationOpen}
                    onChange={(e) =>
                      updateSystemConfig({ registrationOpen: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                Platform Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Version</label>
                  <p className="font-medium">{systemConfig.platform.version}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Environment</label>
                  <p className="font-medium">
                    {systemConfig.platform.environment}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Max Cars Per Owner
                  </label>
                  <p className="font-medium">
                    {systemConfig.limits.maxCarsPerOwner}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Payment Gateway
                  </label>
                  <p className="font-medium">
                    {systemConfig.features.paymentGateway}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modify User Modal
const ModifyUserModal = ({ user, setShowModifyUser, saveModifiedUser }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "renter",
    preferredCity: user?.preferredCity || "",
    isApproved: user?.isApproved || false,
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "renter",
        preferredCity: user.preferredCity || "",
        isApproved: user.isApproved || false,
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    saveModifiedUser(user._id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">Modify User</h2>
            <button
              onClick={() => setShowModifyUser(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="renter">Renter</option>
                <option value="owner">Owner</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred City
              </label>
              <select
                value={formData.preferredCity}
                onChange={(e) =>
                  setFormData({ ...formData, preferredCity: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a city</option>
                <option value="Dubai">Dubai</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Sharjah">Sharjah</option>
                <option value="Ajman">Ajman</option>
                <option value="Fujairah">Fujairah</option>
                <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                <option value="Umm Al Quwain">Umm Al Quwain</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isApproved"
                checked={formData.isApproved}
                onChange={(e) =>
                  setFormData({ ...formData, isApproved: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isApproved"
                className="ml-2 block text-sm text-gray-700"
              >
                Approved
              </label>
            </div>

            {user.isBlocked && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>User is blocked</strong>
                  {user.blockReason && (
                    <>
                      <br />
                      Reason: {user.blockReason}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowModifyUser(null)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Bulk Actions Bar
const BulkActionsBar = ({
  selectedUsers,
  bulkUserAction,
  setSelectedUsers,
}) => {
  if (selectedUsers.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-900">
          {selectedUsers.length} users selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => bulkUserAction("approve")}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            Approve All
          </button>
          <button
            onClick={() => bulkUserAction("reject", "Bulk rejection")}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Reject All
          </button>
          <button
            onClick={() => bulkUserAction("delete")}
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
          >
            Delete All
          </button>
          <button
            onClick={() => setSelectedUsers([])}
            className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50"
          >
            Clear Selection
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { adminUser, getAdminAPI } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [_selectedCars, _setSelectedCars] = useState([]);
  const [showUserDetails, setShowUserDetails] = useState(null);
  const [showSystemConfig, setShowSystemConfig] = useState(false);
  const [showModifyUser, setShowModifyUser] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [systemConfig, setSystemConfig] = useState(null);
  const [pagination, setPagination] = useState({
    users: { page: 1, totalPages: 1 },
    cars: { page: 1, totalPages: 1 },
    bookings: { page: 1, totalPages: 1 },
  });

  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/admin/users")) return "users";
    if (path.includes("/admin/cars")) return "cars";
    if (path.includes("/admin/bookings")) return "bookings";
    if (path.includes("/admin/reports")) return "reports";
    if (path.includes("/admin/settings")) return "settings";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    if (!adminUser || adminUser.role !== "admin") {
      navigate("/admin");
      return;
    }
    
    const initializeData = async () => {
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchCars(),
        fetchBookings(),
        fetchActivityLog(),
        fetchSystemConfig(),
      ]);
    };
    
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminUser, navigate]);

  const fetchStats = async () => {
    try {
      const adminAPI = getAdminAPI();
      const response = await adminAPI.get("/admin/stats");
      if (response.data.success) {
        setStats(response.data.data.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchUsers = async (page = 1, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...filters,
      });

      const adminAPI = getAdminAPI();
      const response = await adminAPI.get(`/admin/users?${params}`);

      if (response.data.success) {
        const { users, pagination: userPagination } = response.data.data;
        setAllUsers(users);
        setPendingUsers(users.filter((u) => !u.isApproved));
        setPagination((prev) => ({ ...prev, users: userPagination }));
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async (page = 1, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...filters,
      });

      const adminAPI = getAdminAPI();
      const response = await adminAPI.get(`/admin/cars?${params}`);

      if (response.data.success) {
        const { cars, pagination: carPagination } = response.data.data;
        setAllCars(cars);
        setPagination((prev) => ({ ...prev, cars: carPagination }));
      }
    } catch (err) {
      console.error("Error fetching cars:", err);
      setError("Failed to fetch cars");
    }
  };

  const fetchBookings = async (page = 1, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...filters,
      });

      const adminAPI = getAdminAPI();
      const response = await adminAPI.get(`/admin/bookings?${params}`);

      if (response.data.success) {
        const { bookings, pagination: bookingPagination } = response.data.data;
        setAllBookings(bookings);
        setPagination((prev) => ({ ...prev, bookings: bookingPagination }));
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to fetch bookings");
    }
  };

  const approveUser = async (userId) => {
    try {
      const adminAPI = getAdminAPI();
      await adminAPI.patch(`/admin/users/${userId}/approve`);
      await Promise.all([fetchUsers(), fetchStats()]);
      setError("");
    } catch (err) {
      console.error("Error approving user:", err);
      setError("Failed to approve user");
    }
  };

  const rejectUser = async (userId, reason = "") => {
    try {
      const adminAPI = getAdminAPI();
      await adminAPI.patch(`/admin/users/${userId}/reject`, { reason });
      await Promise.all([fetchUsers(), fetchStats()]);
      setError("");
    } catch (err) {
      console.error("Error rejecting user:", err);
      setError("Failed to reject user");
    }
  };

  const updateCarStatus = async (carId, status, reason = "") => {
    try {
      const adminAPI = getAdminAPI();
      await adminAPI.patch(`/admin/cars/${carId}/approval`, { status, reason });
      await Promise.all([fetchCars(), fetchStats()]);
      setError("");
    } catch (err) {
      console.error("Error updating car status:", err);
      setError("Failed to update car status");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const adminAPI = getAdminAPI();
      await adminAPI.delete(`/admin/users/${userId}`);
      await Promise.all([fetchUsers(), fetchStats()]);
      setError("");
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user");
    }
  };

  const deleteCar = async (carId) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;

    try {
      const adminAPI = getAdminAPI();
      await adminAPI.delete(`/admin/cars/${carId}`);
      await Promise.all([fetchCars(), fetchStats()]);
      setError("");
    } catch (err) {
      console.error("Error deleting car:", err);
      setError("Failed to delete car");
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (activeTab === "users") {
      fetchUsers(1, {
        search: term,
        role: filterRole,
        isApproved: filterStatus,
      });
    } else if (activeTab === "cars") {
      fetchCars(1, { search: term, status: filterStatus });
    }
  };

  const handleFilter = (type, value) => {
    if (type === "role") {
      setFilterRole(value);
      fetchUsers(1, {
        search: searchTerm,
        role: value,
        isApproved: filterStatus,
      });
    } else if (type === "status") {
      setFilterStatus(value);
      if (activeTab === "users") {
        fetchUsers(1, {
          search: searchTerm,
          role: filterRole,
          isApproved: value,
        });
      } else if (activeTab === "cars") {
        fetchCars(1, { search: searchTerm, status: value });
      }
    }
  };

  const handleTabChange = (tab) => {
    if (tab === "dashboard") {
      navigate("/admin/dashboard");
    } else {
      navigate(`/admin/${tab}`);
    }
  };

  const fetchActivityLog = async () => {
    try {
      const adminAPI = getAdminAPI();
      const response = await adminAPI.get("/admin/activity-log");
      if (response.data.success) {
        setActivityLog(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching activity log:", err);
    }
  };

  const fetchSystemConfig = async () => {
    try {
      const adminAPI = getAdminAPI();
      const response = await adminAPI.get("/admin/config");
      if (response.data.success) {
        setSystemConfig(response.data.data.config);
      }
    } catch (err) {
      console.error("Error fetching system config:", err);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const adminAPI = getAdminAPI();
      const response = await adminAPI.get(`/admin/users/${userId}/details`);
      if (response.data.success) {
        setShowUserDetails(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Failed to fetch user details");
    }
  };

  const bulkUserAction = async (action, reason = "") => {
    if (selectedUsers.length === 0) {
      setError("Please select users first");
      return;
    }

    const actionText =
      action === "approve"
        ? "approve"
        : action === "reject"
        ? "reject"
        : "delete";
    if (
      !window.confirm(
        `Are you sure you want to ${actionText} ${selectedUsers.length} users?`
      )
    ) {
      return;
    }

    try {
      const adminAPI = getAdminAPI();
      await adminAPI.post("/admin/users/bulk-actions", {
        userIds: selectedUsers,
        action,
        reason,
      });

      await Promise.all([fetchUsers(), fetchStats()]);
      setSelectedUsers([]);
      setError("");
    } catch (err) {
      console.error(`Error ${actionText}ing users:`, err);
      setError(`Failed to ${actionText} users`);
    }
  };

  const exportData = async (type) => {
    try {
      const adminAPI = getAdminAPI();
      const response = await adminAPI.get(`/admin/export?type=${type}`);
      if (response.data.success) {
        const dataStr = JSON.stringify(response.data.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${type}_export_${
          new Date().toISOString().split("T")[0]
        }.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(`Error exporting ${type}:`, err);
      setError(`Failed to export ${type}`);
    }
  };

  const updateSystemConfig = async (configUpdates) => {
    try {
      const adminAPI = getAdminAPI();
      await adminAPI.patch("/admin/config", configUpdates);
      await fetchSystemConfig();
      setError("");
    } catch (err) {
      console.error("Error updating system config:", err);
      setError("Failed to update system configuration");
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === allUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(allUsers.map((user) => user._id));
    }
  };

  const modifyUser = (userId) => {
    const user = allUsers.find((u) => u._id === userId);
    if (user) {
      setShowModifyUser(user);
    }
  };

  const toggleBlockUser = async (userId, isCurrentlyBlocked) => {
    const action = isCurrentlyBlocked ? "unblock" : "block";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const adminAPI = getAdminAPI();
      const blockReason = isCurrentlyBlocked ? null : prompt("Enter reason for blocking (optional):");
      
      await adminAPI.patch(`/admin/users/${userId}/block`, {
        isBlocked: !isCurrentlyBlocked,
        blockReason,
      });
      
      await Promise.all([fetchUsers(), fetchStats()]);
      setError("");
    } catch (err) {
      console.error(`Error ${action}ing user:`, err);
      setError(`Failed to ${action} user`);
    }
  };

  const saveModifiedUser = async (userId, updatedData) => {
    try {
      const adminAPI = getAdminAPI();
      await adminAPI.put(`/admin/users/${userId}`, updatedData);
      
      await Promise.all([fetchUsers(), fetchStats()]);
      setShowModifyUser(null);
      setError("");
    } catch (err) {
      console.error("Error modifying user:", err);
      setError("Failed to modify user");
    }
  };

  if (!adminUser || adminUser.role !== "admin") {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | BorrowMyCar</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
          <div className="px-6 py-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900">
                {activeTab === "dashboard" && "Dashboard Overview"}
                {activeTab === "users" && "User Management"}
                {activeTab === "cars" && "Car Management"}
                {activeTab === "bookings" && "Booking Management"}
                {activeTab === "reports" && "Reports & Analytics"}
                {activeTab === "settings" && "System Settings"}
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                {activeTab === "dashboard" &&
                  "Monitor platform statistics and recent activity"}
                {activeTab === "users" && "Manage user accounts and approvals"}
                {activeTab === "cars" && "Oversee car listings and approvals"}
                {activeTab === "bookings" && "Track all booking transactions"}
                {activeTab === "reports" && "Generate reports and export data"}
                {activeTab === "settings" &&
                  "Configure system settings and preferences"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          <div className="space-y-8">
            {activeTab === "dashboard" && (
              <>
                <DashboardStats stats={stats} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-sm font-medium">
                              {stats?.users.pending || 0}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Users pending approval
                          </span>
                        </div>
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-sm font-medium">
                              {stats?.cars.pending || 0}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Cars pending approval
                          </span>
                        </div>
                        <svg
                          className="w-5 h-5 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-sm font-medium">
                              {stats?.bookings.active || 0}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Active bookings
                          </span>
                        </div>
                        <svg
                          className="w-5 h-5 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => handleTabChange("users")}
                        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                      >
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 mr-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Review Pending Users
                        </div>
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleTabChange("cars")}
                        className="w-full flex items-center justify-between px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                      >
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 mr-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Manage Cars
                        </div>
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleTabChange("bookings")}
                        className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
                      >
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 mr-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          View Bookings
                        </div>
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "users" && (
              <>
                {/* Quick stats for users */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <span className="text-2xl">⏳</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Pending Approval
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {pendingUsers.length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <span className="text-2xl">✅</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Approved Users
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {allUsers.filter((u) => u.isApproved).length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <span className="text-2xl">👥</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Total Users
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {allUsers.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <SearchAndFilter
                  type="users"
                  searchTerm={searchTerm}
                  handleSearch={handleSearch}
                  filterRole={filterRole}
                  filterStatus={filterStatus}
                  handleFilter={handleFilter}
                />

                {pendingUsers.length > 0 && filterStatus !== "true" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-2">⚠️</span>
                      <h3 className="text-lg font-medium text-yellow-800">
                        Pending Approvals
                      </h3>
                    </div>
                    <p className="text-yellow-700 mt-1">
                      {pendingUsers.length} users are waiting for approval.
                      Review and approve them to give access.
                    </p>
                  </div>
                )}

                {allUsers.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedUsers.length === allUsers.length &&
                            allUsers.length > 0
                          }
                          onChange={selectAllUsers}
                          className="mr-2"
                        />
                        Select All ({allUsers.length} users)
                      </label>
                      {selectedUsers.length > 0 && (
                        <span className="text-sm text-blue-600 font-medium">
                          {selectedUsers.length} selected
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <BulkActionsBar
                  selectedUsers={selectedUsers}
                  bulkUserAction={bulkUserAction}
                  setSelectedUsers={setSelectedUsers}
                />
                {allUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">👥</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No users found
                    </h3>
                    <p className="text-gray-600">No registered users yet</p>
                  </div>
                ) : (
                  <>
                    {allUsers.map((user) => (
                      <UserCard
                        key={user._id}
                        user={user}
                        showActions={!user.isApproved}
                        activeTab={activeTab}
                        selectedUsers={selectedUsers}
                        toggleUserSelection={toggleUserSelection}
                        fetchUserDetails={fetchUserDetails}
                        approveUser={approveUser}
                        rejectUser={rejectUser}
                        deleteUser={deleteUser}
                        modifyUser={modifyUser}
                        toggleBlockUser={toggleBlockUser}
                      />
                    ))}
                    <Pagination
                      currentPagination={pagination.users}
                      onPageChange={(page) =>
                        fetchUsers(page, {
                          search: searchTerm,
                          role: filterRole,
                          isApproved: filterStatus,
                        })
                      }
                    />
                  </>
                )}
              </>
            )}

            {activeTab === "cars" && (
              <>
                <SearchAndFilter
                  type="cars"
                  searchTerm={searchTerm}
                  handleSearch={handleSearch}
                  filterRole={filterRole}
                  filterStatus={filterStatus}
                  handleFilter={handleFilter}
                />
                {allCars.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🚗</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No cars found
                    </h3>
                    <p className="text-gray-600">No cars listed yet</p>
                  </div>
                ) : (
                  <>
                    {allCars.map((car) => (
                      <CarCard
                        key={car._id}
                        car={car}
                        updateCarStatus={updateCarStatus}
                        deleteCar={deleteCar}
                      />
                    ))}
                    <Pagination
                      currentPagination={pagination.cars}
                      onPageChange={(page) =>
                        fetchCars(page, {
                          search: searchTerm,
                          status: filterStatus,
                        })
                      }
                    />
                  </>
                )}
              </>
            )}

            {activeTab === "bookings" && (
              <>
                {allBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📅</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No bookings found
                    </h3>
                    <p className="text-gray-600">No bookings made yet</p>
                  </div>
                ) : (
                  <>
                    {allBookings.map((booking) => (
                      <BookingCard key={booking._id} booking={booking} />
                    ))}
                    <Pagination
                      currentPagination={pagination.bookings}
                      onPageChange={(page) => fetchBookings(page)}
                    />
                  </>
                )}
              </>
            )}

            {activeTab === "reports" && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Export Data
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Users Data</h4>
                          <p className="text-sm text-gray-600">
                            Export all user information
                          </p>
                        </div>
                        <button
                          onClick={() => exportData("users")}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Export Users
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Cars Data</h4>
                          <p className="text-sm text-gray-600">
                            Export all car listings
                          </p>
                        </div>
                        <button
                          onClick={() => exportData("cars")}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          Export Cars
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Bookings Data</h4>
                          <p className="text-sm text-gray-600">
                            Export all booking records
                          </p>
                        </div>
                        <button
                          onClick={() => exportData("bookings")}
                          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                        >
                          Export Bookings
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Activity
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {activityLog.recentUsers?.map((user, index) => (
                        <div
                          key={`user-${index}`}
                          className="flex items-center justify-between py-2 border-b border-gray-100"
                        >
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">
                              {user.isApproved ? "Approved" : "Pending"} •{" "}
                              {new Date(user.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              user.isApproved
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                      ))}

                      {activityLog.recentCars?.map((car, index) => (
                        <div
                          key={`car-${index}`}
                          className="flex items-center justify-between py-2 border-b border-gray-100"
                        >
                          <div>
                            <p className="text-sm font-medium">{car.title}</p>
                            <p className="text-xs text-gray-500">
                              by {car.owner?.name} •{" "}
                              {new Date(car.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              car.status === "active"
                                ? "bg-green-100 text-green-800"
                                : car.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {car.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "settings" && (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      System Settings
                    </h3>
                    <button
                      onClick={() => setShowSystemConfig(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Configure System
                    </button>
                  </div>

                  {systemConfig && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Platform Status
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Environment:
                            </span>
                            <span className="text-sm font-medium">
                              {systemConfig.platform.environment}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Version:
                            </span>
                            <span className="text-sm font-medium">
                              {systemConfig.platform.version}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Maintenance Mode:
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                systemConfig.features.maintenanceMode
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {systemConfig.features.maintenanceMode
                                ? "ON"
                                : "OFF"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Registration Settings
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Registration Open:
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                systemConfig.features.registrationOpen
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {systemConfig.features.registrationOpen
                                ? "YES"
                                : "NO"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Auto Approval:
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                systemConfig.features.autoApproval
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {systemConfig.features.autoApproval
                                ? "ENABLED"
                                : "MANUAL"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          System Limits
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Max Cars/Owner:
                            </span>
                            <span className="text-sm font-medium">
                              {systemConfig.limits.maxCarsPerOwner}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Max Bookings/User:
                            </span>
                            <span className="text-sm font-medium">
                              {systemConfig.limits.maxBookingsPerUser}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Max Image Size:
                            </span>
                            <span className="text-sm font-medium">
                              {systemConfig.limits.maxImageSize}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <UserDetailsModal
        showUserDetails={showUserDetails}
        setShowUserDetails={setShowUserDetails}
      />
      <SystemConfigModal
        showSystemConfig={showSystemConfig}
        setShowSystemConfig={setShowSystemConfig}
        systemConfig={systemConfig}
        updateSystemConfig={updateSystemConfig}
      />
      <ModifyUserModal
        user={showModifyUser}
        setShowModifyUser={setShowModifyUser}
        saveModifiedUser={saveModifiedUser}
      />
    </>
  );
};
export default AdminDashboard;
