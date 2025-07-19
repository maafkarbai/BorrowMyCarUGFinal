// src/context/StripeProvider.jsx
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Load Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripeProvider = ({ children }) => {
  const options = {
    // Stripe appearance customization
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#16a34a", // Green-600 to match your theme
        colorBackground: "#ffffff",
        colorText: "#374151",
        colorDanger: "#dc2626",
        fontFamily: "system-ui, sans-serif",
        borderRadius: "8px",
      },
    },
    // Enable payment methods
    loader: "auto",
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
