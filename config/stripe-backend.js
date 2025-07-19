import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  console.error('⚠️ STRIPE_SECRET_KEY is not configured in environment variables');
}

export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

export const stripeConfig = {
  currency: 'aed',
  country: 'AE',
  webhookSecret: stripeWebhookSecret,
  paymentMethods: ['card'],
  mode: process.env.NODE_ENV === 'production' ? 'live' : 'test'
};

export const formatAmountForStripe = (amount) => {
  return Math.round(amount * 100);
};

export const formatAmountFromStripe = (amount) => {
  return amount / 100;
};

export const validateStripeConfig = () => {
  if (!stripeSecretKey) {
    throw new Error('Stripe secret key is not configured');
  }
  return true;
};