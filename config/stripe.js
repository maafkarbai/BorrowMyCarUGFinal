// src/config/stripe.js
import { loadStripe } from "@stripe/stripe-js";

// Test publishable key (replace with your actual test key)
const stripePublishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51...";

// Initialize Stripe
export const stripePromise = loadStripe(stripePublishableKey);

// Stripe configuration
export const stripeConfig = {
  mode: import.meta.env.VITE_STRIPE_MODE || "test", // 'test' or 'live'
  currency: "aed", // UAE Dirham
  country: "AE", // UAE country code
};

// Payment method configuration for UAE
export const paymentMethods = {
  card: {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  },
};

// Format amount for Stripe (convert AED to fils - 1 AED = 100 fils)
export const formatAmountForStripe = (amount) => {
  return Math.round(amount * 100);
};

// Format amount for display
export const formatAmountForDisplay = (amount) => {
  return (amount / 100).toFixed(2);
};

// Validate Stripe environment
export const validateStripeConfig = () => {
  if (!stripePublishableKey || stripePublishableKey === "pk_test_51...") {
    console.error("⚠️ Stripe publishable key not configured properly");
    return false;
  }
  return true;
};
