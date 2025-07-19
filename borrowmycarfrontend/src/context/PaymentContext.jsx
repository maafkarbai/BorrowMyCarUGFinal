// src/context/PaymentContext.jsx - Fixed to work with your backend
import { createContext, useContext, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import API from "../api";

// Initialize Stripe - requires environment variable
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error('VITE_STRIPE_PUBLISHABLE_KEY environment variable is required');
}

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const createPaymentIntent = async (bookingId, amount) => {
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const payload = { bookingId };
      if (amount && !bookingId) {
        payload.amount = amount;
      }
      
      const response = await API.post("/payments/create-intent", payload);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Payment failed";
      setPaymentError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setPaymentLoading(false);
    }
  };

  const confirmPayment = async (paymentIntentId, bookingId) => {
    try {
      const response = await API.post("/payments/confirm", {
        paymentIntentId,
        bookingId,
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Payment confirmation failed";
      setPaymentError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getPaymentHistory = async () => {
    try {
      const response = await API.get("/payments/history");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch payment history";
      setPaymentError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => {
    setPaymentError(null);
  };

  return (
    <PaymentContext.Provider
      value={{
        stripePromise,
        paymentLoading,
        paymentError,
        createPaymentIntent,
        confirmPayment,
        getPaymentHistory,
        setPaymentError,
        clearError,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within PaymentProvider");
  }
  return context;
};
