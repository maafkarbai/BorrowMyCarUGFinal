const { describe, it, expect, beforeEach, vi } = require('vitest');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const stripe = require('stripe');
const User = require('../../models/User');
const Car = require('../../models/Car');
const Booking = require('../../models/Booking');
const Payment = require('../../models/Payment');
const app = require('../../index');

// Mock Stripe
vi.mock('stripe', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_test',
        amount: 30000,
        currency: 'aed',
        status: 'requires_payment_method'
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 30000,
        currency: 'aed'
      }),
      confirm: vi.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded'
      })
    },
    webhooks: {
      constructEvent: vi.fn().mockReturnValue({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 30000,
            currency: 'aed',
            status: 'succeeded'
          }
        }
      })
    }
  }))
}));

describe('Stripe Payment Flow', () => {
  let renterUser, ownerUser, car, booking;
  let renterToken;

  beforeEach(async () => {
    // Create test users
    renterUser = await User.create({
      ...global.testHelpers.generateTestUser('renter'),
      password: '$2a$10$hashedPassword',
      documents: { emiratesIdFront: 'url', emiratesIdBack: 'url' },
      isEmailVerified: true,
      accountStatus: 'approved'
    });

    ownerUser = await User.create({
      ...global.testHelpers.generateTestUser('owner'),
      password: '$2a$10$hashedPassword',
      documents: { 
        emiratesIdFront: 'url', 
        emiratesIdBack: 'url',
        drivingLicenseFront: 'url',
        drivingLicenseBack: 'url'
      },
      isEmailVerified: true,
      accountStatus: 'approved'
    });

    // Create test car
    car = await Car.create({
      owner: ownerUser._id,
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      pricePerDay: 150,
      deposit: 500,
      location: { address: 'Dubai Marina', coordinates: [55.1428, 25.0775] },
      isActive: true
    });

    // Create test booking
    booking = await Booking.create({
      carId: car._id,
      renterId: renterUser._id,
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      totalPrice: 300,
      deposit: 500,
      status: 'pending_payment',
      pickupLocation: 'Dubai Marina Mall',
      dropoffLocation: 'Dubai Marina Mall'
    });

    renterToken = jwt.sign(
      { userId: renterUser._id, role: 'renter' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  describe('POST /api/payments/create-payment-intent', () => {
    it('should create Stripe payment intent', async () => {
      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          bookingId: booking._id,
          paymentMethod: 'card'
        });

      expect(response.status).toBe(200);
      expect(response.body.clientSecret).toBeTruthy();
      expect(response.body.paymentIntentId).toBeTruthy();
      expect(response.body.amount).toBe(80000); // 300 + 500 in fils
    });

    it('should calculate correct amount including deposit', async () => {
      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          bookingId: booking._id,
          paymentMethod: 'card'
        });

      expect(response.status).toBe(200);
      expect(response.body.amount).toBe(80000); // (300 + 500) * 100 fils
    });

    it('should reject invalid booking', async () => {
      const fakeBookingId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          bookingId: fakeBookingId,
          paymentMethod: 'card'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Booking not found');
    });

    it('should reject payment for non-owner booking', async () => {
      const anotherUser = await User.create({
        ...global.testHelpers.generateTestUser('renter'),
        password: '$2a$10$hashedPassword',
        documents: { emiratesIdFront: 'url', emiratesIdBack: 'url' },
        isEmailVerified: true,
        accountStatus: 'approved'
      });

      const anotherToken = jwt.sign(
        { userId: anotherUser._id, role: 'renter' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer ${anotherToken}`)
        .send({
          bookingId: booking._id,
          paymentMethod: 'card'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Not authorized');
    });

    it('should reject payment for already paid booking', async () => {
      await Booking.findByIdAndUpdate(booking._id, { status: 'confirmed' });

      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          bookingId: booking._id,
          paymentMethod: 'card'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already paid');
    });

    it('should handle cash payment method', async () => {
      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          bookingId: booking._id,
          paymentMethod: 'cash'
        });

      expect(response.status).toBe(200);
      expect(response.body.paymentMethod).toBe('cash');
      expect(response.body.requiresDeposit).toBe(true);
    });
  });

  describe('POST /api/payments/confirm-payment', () => {
    it('should confirm successful payment', async () => {
      const response = await request(app)
        .post('/api/payments/confirm-payment')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          paymentIntentId: 'pi_test_123',
          bookingId: booking._id
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Payment confirmed');

      // Verify booking status updated
      const updatedBooking = await Booking.findById(booking._id);
      expect(updatedBooking.status).toBe('confirmed');
    });

    it('should create payment record', async () => {
      await request(app)
        .post('/api/payments/confirm-payment')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          paymentIntentId: 'pi_test_123',
          bookingId: booking._id
        });

      const payment = await Payment.findOne({ bookingId: booking._id });
      expect(payment).toBeTruthy();
      expect(payment.stripePaymentIntentId).toBe('pi_test_123');
      expect(payment.amount).toBe(800); // 300 + 500
      expect(payment.status).toBe('completed');
    });

    it('should handle payment failures', async () => {
      // Mock failed payment
      stripe().paymentIntents.retrieve.mockResolvedValueOnce({
        id: 'pi_test_123',
        status: 'requires_payment_method',
        amount: 30000,
        currency: 'aed',
        last_payment_error: {
          message: 'Card declined'
        }
      });

      const response = await request(app)
        .post('/api/payments/confirm-payment')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          paymentIntentId: 'pi_test_123',
          bookingId: booking._id
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Payment failed');
    });
  });

  describe('POST /api/payments/webhook', () => {
    it('should handle successful payment webhook', async () => {
      const webhookPayload = JSON.stringify({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 80000,
            currency: 'aed',
            status: 'succeeded',
            metadata: {
              bookingId: booking._id.toString()
            }
          }
        }
      });

      const response = await request(app)
        .post('/api/payments/webhook')
        .set('stripe-signature', 'test-signature')
        .send(webhookPayload);

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
    });

    it('should handle failed payment webhook', async () => {
      const webhookPayload = JSON.stringify({
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 80000,
            currency: 'aed',
            status: 'requires_payment_method',
            metadata: {
              bookingId: booking._id.toString()
            }
          }
        }
      });

      const response = await request(app)
        .post('/api/payments/webhook')
        .set('stripe-signature', 'test-signature')
        .send(webhookPayload);

      expect(response.status).toBe(200);
      
      // Verify booking status updated
      const updatedBooking = await Booking.findById(booking._id);
      expect(updatedBooking.status).toBe('payment_failed');
    });

    it('should handle refund webhook', async () => {
      const webhookPayload = JSON.stringify({
        type: 'charge.dispute.created',
        data: {
          object: {
            id: 'dp_test_123',
            charge: 'ch_test_123',
            amount: 80000,
            currency: 'aed',
            reason: 'fraudulent'
          }
        }
      });

      const response = await request(app)
        .post('/api/payments/webhook')
        .set('stripe-signature', 'test-signature')
        .send(webhookPayload);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/payments/history', () => {
    it('should return user payment history', async () => {
      // Create payment record
      await Payment.create({
        bookingId: booking._id,
        userId: renterUser._id,
        stripePaymentIntentId: 'pi_test_123',
        amount: 800,
        currency: 'AED',
        status: 'completed',
        paymentMethod: 'card'
      });

      const response = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${renterToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payments).toHaveLength(1);
      expect(response.body.payments[0].amount).toBe(800);
    });

    it('should paginate payment history', async () => {
      // Create multiple payments
      for (let i = 0; i < 15; i++) {
        await Payment.create({
          bookingId: booking._id,
          userId: renterUser._id,
          stripePaymentIntentId: `pi_test_${i}`,
          amount: 800,
          currency: 'AED',
          status: 'completed',
          paymentMethod: 'card'
        });
      }

      const response = await request(app)
        .get('/api/payments/history?page=1&limit=10')
        .set('Authorization', `Bearer ${renterToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payments).toHaveLength(10);
      expect(response.body.pagination.totalPages).toBe(2);
    });
  });

  describe('POST /api/payments/refund', () => {
    let payment;

    beforeEach(async () => {
      payment = await Payment.create({
        bookingId: booking._id,
        userId: renterUser._id,
        stripePaymentIntentId: 'pi_test_123',
        amount: 800,
        currency: 'AED',
        status: 'completed',
        paymentMethod: 'card'
      });
    });

    it('should process refund for cancellation', async () => {
      // Mock Stripe refund
      stripe().refunds = {
        create: vi.fn().mockResolvedValue({
          id: 're_test_123',
          amount: 80000,
          currency: 'aed',
          status: 'succeeded'
        })
      };

      const response = await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          bookingId: booking._id,
          reason: 'cancelled_by_user',
          amount: 300 // Partial refund
        });

      expect(response.status).toBe(200);
      expect(response.body.refundId).toBeTruthy();
    });

    it('should calculate refund amount based on cancellation policy', async () => {
      const response = await request(app)
        .post('/api/payments/calculate-refund')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          bookingId: booking._id,
          cancellationDate: new Date()
        });

      expect(response.status).toBe(200);
      expect(response.body.refundAmount).toBeDefined();
      expect(response.body.cancellationFee).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle Stripe API errors', async () => {
      stripe().paymentIntents.create.mockRejectedValueOnce(
        new Error('Stripe API error')
      );

      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          bookingId: booking._id,
          paymentMethod: 'card'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Payment service error');
    });

    it('should handle invalid webhook signatures', async () => {
      stripe().webhooks.constructEvent.mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      const response = await request(app)
        .post('/api/payments/webhook')
        .set('stripe-signature', 'invalid-signature')
        .send('invalid-payload');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid webhook signature');
    });
  });
});