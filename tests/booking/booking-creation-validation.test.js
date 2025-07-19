const { describe, it, expect, beforeEach, vi } = require('vitest');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Car = require('../../models/Car');
const Booking = require('../../models/Booking');
const app = require('../../index');

describe('Booking Creation & Validation', () => {
  let renterUser, ownerUser, car;
  let renterToken, ownerToken;

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
      location: {
        address: 'Dubai Marina',
        coordinates: [55.1428, 25.0775]
      },
      availability: {
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      isActive: true
    });

    // Generate tokens
    renterToken = jwt.sign(
      { userId: renterUser._id, role: 'renter' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    ownerToken = jwt.sign(
      { userId: ownerUser._id, role: 'owner' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  describe('POST /api/bookings', () => {
    it('should create valid booking', async () => {
      const bookingData = {
        carId: car._id,
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        pickupLocation: 'Dubai Marina Mall',
        dropoffLocation: 'Dubai Marina Mall'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renterToken}`)
        .send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body.booking).toMatchObject({
        carId: car._id.toString(),
        renterId: renterUser._id.toString(),
        status: 'pending',
        totalPrice: expect.any(Number)
      });
    });

    it('should calculate correct total price', async () => {
      const startDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
      const days = 2;
      const expectedTotal = days * car.pricePerDay;

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          carId: car._id,
          startDate,
          endDate,
          pickupLocation: 'Dubai Marina Mall',
          dropoffLocation: 'Dubai Marina Mall'
        });

      expect(response.status).toBe(201);
      expect(response.body.booking.totalPrice).toBe(expectedTotal);
    });

    it('should validate booking dates', async () => {
      const invalidBookings = [
        {
          // Past start date
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        {
          // End date before start date
          startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        },
        {
          // Same start and end date
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        }
      ];

      for (const booking of invalidBookings) {
        const response = await request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${renterToken}`)
          .send({
            carId: car._id,
            ...booking,
            pickupLocation: 'Dubai Marina Mall',
            dropoffLocation: 'Dubai Marina Mall'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid booking dates');
      }
    });

    it('should validate car availability', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          carId: car._id,
          startDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // Outside availability
          endDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
          pickupLocation: 'Dubai Marina Mall',
          dropoffLocation: 'Dubai Marina Mall'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Car not available');
    });

    it('should not allow owner to book their own car', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          carId: car._id,
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          pickupLocation: 'Dubai Marina Mall',
          dropoffLocation: 'Dubai Marina Mall'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Cannot book your own car');
    });

    it('should validate required fields', async () => {
      const requiredFields = ['carId', 'startDate', 'endDate', 'pickupLocation'];
      
      for (const field of requiredFields) {
        const bookingData = {
          carId: car._id,
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          pickupLocation: 'Dubai Marina Mall',
          dropoffLocation: 'Dubai Marina Mall'
        };
        
        delete bookingData[field];

        const response = await request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${renterToken}`)
          .send(bookingData);

        expect(response.status).toBe(400);
        expect(response.body.error).toContain(`${field} is required`);
      }
    });

    it('should validate car exists and is active', async () => {
      const fakeCarId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          carId: fakeCarId,
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          pickupLocation: 'Dubai Marina Mall',
          dropoffLocation: 'Dubai Marina Mall'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Car not found');
    });

    it('should validate minimum and maximum booking duration', async () => {
      // Test minimum duration (less than 1 day)
      const tooShortResponse = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          carId: car._id,
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours
          pickupLocation: 'Dubai Marina Mall',
          dropoffLocation: 'Dubai Marina Mall'
        });

      expect(tooShortResponse.status).toBe(400);
      expect(tooShortResponse.body.error).toContain('Minimum booking duration');

      // Test maximum duration (more than 30 days)
      const tooLongResponse = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          carId: car._id,
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000), // 32 days
          pickupLocation: 'Dubai Marina Mall',
          dropoffLocation: 'Dubai Marina Mall'
        });

      expect(tooLongResponse.status).toBe(400);
      expect(tooLongResponse.body.error).toContain('Maximum booking duration');
    });

    it('should validate pickup and dropoff locations', async () => {
      const invalidLocations = ['', null, undefined, 'a', 'x'.repeat(201)];
      
      for (const location of invalidLocations) {
        const response = await request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${renterToken}`)
          .send({
            carId: car._id,
            startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            pickupLocation: location || 'Dubai Marina Mall',
            dropoffLocation: location || 'Dubai Marina Mall'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid location');
      }
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({
          carId: car._id,
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          pickupLocation: 'Dubai Marina Mall',
          dropoffLocation: 'Dubai Marina Mall'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Authentication required');
    });

    it('should handle special pricing rules', async () => {
      // Update car with weekend pricing
      await Car.findByIdAndUpdate(car._id, {
        pricingRules: {
          weekendMultiplier: 1.5,
          longTermDiscount: { days: 7, discount: 0.1 }
        }
      });

      const startDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          carId: car._id,
          startDate,
          endDate,
          pickupLocation: 'Dubai Marina Mall',
          dropoffLocation: 'Dubai Marina Mall'
        });

      expect(response.status).toBe(201);
      expect(response.body.booking.priceBreakdown).toBeDefined();
    });

    it('should validate user eligibility', async () => {
      // Test with suspended user
      await User.findByIdAndUpdate(renterUser._id, { accountStatus: 'suspended' });

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          carId: car._id,
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          pickupLocation: 'Dubai Marina Mall',
          dropoffLocation: 'Dubai Marina Mall'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Account suspended');
    });
  });

  describe('Booking Validation Rules', () => {
    it('should enforce advance booking requirements', async () => {
      // Try to book too soon (less than 2 hours in advance)
      const tooSoonDate = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
      
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          carId: car._id,
          startDate: tooSoonDate,
          endDate: new Date(tooSoonDate.getTime() + 24 * 60 * 60 * 1000),
          pickupLocation: 'Dubai Marina Mall',
          dropoffLocation: 'Dubai Marina Mall'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Advance booking required');
    });

    it('should validate booking within business hours', async () => {
      // Create booking with pickup time outside business hours
      const earlyMorning = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      earlyMorning.setHours(5, 0, 0, 0); // 5 AM

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          carId: car._id,
          startDate: earlyMorning,
          endDate: new Date(earlyMorning.getTime() + 24 * 60 * 60 * 1000),
          pickupLocation: 'Dubai Marina Mall',
          dropoffLocation: 'Dubai Marina Mall'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Business hours');
    });

    it('should validate age restrictions', async () => {
      // Update car with age restriction
      await Car.findByIdAndUpdate(car._id, {
        restrictions: {
          minimumAge: 25,
          maximumAge: 65
        }
      });

      // Update user to be under age limit
      await User.findByIdAndUpdate(renterUser._id, {
        dateOfBirth: new Date(Date.now() - 20 * 365 * 24 * 60 * 60 * 1000) // 20 years old
      });

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          carId: car._id,
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          pickupLocation: 'Dubai Marina Mall',
          dropoffLocation: 'Dubai Marina Mall'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Age restriction');
    });

    it('should validate driving license requirements', async () => {
      // Update car to require UAE license
      await Car.findByIdAndUpdate(car._id, {
        requirements: {
          uaeLicense: true,
          internationalLicense: false
        }
      });

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          carId: car._id,
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          pickupLocation: 'Dubai Marina Mall',
          dropoffLocation: 'Dubai Marina Mall'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('UAE driving license required');
    });

    it('should validate concurrent booking limits', async () => {
      // Create maximum allowed bookings
      for (let i = 0; i < 3; i++) {
        await Booking.create({
          carId: car._id,
          renterId: renterUser._id,
          startDate: new Date(Date.now() + (i + 5) * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + (i + 6) * 24 * 60 * 60 * 1000),
          status: 'confirmed',
          totalPrice: 150
        });
      }

      // Try to create one more booking
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          carId: car._id,
          startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
          pickupLocation: 'Dubai Marina Mall',
          dropoffLocation: 'Dubai Marina Mall'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Maximum concurrent bookings');
    });
  });
});