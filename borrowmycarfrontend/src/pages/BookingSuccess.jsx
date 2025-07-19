// src/pages/BookingSuccess.jsx - Complete booking success page
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  CheckCircle,
  Calendar,
  Car,
  MapPin,
  Download,
  Mail,
  Phone,
  Clock,
  CreditCard,
  Star,
  Share2,
  MessageCircle,
  ArrowRight,
  Home,
  FileText,
  Shield,
  AlertCircle,
  Info,
} from "lucide-react";

const BookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(15);
  const [_showDetails, _setShowDetails] = useState(false);

  const { paymentIntent, booking, car } = location.state || {};

  // Auto-redirect after countdown
  useEffect(() => {
    if (!paymentIntent || !booking) {
      navigate("/my-bookings", { replace: true });
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
  }, [navigate, paymentIntent, booking]);

  const handleDownloadReceipt = () => {
    const receiptData = {
      bookingReference: booking?._id?.slice(-8).toUpperCase() || "UNKNOWN",
      paymentId: paymentIntent?.id?.slice(-8).toUpperCase(),
      carTitle: car?.title,
      carCity: car?.city,
      bookingDates: {
        start: booking?.startDate,
        end: booking?.endDate,
        duration: booking?.totalDays,
      },
      payment: {
        amount: paymentIntent?.amount
          ? (paymentIntent.amount / 100).toFixed(2)
          : "0.00",
        currency: paymentIntent?.currency?.toUpperCase() || "AED",
        method: "Credit Card",
        status: "Paid",
      },
      timestamp: new Date().toISOString(),
      customerInfo: {
        name: booking?.renter?.name || "Customer",
        email: booking?.renter?.email || "N/A",
      },
    };

    const dataStr = JSON.stringify(receiptData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `BorrowMyCar_Receipt_${receiptData.bookingReference}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const shareData = {
      title: "Car Booking Confirmed - BorrowMyCar",
      text: `I just booked ${car?.title} through BorrowMyCar! 🚗`,
      url: window.location.origin,
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      alert("Booking details copied to clipboard!");
    }
  };

  if (!paymentIntent || !booking) {
    return (
      <>
        <Helmet>
          <title>Booking Not Found - BorrowMyCar</title>
        </Helmet>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Booking Information Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn't find your booking details. Please check your email for
              confirmation or view your bookings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/my-bookings"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                View My Bookings
              </Link>
              <Link
                to="/browse"
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Browse Cars
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
          content="Your car booking has been successfully confirmed!"
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
              🎉 Booking Confirmed!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Great news! Your car rental has been successfully booked and
              payment confirmed. Get ready for an amazing driving experience!
            </p>
          </div>

          {/* Main Booking Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header with booking reference */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Booking Reference</h2>
                  <p className="text-green-100 font-mono text-lg">
                    #{booking._id?.slice(-8).toUpperCase() || "UNKNOWN"}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <p className="text-green-100 text-sm">Payment Confirmed</p>
                  <p className="text-white font-mono">
                    {paymentIntent.id?.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Car Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Car className="w-6 h-6 mr-3 text-green-600" />
                  Your Rental Vehicle
                </h3>

                <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6 bg-gray-50 p-6 rounded-xl">
                  <img
                    src={car?.images?.[0] || "/placeholder-car.jpg"}
                    alt={car?.title}
                    className="w-full md:w-32 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900">
                      {car?.title}
                    </h4>
                    <div className="flex items-center text-gray-600 mt-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{car?.city}, UAE</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 mr-1" />
                        <span className="text-sm text-gray-700">
                          4.9 rating
                        </span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <Shield className="w-4 h-4 mr-1" />
                        <span className="text-sm text-gray-700">
                          Fully insured
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      AED {car?.price}/day
                    </div>
                    <div className="text-sm text-gray-500">Per day rate</div>
                  </div>
                </div>
              </div>

              {/* Booking Timeline */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-green-600" />
                  Rental Timeline
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center text-blue-700 mb-3">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Pickup Details</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-1">
                      {new Date(booking.startDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>10:00 AM (Default time)</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-2">
                      📍 Pickup location will be confirmed by owner
                    </p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                    <div className="flex items-center text-orange-700 mb-3">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Return Details</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-1">
                      {new Date(booking.endDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>10:00 AM (Default time)</span>
                    </div>
                    <p className="text-sm text-orange-600 mt-2">
                      🔄 Return to same pickup location
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="font-medium">
                      Total Duration: {booking.totalDays} day
                      {booking.totalDays !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-6 h-6 mr-3 text-green-600" />
                  Payment Summary
                </h3>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Rental fee ({booking.totalDays} day
                        {booking.totalDays !== 1 ? "s" : ""})
                      </span>
                      <span className="text-gray-900">
                        AED {((paymentIntent.amount / 100) * 0.95).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service fee (5%)</span>
                      <span className="text-gray-900">
                        AED {((paymentIntent.amount / 100) * 0.05).toFixed(2)}
                      </span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        Total Paid
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        AED {(paymentIntent.amount / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Payment method: Credit Card ending in ****
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
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Email Confirmation
                    </h4>
                    <p className="text-sm text-blue-700">
                      Booking confirmation sent to your email with all details
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                        2
                      </div>
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-green-900 mb-2">
                      Owner Contact
                    </h4>
                    <p className="text-sm text-green-700">
                      Car owner will contact you 24-48 hours before pickup
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                        3
                      </div>
                      <Car className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-purple-900 mb-2">
                      Pickup Day
                    </h4>
                    <p className="text-sm text-purple-700">
                      Bring your driving license and Emirates ID for pickup
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleDownloadReceipt}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Receipt
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Booking
                </button>

                <Link
                  to="/my-bookings"
                  className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  View All Bookings
                </Link>

                <Link
                  to="/browse"
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Car className="w-5 h-5 mr-2" />
                  Browse More Cars
                </Link>
              </div>

              {/* Auto redirect notice */}
              <div className="mt-8 text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                <p>
                  🕒 You will be automatically redirected to your bookings in{" "}
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
                </button>{" "}
                or{" "}
                <Link
                  to="/"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  return home
                </Link>
              </div>
            </div>
          </div>

          {/* Important Reminders */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-semibold text-yellow-800 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Important Reminders
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-yellow-800">
              <div className="space-y-2">
                <p>• Arrive on time for pickup to avoid delays</p>
                <p>• Bring valid driving license and Emirates ID</p>
                <p>• Inspect the car thoroughly before driving</p>
              </div>
              <div className="space-y-2">
                <p>• Return with sufficient fuel as received</p>
                <p>• Report any issues immediately to owner</p>
                <p>• Follow UAE traffic rules and regulations</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-yellow-200">
              <p className="text-sm text-yellow-700">
                <strong>Need help?</strong> Contact our 24/7 support team at{" "}
                <a href="tel:+971800266669" className="font-semibold underline">
                  +971 800 BORROW
                </a>{" "}
                or{" "}
                <a
                  href="mailto:support@borrowmycar.ae"
                  className="font-semibold underline"
                >
                  support@borrowmycar.ae
                </a>
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Join thousands of satisfied customers who trust BorrowMyCar
            </p>
            <div className="flex items-center justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-yellow-400 fill-current"
                />
              ))}
              <span className="ml-2 text-gray-700 font-medium">
                4.9/5 from 12,000+ reviews
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingSuccess;
