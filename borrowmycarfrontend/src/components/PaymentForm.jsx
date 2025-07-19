// src/components/PaymentForm.jsx - Fixed to work with your backend
import { useState, useEffect } from "react";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { usePayment } from "../context/PaymentContext";
import { useNavigate as _useNavigate } from "react-router-dom";
import {
  CreditCard,
  Lock,
  AlertCircle,
  CheckCircle,
  Shield,
} from "lucide-react";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
      iconColor: "#9e2146",
    },
  },
  hidePostalCode: true,
};

const CheckoutForm = ({ booking, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const {
    createPaymentIntent,
    confirmPayment,
    paymentLoading,
    paymentError,
    clearError,
  } = usePayment();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [_paymentIntentId, _setPaymentIntentId] = useState("");
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState("");

  useEffect(() => {
    // Create payment intent when component mounts
    const initPayment = async () => {
      try {
        clearError();
        // Use booking ID or fallback amount for payment intent
        const result = await createPaymentIntent(
          booking._id, 
          booking.totalPayable || 100
        );
        setClientSecret(result.data.clientSecret);
        _setPaymentIntentId(result.data.paymentIntentId);
      } catch (error) {
        console.error("Payment initialization error:", error);
        onError(error.message || "Failed to initialize payment");
      }
    };

    if (booking && (booking._id || booking.totalPayable)) {
      initPayment();
    }
  }, [booking._id, booking.totalPayable]);

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      onError("Payment system not ready. Please try again.");
      return;
    }

    if (!cardComplete) {
      setCardError("Please complete your card details");
      return;
    }

    setProcessing(true);
    clearError();

    const card = elements.getElement(CardElement);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: card,
            billing_details: {
              name: booking.renter?.name || booking.renterName || "Customer",
              email: booking.renter?.email || booking.renterEmail,
            },
          },
        }
      );

      if (error) {
        console.error("Payment failed:", error);
        onError(error.message);
      } else if (paymentIntent.status === "succeeded") {
        console.log("Payment succeeded:", paymentIntent);

        // Confirm payment on backend
        try {
          await confirmPayment(paymentIntent.id, booking._id);
          onSuccess({
            paymentIntent,
            booking: booking,
          });
        } catch (confirmError) {
          console.error("Backend confirmation failed:", confirmError);
          onError(
            "Payment successful but booking confirmation failed. Please contact support."
          );
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      onError("An unexpected error occurred. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Booking Summary */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          Booking Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">
              Car Rental ({booking.totalDays} day
              {booking.totalDays !== 1 ? "s" : ""})
            </span>
            <span className="text-gray-900">
              AED {booking.totalAmount?.toFixed(2)}
            </span>
          </div>

          {booking.securityDeposit > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Security Deposit</span>
              <span className="text-gray-900">
                AED {booking.securityDeposit.toFixed(2)}
              </span>
            </div>
          )}

          <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
            <span className="text-gray-900">Total Amount</span>
            <span className="text-green-600 text-lg">
              AED {booking.totalPayable?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Card Details
          </label>
          <div className="border border-gray-300 rounded-lg p-4 bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all">
            <CardElement
              options={CARD_ELEMENT_OPTIONS}
              onChange={handleCardChange}
            />
          </div>
          {cardError && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {cardError}
            </p>
          )}
        </div>

        {/* Security Notice */}
        <div className="flex items-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <Shield className="w-4 h-4 mr-2 text-blue-600" />
          <span>Your payment is secure and encrypted with 256-bit SSL</span>
        </div>
      </div>

      {/* Error Display */}
      {(paymentError || onError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Payment Error</h4>
            <p className="text-sm text-red-700 mt-1">{paymentError}</p>
          </div>
        </div>
      )}

      {/* Processing State */}
      {processing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
          <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mr-3"></div>
          <span className="text-blue-800">Processing your payment...</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || processing || paymentLoading || !cardComplete}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
      >
        {processing || paymentLoading ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pay AED {booking.totalPayable?.toFixed(2)}
          </>
        )}
      </button>

      {/* Payment Security */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <span>🔒 SSL Secured</span>
          <span>•</span>
          <span>💳 PCI Compliant</span>
          <span>•</span>
          <span>🛡️ Stripe Protected</span>
        </div>
      </div>

      {/* Test Card Info - Only show in development */}
      {import.meta.env.DEV && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">
            🧪 Test Mode - Use Test Cards
          </h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">✅ Successful Payment:</p>
                <p className="font-mono">4242 4242 4242 4242</p>
              </div>
              <div>
                <p className="font-medium">❌ Declined Payment:</p>
                <p className="font-mono">4000 0000 0000 0002</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-yellow-300">
              <p>
                <strong>Expiry:</strong> Any future date (e.g., 12/25)
              </p>
              <p>
                <strong>CVC:</strong> Any 3-digit number (e.g., 123)
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

const PaymentForm = ({ booking, onSuccess, onError }) => {
  const { stripePromise } = usePayment();

  if (!booking) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600">No booking information found</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm booking={booking} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
};

export default PaymentForm;
