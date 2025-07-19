const { describe, it, expect, beforeEach, vi } = require('vitest');
const request = require('supertest');
const User = require('../../models/User');
const OTP = require('../../models/OTP');
const app = require('../../index');

// Mock email service
vi.mock('../../utils/emailService', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(true),
  sendApprovalNotification: vi.fn().mockResolvedValue(true)
}));

describe('Email Verification', () => {
  let testUser;
  let savedUser;

  beforeEach(async () => {
    testUser = global.testHelpers.generateTestUser('renter');
    
    // Create user with unverified email
    savedUser = await User.create({
      ...testUser,
      password: '$2a$10$hashedPassword',
      documents: {
        emiratesIdFront: 'test-url',
        emiratesIdBack: 'test-url'
      },
      isEmailVerified: false,
      accountStatus: 'pending_verification'
    });
  });

  describe('POST /api/auth/send-verification-email', () => {
    it('should send verification email to unverified user', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification-email')
        .send({ email: testUser.email });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Verification email sent');

      // Verify OTP was created
      const otp = await OTP.findOne({ 
        email: testUser.email,
        type: 'email_verification' 
      });
      expect(otp).toBeTruthy();
      expect(otp.code).toMatch(/^\d{6}$/);
      expect(otp.expiresAt).toBeInstanceOf(Date);
    });

    it('should not send verification email to already verified user', async () => {
      // Update user to verified
      await User.findByIdAndUpdate(savedUser._id, { isEmailVerified: true });

      const response = await request(app)
        .post('/api/auth/send-verification-email')
        .send({ email: testUser.email });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already verified');
    });

    it('should not send verification email to non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification-email')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('User not found');
    });

    it('should rate limit verification email requests', async () => {
      // Send first email
      await request(app)
        .post('/api/auth/send-verification-email')
        .send({ email: testUser.email });

      // Try to send another immediately
      const response = await request(app)
        .post('/api/auth/send-verification-email')
        .send({ email: testUser.email });

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('rate limit');
    });

    it('should replace expired OTP with new one', async () => {
      // Create expired OTP
      const expiredOTP = await OTP.create({
        email: testUser.email,
        code: '123456',
        type: 'email_verification',
        expiresAt: new Date(Date.now() - 1000) // 1 second ago
      });

      const response = await request(app)
        .post('/api/auth/send-verification-email')
        .send({ email: testUser.email });

      expect(response.status).toBe(200);

      // Verify new OTP was created
      const newOTP = await OTP.findOne({ 
        email: testUser.email,
        type: 'email_verification' 
      });
      expect(newOTP).toBeTruthy();
      expect(newOTP.code).not.toBe(expiredOTP.code);
    });
  });

  describe('POST /api/auth/verify-email', () => {
    let validOTP;

    beforeEach(async () => {
      validOTP = await OTP.create({
        email: testUser.email,
        code: '123456',
        type: 'email_verification',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
      });
    });

    it('should verify email with valid OTP', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ 
          email: testUser.email,
          code: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Email verified');

      // Verify user is updated
      const updatedUser = await User.findById(savedUser._id);
      expect(updatedUser.isEmailVerified).toBe(true);
      expect(updatedUser.accountStatus).toBe('pending_approval');

      // Verify OTP is deleted
      const deletedOTP = await OTP.findById(validOTP._id);
      expect(deletedOTP).toBeNull();
    });

    it('should reject invalid OTP', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ 
          email: testUser.email,
          code: '999999'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid verification code');

      // Verify user is not updated
      const user = await User.findById(savedUser._id);
      expect(user.isEmailVerified).toBe(false);
    });

    it('should reject expired OTP', async () => {
      // Update OTP to expired
      await OTP.findByIdAndUpdate(validOTP._id, {
        expiresAt: new Date(Date.now() - 1000)
      });

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ 
          email: testUser.email,
          code: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('expired');
    });

    it('should handle multiple verification attempts', async () => {
      // First attempt - success
      const response1 = await request(app)
        .post('/api/auth/verify-email')
        .send({ 
          email: testUser.email,
          code: '123456'
        });

      expect(response1.status).toBe(200);

      // Second attempt - should fail (OTP already used)
      const response2 = await request(app)
        .post('/api/auth/verify-email')
        .send({ 
          email: testUser.email,
          code: '123456'
        });

      expect(response2.status).toBe(400);
      expect(response2.body.error).toContain('Invalid verification code');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ 
          email: 'invalid-email',
          code: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid email');
    });

    it('should validate OTP format', async () => {
      const invalidCodes = ['12345', '1234567', 'abcdef', '12345a'];
      
      for (const code of invalidCodes) {
        const response = await request(app)
          .post('/api/auth/verify-email')
          .send({ 
            email: testUser.email,
            code
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid verification code');
      }
    });

    it('should clean up expired OTPs', async () => {
      // Create multiple expired OTPs
      await OTP.create({
        email: 'test1@example.com',
        code: '111111',
        type: 'email_verification',
        expiresAt: new Date(Date.now() - 1000)
      });

      await OTP.create({
        email: 'test2@example.com',
        code: '222222',
        type: 'email_verification',
        expiresAt: new Date(Date.now() - 1000)
      });

      // Trigger cleanup by attempting verification
      await request(app)
        .post('/api/auth/verify-email')
        .send({ 
          email: testUser.email,
          code: '123456'
        });

      // Check that expired OTPs are cleaned up
      const expiredOTPs = await OTP.find({
        expiresAt: { $lt: new Date() }
      });

      expect(expiredOTPs.length).toBe(0);
    });
  });

  describe('GET /api/auth/resend-verification', () => {
    it('should resend verification email', async () => {
      const response = await request(app)
        .get(`/api/auth/resend-verification?email=${testUser.email}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Verification email resent');

      // Verify new OTP was created
      const otp = await OTP.findOne({ 
        email: testUser.email,
        type: 'email_verification' 
      });
      expect(otp).toBeTruthy();
    });

    it('should not resend to verified user', async () => {
      await User.findByIdAndUpdate(savedUser._id, { isEmailVerified: true });

      const response = await request(app)
        .get(`/api/auth/resend-verification?email=${testUser.email}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already verified');
    });
  });
});