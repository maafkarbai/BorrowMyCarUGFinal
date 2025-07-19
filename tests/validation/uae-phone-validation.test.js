const { describe, it, expect, beforeEach, vi } = require('vitest');
const request = require('supertest');
const User = require('../../models/User');
const app = require('../../index');

// Mock Twilio
vi.mock('twilio', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    verify: {
      services: vi.fn(() => ({
        verifications: {
          create: vi.fn().mockResolvedValue({
            sid: 'test-verification-sid',
            status: 'pending'
          })
        },
        verificationChecks: {
          create: vi.fn().mockResolvedValue({
            sid: 'test-check-sid',
            status: 'approved'
          })
        }
      }))
    }
  }))
}));

describe('UAE Phone Number Validation', () => {
  let testUser;

  beforeEach(() => {
    testUser = global.testHelpers.generateTestUser('renter');
  });

  describe('Phone Number Format Validation', () => {
    it('should accept valid UAE mobile numbers', async () => {
      const validNumbers = [
        '+971501234567',
        '+971521234567',
        '+971541234567',
        '+971551234567',
        '+971561234567',
        '+971581234567',
        '971501234567',
        '0501234567'
      ];

      for (const phoneNumber of validNumbers) {
        const response = await request(app)
          .post('/api/auth/validate-phone')
          .send({ phoneNumber });

        expect(response.status).toBe(200);
        expect(response.body.isValid).toBe(true);
        expect(response.body.formatted).toMatch(/^\+971\d{9}$/);
      }
    });

    it('should reject invalid UAE mobile numbers', async () => {
      const invalidNumbers = [
        '+971401234567', // Invalid prefix (40)
        '+971701234567', // Invalid prefix (70)
        '+97150123456',  // Too short
        '+9715012345678', // Too long
        '+966501234567', // Saudi Arabia
        '+1234567890',   // US format
        '123456789',     // Too short
        'invalid-phone', // Non-numeric
        '+971-50-123-4567', // With dashes
        '+971 50 123 4567', // With spaces
        ''               // Empty
      ];

      for (const phoneNumber of invalidNumbers) {
        const response = await request(app)
          .post('/api/auth/validate-phone')
          .send({ phoneNumber });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid UAE phone number');
      }
    });

    it('should normalize phone numbers to international format', async () => {
      const testCases = [
        { input: '0501234567', expected: '+971501234567' },
        { input: '971501234567', expected: '+971501234567' },
        { input: '+971501234567', expected: '+971501234567' },
        { input: '00971501234567', expected: '+971501234567' },
        { input: '+971-50-123-4567', expected: '+971501234567' },
        { input: '+971 50 123 4567', expected: '+971501234567' }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/auth/validate-phone')
          .send({ phoneNumber: testCase.input });

        expect(response.status).toBe(200);
        expect(response.body.formatted).toBe(testCase.expected);
      }
    });

    it('should validate UAE landline numbers', async () => {
      const validLandlines = [
        '+97124567890',  // Abu Dhabi
        '+97143567890',  // Dubai
        '+97165567890',  // Sharjah
        '+97172567890',  // Ajman
        '+97176567890',  // Ras Al Khaimah
        '+97179567890'   // Fujairah
      ];

      for (const phoneNumber of validLandlines) {
        const response = await request(app)
          .post('/api/auth/validate-phone')
          .send({ phoneNumber, type: 'landline' });

        expect(response.status).toBe(200);
        expect(response.body.isValid).toBe(true);
        expect(response.body.type).toBe('landline');
      }
    });

    it('should identify mobile vs landline correctly', async () => {
      const mobileNumber = '+971501234567';
      const landlineNumber = '+97124567890';

      const mobileResponse = await request(app)
        .post('/api/auth/validate-phone')
        .send({ phoneNumber: mobileNumber });

      const landlineResponse = await request(app)
        .post('/api/auth/validate-phone')
        .send({ phoneNumber: landlineNumber });

      expect(mobileResponse.body.type).toBe('mobile');
      expect(landlineResponse.body.type).toBe('landline');
    });

    it('should identify network operators', async () => {
      const operatorTests = [
        { number: '+971501234567', operator: 'Etisalat' },
        { number: '+971521234567', operator: 'Etisalat' },
        { number: '+971541234567', operator: 'du' },
        { number: '+971551234567', operator: 'du' },
        { number: '+971561234567', operator: 'du' },
        { number: '+971581234567', operator: 'du' }
      ];

      for (const test of operatorTests) {
        const response = await request(app)
          .post('/api/auth/validate-phone')
          .send({ phoneNumber: test.number });

        expect(response.status).toBe(200);
        expect(response.body.operator).toBe(test.operator);
      }
    });
  });

  describe('SMS Verification', () => {
    it('should send SMS verification to valid UAE number', async () => {
      const response = await request(app)
        .post('/api/auth/send-sms-verification')
        .send({ phoneNumber: '+971501234567' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('SMS verification sent');
      expect(response.body.verificationSid).toBeTruthy();
    });

    it('should not send SMS to invalid numbers', async () => {
      const response = await request(app)
        .post('/api/auth/send-sms-verification')
        .send({ phoneNumber: '+1234567890' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid UAE phone number');
    });

    it('should verify SMS code', async () => {
      const phoneNumber = '+971501234567';
      
      // First send verification
      const sendResponse = await request(app)
        .post('/api/auth/send-sms-verification')
        .send({ phoneNumber });

      expect(sendResponse.status).toBe(200);

      // Then verify code
      const verifyResponse = await request(app)
        .post('/api/auth/verify-sms-code')
        .send({ 
          phoneNumber,
          code: '123456'
        });

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.message).toContain('Phone number verified');
    });

    it('should reject invalid SMS codes', async () => {
      const phoneNumber = '+971501234567';
      
      // Mock Twilio to return invalid status
      const twilio = require('twilio');
      twilio().verify.services().verificationChecks.create.mockResolvedValueOnce({
        sid: 'test-check-sid',
        status: 'denied'
      });

      const response = await request(app)
        .post('/api/auth/verify-sms-code')
        .send({ 
          phoneNumber,
          code: '000000'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid verification code');
    });

    it('should rate limit SMS verification requests', async () => {
      const phoneNumber = '+971501234567';
      
      // Send first SMS
      await request(app)
        .post('/api/auth/send-sms-verification')
        .send({ phoneNumber });

      // Try to send another immediately
      const response = await request(app)
        .post('/api/auth/send-sms-verification')
        .send({ phoneNumber });

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('rate limit');
    });

    it('should handle Twilio service errors', async () => {
      const twilio = require('twilio');
      twilio().verify.services().verifications.create.mockRejectedValueOnce(
        new Error('Twilio service error')
      );

      const response = await request(app)
        .post('/api/auth/send-sms-verification')
        .send({ phoneNumber: '+971501234567' });

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('SMS service error');
    });
  });

  describe('Phone Number Registration', () => {
    it('should prevent duplicate phone number registration', async () => {
      // Create first user
      const firstUser = await User.create({
        ...testUser,
        phoneNumber: '+971501234567',
        password: '$2a$10$hashedPassword',
        documents: { emiratesIdFront: 'url', emiratesIdBack: 'url' }
      });

      // Try to register second user with same phone
      const response = await request(app)
        .post('/api/auth/register')
        .field('fullName', 'Another User')
        .field('email', 'another@example.com')
        .field('password', 'Password123!')
        .field('phoneNumber', '+971501234567')
        .field('role', 'renter')
        .attach('emiratesIdFront', Buffer.from('fake-image'), 'emirates-front.jpg')
        .attach('emiratesIdBack', Buffer.from('fake-image'), 'emirates-back.jpg');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Phone number already registered');
    });

    it('should allow phone number update with verification', async () => {
      const user = await User.create({
        ...testUser,
        password: '$2a$10$hashedPassword',
        documents: { emiratesIdFront: 'url', emiratesIdBack: 'url' },
        isEmailVerified: true,
        accountStatus: 'approved'
      });

      const token = require('jsonwebtoken').sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const newPhoneNumber = '+971521234567';

      // Update phone number
      const response = await request(app)
        .put('/api/auth/update-phone')
        .set('Authorization', `Bearer ${token}`)
        .send({ phoneNumber: newPhoneNumber });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Phone number updated');

      // Verify user is updated but not verified
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.phoneNumber).toBe(newPhoneNumber);
      expect(updatedUser.isPhoneVerified).toBe(false);
    });

    it('should require phone verification for sensitive operations', async () => {
      const user = await User.create({
        ...testUser,
        password: '$2a$10$hashedPassword',
        documents: { emiratesIdFront: 'url', emiratesIdBack: 'url' },
        isEmailVerified: true,
        accountStatus: 'approved',
        isPhoneVerified: false
      });

      const token = require('jsonwebtoken').sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Try to perform sensitive operation
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          carId: 'test-car-id',
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 48 * 60 * 60 * 1000)
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Phone verification required');
    });
  });

  describe('Phone Number Security', () => {
    it('should mask phone numbers in responses', async () => {
      const user = await User.create({
        ...testUser,
        phoneNumber: '+971501234567',
        password: '$2a$10$hashedPassword',
        documents: { emiratesIdFront: 'url', emiratesIdBack: 'url' }
      });

      const response = await request(app)
        .get(`/api/users/${user._id}/public-profile`);

      expect(response.status).toBe(200);
      expect(response.body.phoneNumber).toBe('+971501***567');
    });

    it('should log phone number changes', async () => {
      const user = await User.create({
        ...testUser,
        password: '$2a$10$hashedPassword',
        documents: { emiratesIdFront: 'url', emiratesIdBack: 'url' },
        isEmailVerified: true,
        accountStatus: 'approved'
      });

      const token = require('jsonwebtoken').sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      await request(app)
        .put('/api/auth/update-phone')
        .set('Authorization', `Bearer ${token}`)
        .send({ phoneNumber: '+971521234567' });

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.phoneChangeHistory).toBeDefined();
      expect(updatedUser.phoneChangeHistory.length).toBeGreaterThan(0);
    });

    it('should prevent phone number enumeration', async () => {
      const response = await request(app)
        .post('/api/auth/check-phone')
        .send({ phoneNumber: '+971501234567' });

      // Should not reveal if phone exists
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Check complete');
      expect(response.body.exists).toBeUndefined();
    });

    it('should validate phone numbers against blacklisted numbers', async () => {
      const blacklistedNumber = '+971501111111';
      
      const response = await request(app)
        .post('/api/auth/validate-phone')
        .send({ phoneNumber: blacklistedNumber });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Phone number not allowed');
    });

    it('should detect virtual/VoIP numbers', async () => {
      const virtualNumber = '+971500000000';
      
      const response = await request(app)
        .post('/api/auth/validate-phone')
        .send({ phoneNumber: virtualNumber });

      expect(response.status).toBe(200);
      expect(response.body.isVirtual).toBe(true);
      expect(response.body.warning).toContain('Virtual number detected');
    });
  });

  describe('Integration with User Registration', () => {
    it('should validate phone during registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .field('fullName', testUser.fullName)
        .field('email', testUser.email)
        .field('password', testUser.password)
        .field('phoneNumber', '+971401234567') // Invalid prefix
        .field('role', 'renter')
        .attach('emiratesIdFront', Buffer.from('fake-image'), 'emirates-front.jpg')
        .attach('emiratesIdBack', Buffer.from('fake-image'), 'emirates-back.jpg');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid UAE phone number');
    });

    it('should normalize phone during registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .field('fullName', testUser.fullName)
        .field('email', testUser.email)
        .field('password', testUser.password)
        .field('phoneNumber', '0501234567') // Local format
        .field('role', 'renter')
        .attach('emiratesIdFront', Buffer.from('fake-image'), 'emirates-front.jpg')
        .attach('emiratesIdBack', Buffer.from('fake-image'), 'emirates-back.jpg');

      expect(response.status).toBe(201);
      
      const user = await User.findOne({ email: testUser.email });
      expect(user.phoneNumber).toBe('+971501234567');
    });

    it('should require phone verification for account activation', async () => {
      const user = await User.create({
        ...testUser,
        password: '$2a$10$hashedPassword',
        documents: { emiratesIdFront: 'url', emiratesIdBack: 'url' },
        isEmailVerified: true,
        accountStatus: 'pending_phone_verification'
      });

      const token = require('jsonwebtoken').sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Should not allow access until phone is verified
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Phone verification required');
    });
  });
});