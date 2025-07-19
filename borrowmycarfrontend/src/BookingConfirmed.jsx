import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  CheckCircle,
  Calendar,
  Car,
  MapPin,
  Clock,
  Phone,
  Mail,
  ArrowRight,
  MessageCircle,
  Star,
  Shield,
  AlertCircle,
  Info,
  Download,
  Share2,
} from "lucide-react";

const BookingConfirmed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(8);

  const { booking, car } = location.state || {};

  // Auto-redirect after countdown
  useEffect(() => {
    if (!booking) {
      navigate("/browse", { replace: true });
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate("/my-bookings");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, booking]);

  if (!booking) {
    return (
      <>
        <Helmet>
          <title>Booking Not Found - BorrowMyCar</title>
        </Helmet>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Booking Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn't find your booking details. Please check your bookings or try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/browse"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Browse Cars
              </Link>
              <Link
                to="/my-bookings"
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                My Bookings
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
        <title>Booking Confirmed - BorrowMyCar</title>
        <meta
          name="description"
          content="Your car booking request has been confirmed!"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Confirmed! 🎉
            </h1>
            <p className="text-lg text-gray-600">
              Your car booking request has been successfully submitted
            </p>
          </div>

          {/* Booking Confirmation Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
            <div className="bg-green-50 px-6 py-4 border-b border-green-100">
              <h2 className="text-lg font-semibold text-green-900 flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Booking Confirmation
              </h2>
              <p className="text-sm text-green-700 mt-1">
                Reference: #{booking._id?.slice(-8).toUpperCase() || "PENDING"}
              </p>
            </div>

            <div className="p-6">
              {/* Car Details */}
              <div className="flex items-start space-x-4 mb-6">
                <img
                  src={car?.images?.[0] || "/placeholder-car.jpg"}
                  alt={car?.title}
                  className="w-24 h-18 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {car?.title || "Car Details"}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{car?.city || "UAE"}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Shield className="w-4 h-4 mr-1" />
                    <span>Fully insured</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    AED {car?.price || booking?.dailyRate || "0"}/day
                  </div>
                  <div className="text-sm text-gray-500">Daily rate</div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Booking Period</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">From:</span>
                      <span className="ml-2 font-medium">
                        {new Date(booking.startDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">To:</span>
                      <span className="ml-2 font-medium">
                        {new Date(booking.endDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2 font-medium">
                        {booking.totalDays || booking.numberOfDays || 1} day
                        {(booking.totalDays || booking.numberOfDays || 1) > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Booking Summary</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Daily Rate</span>
                      <span>AED {car?.price || booking?.dailyRate || "0"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Duration</span>
                      <span>
                        {booking.totalDays || booking.numberOfDays || 1} day
                        {(booking.totalDays || booking.numberOfDays || 1) > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-green-600">
                          AED {booking.totalCost || ((car?.price || 0) * (booking.totalDays || booking.numberOfDays || 1))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Booking Status: {booking.status === 'pending' ? 'Pending Owner Approval' : 'Confirmed'}
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  {booking.status === 'pending' ? (
                    <>
                      <p>• Your booking request has been sent to the car owner</p>
                      <p>• You'll receive a notification once the owner responds</p>
                      <p>• This typically takes 2-6 hours during business hours</p>
                    </>
                  ) : (
                    <>
                      <p>• Your booking has been confirmed by the car owner</p>
                      <p>• You'll receive pickup instructions within 24 hours</p>
                      <p>• Payment will be processed closer to pickup date</p>
                    </>
                  )}
                </div>
              </div>

              {/* Owner Contact (if available) */}
              {booking.owner && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Car Owner</h4>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{booking.owner.name}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        {booking.owner.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            <span>{booking.owner.phone}</span>
                          </div>
                        )}
                        {booking.owner.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            <span>{booking.owner.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 mr-1" />
                      <span className="text-sm text-gray-700">4.9 rating</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/my-bookings"
                  className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  View My Bookings
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>

                <Link
                  to={`/cars/${car?._id}`}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View Car Details
                </Link>

                <button
                  onClick={() => {
                    const shareText = `I just booked ${car?.title} on BorrowMyCar! 🚗`;
                    if (navigator.share) {
                      navigator.share({
                        title: "Car Booking Confirmed",
                        text: shareText,
                        url: window.location.origin,
                      });
                    } else {
                      navigator.clipboard.writeText(shareText);
                      alert("Booking details copied to clipboard!");
                    }
                  }}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-yellow-900 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Important Information
            </h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>• Keep your phone accessible for owner communication</p>
              <p>• Ensure your driving license and Emirates ID are valid</p>
              <p>• Check your email for confirmation details</p>
              <p>• Contact support if you don't hear back within 24 hours</p>
            </div>
          </div>

          {/* Support */}
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">Need help with your booking?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:+971800266669"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Support
              </a>
              <a
                href="mailto:support@borrowmycar.ae"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Support
              </a>
              <Link
                to="/help"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Help Center
              </Link>
            </div>
          </div>

          {/* Auto redirect notice */}
          <div className="text-center text-sm text-gray-500 bg-gray-100 p-4 rounded-lg">
            <p>
              🕒 Redirecting to your bookings in{" "}
              <span className="font-semibold text-green-600">
                {countdown}
              </span>{" "}
              seconds
            </p>
            <button
              onClick={() => navigate("/my-bookings")}
              className="text-green-600 hover:text-green-700 underline ml-2"
            >
              Go now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingConfirmed;