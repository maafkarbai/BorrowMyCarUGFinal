import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  CheckCircle,
  Car,
  MapPin,
  Calendar,
  DollarSign,
  Eye,
  Settings,
  Share2,
  Star,
  Clock,
  AlertCircle,
  Info,
  Phone,
  Mail,
  ArrowRight,
  Edit,
  Camera,
  Shield,
  Zap,
  TrendingUp,
} from "lucide-react";

const CarListingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(12);

  const { car, isFirstListing } = location.state || {};

  // Auto-redirect after countdown
  useEffect(() => {
    if (!car) {
      navigate("/list-car", { replace: true });
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate("/seller/listings");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, car]);

  const handleShare = () => {
    const shareData = {
      title: `Check out my ${car?.title} on BorrowMyCar!`,
      text: `I just listed my ${car?.title} for rent on BorrowMyCar. Starting at AED ${car?.price}/day! 🚗`,
      url: `${window.location.origin}/cars/${car?._id}`,
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      alert("Car listing details copied to clipboard!");
    }
  };

  if (!car) {
    return (
      <>
        <Helmet>
          <title>Car Listing Not Found - BorrowMyCar</title>
        </Helmet>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Car Listing Information Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn't find your car listing details. Please try listing your car again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/list-car"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                List Your Car
              </Link>
              <Link
                to="/seller/listings"
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                View My Listings
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
        <title>Car Listed Successfully - BorrowMyCar</title>
        <meta
          name="description"
          content="Your car has been successfully listed on BorrowMyCar!"
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
              🎉 Car Listed Successfully!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Congratulations! Your {car.title} is now live on BorrowMyCar and ready to start earning you money.
            </p>
          </div>

          {/* Main Car Listing Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header with car info */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Car is Live!</h2>
                  <p className="text-green-100 text-lg">
                    {car.title}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <p className="text-green-100 text-sm">Listing ID</p>
                  <p className="text-white font-mono">
                    #{car._id?.slice(-8).toUpperCase() || "NEW"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Car Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Car className="w-6 h-6 mr-3 text-green-600" />
                  Your Listed Vehicle
                </h3>

                <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6 bg-gray-50 p-6 rounded-xl">
                  <img
                    src={car.images?.[0] || "/placeholder-car.jpg"}
                    alt={car.title}
                    className="w-full md:w-40 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {car.title}
                    </h4>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{car.city}, UAE</span>
                    </div>
                    <div className="flex items-center space-x-4 mb-3">
                      <span className="text-sm text-gray-600">
                        {car.transmission || "Automatic"}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-600">
                        {car.fuelType || "Petrol"}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-600">
                        {car.year || "2020"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-green-600">
                        <Shield className="w-4 h-4 mr-1" />
                        <span className="text-sm text-gray-700">
                          Fully insured
                        </span>
                      </div>
                      <div className="flex items-center text-blue-600">
                        <Zap className="w-4 h-4 mr-1" />
                        <span className="text-sm text-gray-700">
                          Instant booking
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      AED {car.price}/day
                    </div>
                    <div className="text-sm text-gray-500">Starting price</div>
                  </div>
                </div>
              </div>

              {/* Listing Details */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-green-600" />
                  Listing Details
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center text-blue-700 mb-3">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Availability</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-1">
                      {car.availabilityFrom ? 
                        new Date(car.availabilityFrom).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }) : 
                        "Available immediately"
                      }
                    </p>
                    <p className="text-sm text-blue-600">
                      {car.availabilityTo ? 
                        `Until ${new Date(car.availabilityTo).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}` : 
                        "No end date specified"
                      }
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center text-green-700 mb-3">
                      <DollarSign className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Earning Potential</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-1">
                      AED {(car.price * 7).toFixed(0)}/week
                    </p>
                    <p className="text-sm text-green-600">
                      Based on your daily rate of AED {car.price}
                    </p>
                  </div>
                </div>
              </div>

              {/* Approval Status */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-3 text-orange-600" />
                  Listing Review Status
                </h3>

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-orange-900 mb-2">
                        Under Review - Approval within 24 hours
                      </h4>
                      <p className="text-orange-800 mb-3">
                        Your car listing has been submitted and is currently under review by our team. 
                        We'll approve your listing within 24 hours and notify you immediately once it's live.
                      </p>
                      <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
                        <p className="text-sm text-orange-700 font-medium">
                          📱 You'll receive a notification with the following details:
                        </p>
                        <ul className="text-sm text-orange-700 mt-2 space-y-1">
                          <li>• Car: {car.title}</li>
                          <li>• Location: {car.city}, UAE</li>
                          <li>• Price: AED {car.price}/day</li>
                          <li>• Expected approval: Within 24 hours</li>
                        </ul>
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
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Review & Approval
                    </h4>
                    <p className="text-sm text-blue-700">
                      Our team will review your listing and approve it within 24 hours
                    </p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                        2
                      </div>
                      <Phone className="w-5 h-5 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-orange-900 mb-2">
                      Go Live & Get Bookings
                    </h4>
                    <p className="text-sm text-orange-700">
                      Once approved, your car becomes visible to thousands of potential renters
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                        3
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-green-900 mb-2">
                      Start Earning
                    </h4>
                    <p className="text-sm text-green-700">
                      Receive booking requests and start earning money from your car
                    </p>
                  </div>
                </div>
              </div>

              {/* First Listing Tips */}
              {isFirstListing && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="w-6 h-6 mr-3 text-green-600" />
                    First Listing Tips
                  </h3>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-800">
                      <div className="space-y-2">
                        <p>• Upload high-quality photos to attract more renters</p>
                        <p>• Write a detailed description highlighting unique features</p>
                        <p>• Set competitive pricing for your location</p>
                        <p>• Respond quickly to booking requests</p>
                      </div>
                      <div className="space-y-2">
                        <p>• Keep your calendar updated with availability</p>
                        <p>• Maintain a clean and well-maintained vehicle</p>
                        <p>• Be flexible with pickup/drop-off locations</p>
                        <p>• Provide excellent customer service</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={`/cars/${car._id}`}
                  className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  View Live Listing
                </Link>

                <Link
                  to="/seller/listings"
                  className="flex items-center justify-center px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Manage Listings
                </Link>

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Listing
                </button>

                <Link
                  to="/list-car"
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Car className="w-5 h-5 mr-2" />
                  List Another Car
                </Link>
              </div>

              {/* Auto redirect notice */}
              <div className="mt-8 text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                <p>
                  🕒 You will be automatically redirected to your listings in{" "}
                  <span className="font-semibold text-green-600">
                    {countdown}
                  </span>{" "}
                  seconds
                </p>
                <button
                  onClick={() => navigate("/seller/listings")}
                  className="text-green-600 hover:text-green-700 underline ml-2"
                >
                  Go now
                </button>{" "}
                or{" "}
                <Link
                  to="/seller/dashboard"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  view dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Optimization Tips */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Maximize Your Earnings
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div className="space-y-2">
                <p>• Add more photos to increase booking rates by 40%</p>
                <p>• Update your availability regularly to stay visible</p>
                <p>• Consider offering delivery for extra income</p>
              </div>
              <div className="space-y-2">
                <p>• Respond to messages within 1 hour for better ratings</p>
                <p>• Offer competitive pricing during peak seasons</p>
                <p>• Build your reputation with excellent service</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/cars/${car._id}/edit`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Listing
                </Link>
                <Link
                  to={`/cars/${car._id}/photos`}
                  className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm transition-colors"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Add More Photos
                </Link>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-semibold text-yellow-800 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Need Help Getting Started?
            </h3>
            <p className="text-sm text-yellow-700 mb-4">
              Our team is here to help you succeed. Get tips on pricing, photos, and growing your car sharing business.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="tel:+971800266669"
                className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Support
              </a>
              <a
                href="mailto:owners@borrowmycar.ae"
                className="inline-flex items-center px-4 py-2 border border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-50 text-sm transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Owner Support
              </a>
              <Link
                to="/help"
                className="inline-flex items-center px-4 py-2 border border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-50 text-sm transition-colors"
              >
                <Info className="w-4 h-4 mr-2" />
                Help Center
              </Link>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Join thousands of successful car owners earning on BorrowMyCar
            </p>
            <div className="flex items-center justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-yellow-400 fill-current"
                />
              ))}
              <span className="ml-2 text-gray-700 font-medium">
                4.9/5 average owner rating
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CarListingSuccess;