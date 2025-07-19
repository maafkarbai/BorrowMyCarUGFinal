import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import api from "./api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  DollarSign,
  Car,
  Calendar,
  TrendingUp,
  Users,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SellerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/cars/seller/dashboard?period=${period}`);
      setDashboardData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-600 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Error Loading Dashboard
            </h2>
            <p>{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    overview,
    earningsByPeriod,
    topPerformingCars,
    recentBookings,
    statusDistribution,
  } = dashboardData;

  // Prepare chart data
  const earningsChartData = {
    labels:
      earningsByPeriod?.map((item) => `${item._id.day}/${item._id.month}`) ||
      [],
    datasets: [
      {
        label: "Daily Earnings (AED)",
        data: earningsByPeriod?.map((item) => item.dailyEarnings) || [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const bookingsChartData = {
    labels:
      earningsByPeriod?.map((item) => `${item._id.day}/${item._id.month}`) ||
      [],
    datasets: [
      {
        label: "Daily Bookings",
        data: earningsByPeriod?.map((item) => item.dailyBookings) || [],
        backgroundColor: "rgba(34, 197, 94, 0.8)",
      },
    ],
  };

  const statusChartData = {
    labels: statusDistribution?.map((item) => item._id) || [],
    datasets: [
      {
        data: statusDistribution?.map((item) => item.count) || [],
        backgroundColor: [
          "#f59e0b", // pending - yellow
          "#10b981", // confirmed - green
          "#3b82f6", // approved - blue
          "#ef4444", // cancelled - red
          "#8b5cf6", // completed - purple
          "#6b7280", // others - gray
        ],
      },
    ],
  };

  const StatCard = ({ title, value, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div
          className={`p-3 rounded-full ${color
            .replace("text-", "bg-")
            .replace("-600", "-100")}`}
        >
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! Here's your car rental business
            overview.
          </p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Earnings"
            value={`AED ${overview.totalEarnings?.toLocaleString() || 0}`}
            icon={DollarSign}
            color="text-green-600"
            subtitle={`${overview.completedBookings || 0} completed bookings`}
          />
          <StatCard
            title="Total Cars"
            value={overview.totalCars || 0}
            icon={Car}
            color="text-blue-600"
            subtitle={`${overview.activeBookings || 0} currently booked`}
          />
          <StatCard
            title="Total Bookings"
            value={overview.totalBookings || 0}
            icon={Calendar}
            color="text-purple-600"
            subtitle={`${overview.completionRate || 0}% completion rate`}
          />
          <StatCard
            title="Avg Booking Value"
            value={`AED ${overview.avgBookingValue?.toFixed(0) || 0}`}
            icon={TrendingUp}
            color="text-orange-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Earnings Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Earnings Over Time</h3>
            {earningsByPeriod?.length > 0 ? (
              <Line
                data={earningsChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            ) : (
              <div className="text-center text-gray-500 py-8">
                No earnings data available for this period
              </div>
            )}
          </div>

          {/* Booking Status Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              Booking Status Distribution
            </h3>
            {statusDistribution?.length > 0 ? (
              <Doughnut
                data={statusChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            ) : (
              <div className="text-center text-gray-500 py-8">
                No booking data available
              </div>
            )}
          </div>
        </div>

        {/* Daily Bookings Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Daily Bookings</h3>
          {earningsByPeriod?.length > 0 ? (
            <Bar
              data={bookingsChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          ) : (
            <div className="text-center text-gray-500 py-8">
              No booking data available for this period
            </div>
          )}
        </div>

        {/* Top Performing Cars */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Top Performing Cars</h3>
          {topPerformingCars?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Car
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Insurance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topPerformingCars.map((car) => (
                    <tr key={car._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Car className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {car.carDetails.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {car.carDetails.make} {car.carDetails.model}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        AED {car.totalEarnings.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {car.totalBookings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {car.avgRating
                          ? `${car.avgRating.toFixed(1)} ⭐`
                          : "No reviews"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {car.carDetails.hasInsurance ? (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-800 font-medium">
                              {car.carDetails.insuranceType || "Insured"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <XCircle className="h-4 w-4 text-red-500 mr-1" />
                            <span className="text-sm text-red-800">Not Insured</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No performance data available
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
          {recentBookings?.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={booking.car.images?.[0] || "/placeholder-car.jpg"}
                      alt={booking.car.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {booking.car.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {booking.renter.name} •{" "}
                        {new Date(booking.startDate).toLocaleDateString()} -{" "}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      AED {booking.totalPayable}
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No recent bookings
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
