// src/services/paymentService.js - Payment Service with Stripe Integration
import API from "../../api";

// Payment service class
class PaymentService {
  constructor() {
    this.stripe = null;
    this.isStripeLoaded = false;
  }

  // Initialize Stripe
  async initializeStripe() {
    if (this.isStripeLoaded && this.stripe) {
      return this.stripe;
    }

    try {
      // Load Stripe.js dynamically
      if (!window.Stripe) {
        const script = document.createElement("script");
        script.src = "https://js.stripe.com/v3/";
        script.async = true;
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      // Get publishable key from your backend
      const response = await API.get("/payments/stripe-config");
      const { publishableKey } = response.data.data;

      this.stripe = window.Stripe(publishableKey);
      this.isStripeLoaded = true;

      return this.stripe;
    } catch (error) {
      console.error("Failed to initialize Stripe:", error);
      throw new Error("Payment system unavailable. Please try again later.");
    }
  }

  // Process Stripe payment
  async processStripePayment(paymentData) {
    try {
      const stripe = await this.initializeStripe();

      // Create payment intent on your backend
      const response = await API.post("/payments/create-payment-intent", {
        amount: paymentData.amount,
        currency: paymentData.currency || "AED",
        bookingId: paymentData.bookingId,
        metadata: {
          carId: paymentData.carId,
          carTitle: paymentData.carTitle,
          startDate: paymentData.startDate,
          endDate: paymentData.endDate,
          numberOfDays: paymentData.numberOfDays,
        },
      });

      const { clientSecret, paymentIntentId } = response.data;

      // Confirm payment with Stripe
      let result;

      if (paymentData.cardDetails.savedCardId) {
        // Use saved card
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentData.cardDetails.savedCardId,
        });
      } else {
        // Use new card
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: {
              number: paymentData.cardDetails.cardNumber.replace(/\s/g, ""),
              exp_month: parseInt(
                paymentData.cardDetails.expiryDate.split("/")[0]
              ),
              exp_year: parseInt(
                "20" + paymentData.cardDetails.expiryDate.split("/")[1]
              ),
              cvc: paymentData.cardDetails.cvv,
            },
            billing_details: {
              name: paymentData.cardDetails.cardholderName,
            },
          },
          save_payment_method: paymentData.cardDetails.saveCard,
        });
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      return {
        success: true,
        paymentId: paymentIntentId,
        paymentMethod: "stripe",
        status: "completed",
        transactionId: result.paymentIntent.id,
        amount: paymentData.amount,
        currency: paymentData.currency || "AED",
      };
    } catch (error) {
      console.error("Stripe payment error:", error);
      throw error;
    }
  }






  // Process cash on pickup
  async processCashOnPickup(paymentData) {
    try {
      const response = await API.post("/payments/cash-on-pickup", {
        amount: paymentData.amount,
        currency: paymentData.currency || "AED",
        bookingId: paymentData.bookingId,
        cashDetails: paymentData.cashDetails,
        metadata: {
          carId: paymentData.carId,
          carTitle: paymentData.carTitle,
          startDate: paymentData.startDate,
          endDate: paymentData.endDate,
          numberOfDays: paymentData.numberOfDays,
          meetingLocation: paymentData.cashDetails.meetingLocation,
          meetingTime: paymentData.cashDetails.meetingTime,
          notes: paymentData.cashDetails.notes,
        },
      });

      return {
        success: true,
        paymentId: response.data.paymentId,
        paymentMethod: "cash_on_pickup",
        status: "pending_pickup",
        meetingDetails: {
          location: paymentData.cashDetails.meetingLocation,
          time: paymentData.cashDetails.meetingTime,
          notes: paymentData.cashDetails.notes,
          amount: paymentData.amount,
          currency: paymentData.currency || "AED",
        },
      };
    } catch (error) {
      console.error("Cash on pickup error:", error);
      throw error;
    }
  }

  // Main payment processing method
  async processPayment(paymentData) {
    try {
      let result;

      switch (paymentData.paymentMethod) {
        case "Card":
          result = await this.processStripePayment(paymentData);
          break;


        case "Cash":
          result = await this.processCashOnPickup(paymentData);
          break;

        default:
          throw new Error("Unsupported payment method");
      }

      // Log successful payment
      console.log("Payment processed successfully:", result);

      return result;
    } catch (error) {
      // Log payment error
      console.error("Payment processing failed:", error);

      // Track failed payment
      try {
        await API.post("/payments/log-error", {
          bookingId: paymentData.bookingId,
          paymentMethod: paymentData.paymentMethod,
          error: error.message,
          amount: paymentData.amount,
        });
      } catch (logError) {
        console.error("Failed to log payment error:", logError);
      }

      throw error;
    }
  }

  // Get saved payment methods
  async getSavedPaymentMethods() {
    try {
      const response = await API.get("/payments/saved-methods");
      return response.data.data.paymentMethods || [];
    } catch (error) {
      console.error("Failed to fetch saved payment methods:", error);
      return [];
    }
  }

  // Delete saved payment method
  async deleteSavedPaymentMethod(paymentMethodId) {
    try {
      await API.delete(`/payments/saved-methods/${paymentMethodId}`);
      return true;
    } catch (error) {
      console.error("Failed to delete payment method:", error);
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory(page = 1, limit = 10) {
    try {
      const response = await API.get(
        `/payments/history?page=${page}&limit=${limit}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
      throw error;
    }
  }

  // Refund payment
  async refundPayment(paymentId, amount, reason) {
    try {
      const response = await API.post(`/payments/${paymentId}/refund`, {
        amount,
        reason,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to process refund:", error);
      throw error;
    }
  }
}

// Create singleton instance
const paymentService = new PaymentService();
export default paymentService;

// Export individual methods for easier imports
export const {
  processPayment,
  getSavedPaymentMethods,
  deleteSavedPaymentMethod,
  getPaymentHistory,
  refundPayment,
} = paymentService;
