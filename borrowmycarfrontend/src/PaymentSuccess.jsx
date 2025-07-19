// src/PaymentSuccess.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle,
  Car,
  Calendar,
  Download,
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import API from "./api";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const _navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const paymentIntentId = searchParams.get("payment_intent");
        const paymentIntentClientSecret = searchParams.get(
          "payment_intent_client_secret"
        );

        if (!paymentIntentId) {
          setError("Payment verification failed - missing payment intent");
          return;
        }

        // Verify payment with backend
        const response = await API.post("/payments/verify", {
          paymentIntentId,
          paymentIntentClientSecret,
        });

        if (response.data.success) {
          setBooking(response.data.booking);
        } else {
          setError("Payment verification failed");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setError("Failed to verify payment");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const downloadReceipt = async () => {
    try {
      const response = await API.get(`/bookings/${booking._id}/receipt`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt-${booking._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download receipt:", err);
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Verifying Payment - BorrowMyCar</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your payment...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Payment Error - BorrowMyCar</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">❌</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Link
                to="/my-bookings"
                className="block w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Check My Bookings
              </Link>
              <Link
                to="/browse"
                className="block w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue Browsing
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
        <title>Payment Successful - BorrowMyCar</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600">
              Your car booking has been confirmed
            </p>
          </div>

          {booking && (
            <>
              {/* Booking Details Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                  <h2 className="text-lg font-semibold text-green-900">
                    Booking Confirmation
                  </h2>
                  <p className="text-sm text-green-700">
                    Booking ID: #{booking._id}
                  </p>
                </div>

                <div className="p-6">
                  {/* Car Information */}
                  <div className="flex items-start space-x-4 mb-6">
                    <img
                      src={booking.car?.images?.[0] || "/placeholder-car.jpg"}
                      alt={booking.car?.title}
                      className="w-24 h-18 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {booking.car?.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{booking.car?.city}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Car className="w-4 h-4 mr-1" />
                        <span>{booking.car?.transmission || "Automatic"}</span>
                        <span className="mx-2">•</span>
                        <span>{booking.car?.fuelType || "Petrol"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Rental Period
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-gray-600">Start:</span>
                            <span className="ml-2 font-medium">
                              {new Date(booking.startDate).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-gray-600">End:</span>
                            <span className="ml-2 font-medium">
                              {new Date(booking.endDate).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600">Duration:</span>
                            <span className="ml-2 font-medium">
                              {booking.numberOfDays} day
                              {booking.numberOfDays > 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Payment Summary
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Daily Rate</span>
                            <span>
                              AED{" "}
                              {booking.car?.pricePerDay || booking.car?.price}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Duration</span>
                            <span>
                              {booking.numberOfDays} day
                              {booking.numberOfDays > 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="border-t border-gray-200 pt-2">
                            <div className="flex justify-between font-semibold">
                              <span>Total Paid</span>
                              <span className="text-green-600">
                                AED {booking.totalCost}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Next Steps
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>
                        • You'll receive a confirmation email with pickup
                        instructions
                      </li>
                      <li>• The car owner will contact you within 24 hours</li>
                      <li>• Bring your driving license and ID for pickup</li>
                      <li>• Contact support if you have any questions</li>
                    </ul>
                  </div>

                  {/* Owner Contact Info (if available) */}
                  {booking.owner && (
                    <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 mb-2">
                        Car Owner Contact
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-yellow-800">
                          <span className="font-medium">Name:</span>
                          <span className="ml-2">{booking.owner.name}</span>
                        </div>
                        {booking.owner.phone && (
                          <div className="flex items-center text-yellow-800">
                            <Phone className="w-4 h-4 mr-1" />
                            <span>{booking.owner.phone}</span>
                          </div>
                        )}
                        {booking.owner.email && (
                          <div className="flex items-center text-yellow-800">
                            <Mail className="w-4 h-4 mr-1" />
                            <span>{booking.owner.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={downloadReceipt}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </button>

                  <Link
                    to="/my-bookings"
                    className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    View My Bookings
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>

                  <Link
                    to="/browse"
                    className="flex items-center justify-center px-4 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Book Another Car
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* Support Section */}
          <div className="mt-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Need Help?
            </h3>
            <p className="text-gray-600 mb-4">
              Our support team is available 24/7 to assist you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

          {/* Important Notes */}
          <div className="mt-8 bg-gray-100 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-3">
              Important Reminders
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <h5 className="font-medium mb-2">For Pickup:</h5>
                <ul className="space-y-1">
                  <li>• Valid UAE driving license</li>
                  <li>• Emirates ID or passport</li>
                  <li>• Copy of this booking confirmation</li>
                  <li>• Arrive on time for pickup</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">During Rental:</h5>
                <ul className="space-y-1">
                  <li>• Follow traffic rules and regulations</li>
                  <li>• Keep fuel level as agreed</li>
                  <li>• Report any issues immediately</li>
                  <li>• Return on time to avoid penalties</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Rating Prompt */}
          <div className="mt-8 bg-green-50 rounded-lg p-6 text-center">
            <h4 className="font-medium text-green-900 mb-2">
              🌟 Help Others Choose the Right Car
            </h4>
            <p className="text-green-800 text-sm mb-4">
              After your rental, please take a moment to rate your experience
              and help other renters make informed decisions.
            </p>
            <Link
              to="/rate-experience"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Rate Experience Later
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
