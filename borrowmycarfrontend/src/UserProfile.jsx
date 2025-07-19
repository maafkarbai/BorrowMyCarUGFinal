// src/UserProfile.jsx - Public User Profile Page
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Star, 
  Car as CarIcon, 
  Award,
  ArrowLeft,
  ExternalLink 
} from "lucide-react";
import API from "./api";
import CarCard from "./components/CarCard";

const UserProfile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [userCars, setUserCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await API.get(`/users/${userId}`);
      console.log("User profile response:", response.data);
      
      if (response.data.success) {
        setUserData(response.data.data.user);
        setUserCars(response.data.data.cars);
      } else {
        throw new Error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError(
        error.response?.data?.message || 
        "Failed to load user profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatJoinDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Car Listings</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              {/* Profile Picture and Name */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4">
                  {userData.profileImage ? (
                    <img
                      src={userData.profileImage}
                      alt={userData.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-green-100"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {userData.name}
                </h1>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{userData.preferredCity}</span>
                </div>
                
                {/* Rating */}
                {userData.averageRating > 0 && (
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold text-gray-900">
                      {userData.averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-600">rating</span>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-gray-900">Contact Information</h3>
                
                {/* Phone */}
                {userData.phone && (
                  <a
                    href={`tel:${userData.phone}`}
                    className="flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Call Now</p>
                      <p className="text-sm text-gray-600">{userData.phone}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-green-600 ml-auto" />
                  </a>
                )}

                {/* Email */}
                {userData.email && (
                  <a
                    href={`mailto:${userData.email}`}
                    className="flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Send Email</p>
                      <p className="text-sm text-gray-600">{userData.email}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-blue-600 ml-auto" />
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <CarIcon className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-gray-900">
                    {userData.totalListings}
                  </p>
                  <p className="text-xs text-gray-600">Car Listings</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Award className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-gray-900">
                    {userData.totalBookings}
                  </p>
                  <p className="text-xs text-gray-600">Total Bookings</p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Member since {formatJoinDate(userData.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Car Listings */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {userData.name}'s Car Listings
              </h2>
              <p className="text-gray-600">
                {userCars.length} active car{userCars.length !== 1 ? 's' : ''} available for rent
              </p>
            </div>

            {userCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userCars.map((car) => (
                  <CarCard 
                    key={car._id} 
                    car={{
                      ...car,
                      owner: userData // Attach the user data to each car
                    }} 
                    showDistance={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Cars Listed Yet
                </h3>
                <p className="text-gray-600">
                  {userData.name} hasn't listed any cars for rent at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;