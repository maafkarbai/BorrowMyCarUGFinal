// src/UserProfile.jsx - Public User Profile Page
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
      
      const response = await API.get(`/auth/users/${userId}`);
      console.log("User profile response:", response.data);
      
      if (response.data.success) {
        setUserData(response.data.data.user);
        setUserCars(response.data.data.cars || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      
      // More specific error handling
      if (error.response?.status === 404) {
        setError("User not found. This user may have been removed or does not exist.");
      } else if (error.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          error.response?.data?.message || 
          "Failed to load user profile. Please try again."
        );
      }
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
    <>
      <Helmet>
        <title>{userData?.name} - Car Rentals | BorrowMyCar</title>
        <meta 
          name="description" 
          content={`View ${userData?.name}'s car listings and profile on BorrowMyCar. ${userCars?.length || 0} cars available for rent in ${userData?.preferredCity || 'UAE'}.`} 
        />
        <meta property="og:title" content={`${userData?.name} - Car Rentals | BorrowMyCar`} />
        <meta 
          property="og:description" 
          content={`Browse ${userData?.name}'s ${userCars?.length || 0} car listings on BorrowMyCar. Verified host with quality vehicles for rent.`} 
        />
        <meta property="og:type" content="profile" />
        {userData?.profileImage && (
          <meta property="og:image" content={userData.profileImage} />
        )}
      </Helmet>
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
                {userData.preferredCity && (
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{userData.preferredCity}</span>
                  </div>
                )}
                
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
              {(userData.phone || userData.email) && (
                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold text-gray-900">Contact Information</h3>
                  
                  {/* Phone */}
                  {userData.phone && (
                    <div className="space-y-2">
                      <a
                        href={`tel:${userData.phone}`}
                        className="flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <Phone className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Call Now</p>
                          <p className="text-sm text-gray-600">{userData.phone}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-green-600" />
                      </a>
                      
                      {/* WhatsApp Button */}
                      <a
                        href={`https://wa.me/${userData.phone.replace(/\s+/g, '').replace(/\+/g, '')}?text=Hi ${userData.name}, I'm interested in your car listings on BorrowMyCar.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.188z"/>
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                          <p className="text-sm text-gray-600">Send a message</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-emerald-600" />
                      </a>
                    </div>
                  )}

                  {/* Email */}
                  {userData.email && (
                    <a
                      href={`mailto:${userData.email}?subject=Inquiry about your car listing&body=Hi ${userData.name}, I'm interested in your car listings on BorrowMyCar.`}
                      className="flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Send Email</p>
                        <p className="text-sm text-gray-600">{userData.email}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                    </a>
                  )}
                </div>
              )}

              {/* Trust & Verification */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Trust & Safety</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Verified Account</span>
                  </div>
                  {userData.averageRating > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        {userData.averageRating >= 4.5 ? 'Highly Rated Host' : 
                         userData.averageRating >= 4.0 ? 'Rated Host' : 'Host'}
                      </span>
                    </div>
                  )}
                  {userData.totalBookings > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        {userData.totalBookings >= 10 ? 'Experienced Host' : 'Active Host'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <CarIcon className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-gray-900">
                    {userData.totalListings || userCars.length || 0}
                  </p>
                  <p className="text-xs text-gray-600">Car Listings</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Award className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-gray-900">
                    {userData.totalBookings || 0}
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
              <div className="space-y-6">
                {userCars.map((car) => (
                  <div key={car._id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                    <div className="md:flex">
                      {/* Car Image */}
                      <div className="md:w-1/3">
                        <img
                          src={car.images?.[0] || "/default-car.jpg"}
                          alt={car.title}
                          className="w-full h-48 md:h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/default-car.jpg";
                          }}
                        />
                      </div>
                      
                      {/* Car Details */}
                      <div className="md:w-2/3 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {car.title}
                            </h3>
                            <p className="text-gray-600 mb-2">
                              {car.make} {car.model} • {car.year} • {car.city}
                            </p>
                            <p className="text-gray-700 text-sm line-clamp-2">
                              {car.description}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-2xl font-bold text-green-600">
                              AED {car.price || car.pricePerDay}
                            </p>
                            <p className="text-sm text-gray-500">per day</p>
                          </div>
                        </div>
                        
                        {/* Car Features */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            {car.transmission}
                          </span>
                          <span className="flex items-center">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            {car.fuelType}
                          </span>
                          <span className="flex items-center">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            {car.seatingCapacity} seats
                          </span>
                          {car.hasInsurance && (
                            <span className="flex items-center text-green-600">
                              <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                              Insured
                            </span>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                          <Link
                            to={`/cars/${car._id}`}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center transition-colors"
                          >
                            View Details
                          </Link>
                          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <CarIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  No Cars Listed Yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {userData.name} hasn't listed any cars for rent at the moment. Check back later for new listings!
                </p>
                <Link
                  to="/browse"
                  className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <span>Browse Other Cars</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default UserProfile;