// src/pages/Checkout.jsx - Fixed to work with your backend
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  Calendar,
  Car,
  MapPin,
  Clock,
  Shield,
  AlertCircle,
} from "lucide-react";
import PaymentForm from "../components/PaymentForm";
import API from "../api";

const Checkout = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [car, setCar] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        // Get booking data from location state or localStorage
        const bookingData =
          location.state?.bookingData ||
          JSON.parse(localStorage.getItem(`booking_${carId}`) || "{}");

        if (!bookingData.startDate || !bookingData.endDate) {
          navigate(`/cars/${carId}`, {
            state: {
              error: "Please select dates before proceeding to checkout.",
            },
          });
          return;
        }

        // Fetch car details
        const carResponse = await API.get(`/cars/${carId}`);
        setCar(carResponse.data.data.car);

        // Validate booking dates
        const startDate = new Date(bookingData.startDate);
        const endDate = new Date(bookingData.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate < today) {
          setError("Start date cannot be in the past");
          return;
        }

        if (startDate >= endDate) {
          setError("End date must be after start date");
          return;
        }

        // Normalize payment method
        let paymentMethod = bookingData.paymentMethod || "Cash";
        if (paymentMethod === "cash_on_pickup") paymentMethod = "Cash";
        if (paymentMethod === "stripe") paymentMethod = "Card";

        // Create booking on backend
        const bookingResponse = await API.post("/bookings", {
          carId: carId,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          paymentMethod: paymentMethod,
          pickupLocation: bookingData.pickupLocation || "To be determined",
          returnLocation: bookingData.returnLocation || "To be determined",
          deliveryRequested: bookingData.deliveryRequested || false,
          deliveryAddress: bookingData.deliveryAddress || "",
          renterNotes: bookingData.renterNotes || "",
        });

        setBooking(bookingResponse.data.data.booking);
      } catch (err) {
        console.error("Checkout initialization error:", err);
        setError(
          err.response?.data?.message || "Failed to initialize checkout"
        );
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [carId, location.state, navigate]);

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // Clear saved booking data
      localStorage.removeItem(`booking_${carId}`);

      // Navigate to success page
      navigate("/booking-success", {
        state: {
          paymentIntent: paymentResult.paymentIntent,
          booking: paymentResult.booking,
          car,
        },
        replace: true,
      });
    } catch (err) {
      console.error("Post-payment error:", err);
      setPaymentError(
        "Payment successful but navigation failed. Please check your bookings."
      );
    }
  };

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
    setPaymentError(error);
  };

  const handleBackToCarDetails = () => {
    const bookingData = location.state?.bookingData;
    navigate(`/cars/${carId}`, {
      state: { bookingData },
    });
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Checkout - BorrowMyCar</title>
        </Helmet>
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-60 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !car || !booking) {
    return (
      <>
        <Helmet>
          <title>Checkout Error - BorrowMyCar</title>
        </Helmet>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <div className="text-red-600 text-lg font-medium mb-4">
              {error || "Booking information not found"}
            </div>
            <div className="space-x-4">
              <button
                onClick={() => navigate("/browse")}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Browse Cars
              </button>
              <button
                onClick={handleBackToCarDetails}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Back to Car
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout - {car.title} | BorrowMyCar</title>
      </Helmet>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToCarDetails}
            className="flex items-center text-green-600 hover:text-green-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Car Details
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Booking
          </h1>
          <p className="text-gray-600 mt-2">
            Review your booking details and complete payment
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Car className="w-6 h-6 mr-2" />
                Your Vehicle
              </h2>

              <div className="flex space-x-4">
                <img
                  src={car.images?.[0] || "/placeholder-car.jpg"}
                  alt={car.title}
                  className="w-24 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{car.title}</h3>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{car.city}</span>
                  </div>
                  <div className="text-green-600 font-semibold mt-2">
                    AED {car.price}/day
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-6 h-6 mr-2" />
                Booking Details
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Date & Time
                  </label>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      {new Date(booking.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 mt-1">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>10:00 AM (Default pickup time)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Date & Time
                  </label>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      {new Date(booking.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 mt-1">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>10:00 AM (Default return time)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Duration</span>
                  <span className="font-semibold text-gray-900">
                    {booking.totalDays} day{booking.totalDays !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Error Display */}
            {paymentError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start">
                  <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-red-800 mb-2">
                      Payment Error
                    </h3>
                    <p className="text-red-700">{paymentError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Form */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Payment Information
              </h2>

              <PaymentForm
                booking={booking}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          </div>

          {/* Right Column - Price Breakdown */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Price Breakdown
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    AED {car.price} × {booking.totalDays} day
                    {booking.totalDays !== 1 ? "s" : ""}
                  </span>
                  <span className="text-gray-900">
                    AED {booking.totalAmount?.toFixed(2)}
                  </span>
                </div>

                {booking.serviceFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service fee</span>
                    <span className="text-gray-900">
                      AED {booking.serviceFee?.toFixed(2)}
                    </span>
                  </div>
                )}

                {booking.securityDeposit > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security deposit</span>
                    <span className="text-gray-900">
                      AED {booking.securityDeposit?.toFixed(2)}
                    </span>
                  </div>
                )}

                <hr className="border-gray-200" />

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    AED {booking.totalPayable?.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Security Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <Shield className="w-4 h-4 mr-2" />
                  <span>Secure payment powered by Stripe</span>
                </div>

                <div className="grid grid-cols-4 gap-2 opacity-60">
                  <div className="bg-gray-100 rounded p-2 text-xs text-center font-medium">
                    VISA
                  </div>
                  <div className="bg-gray-100 rounded p-2 text-xs text-center font-medium">
                    MC
                  </div>
                  <div className="bg-gray-100 rounded p-2 text-xs text-center font-medium">
                    AMEX
                  </div>
                  <div className="bg-gray-100 rounded p-2 text-xs text-center font-medium">
                    3DS
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">
                  Cancellation Policy
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Free cancellation up to 24 hours before pickup</p>
                  <p>• 50% refund within 24 hours of pickup</p>
                  <p>• No refund after pickup time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
