const { describe, it, expect, beforeEach, vi } = require('vitest');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const OTP = require('../../models/OTP');
const app = require('../../index');

// Mock email service
vi.mock('../../utils/emailService', () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(true)
}));

describe('Password Reset', () => {
  let testUser;
  let savedUser;

  beforeEach(async () => {
    testUser = global.testHelpers.generateTestUser('renter');
    
    savedUser = await User.create({
      ...testUser,
      password: await bcrypt.hash(testUser.password, 10),
      documents: { emiratesIdFront: 'url', emiratesIdBack: 'url' },
      isEmailVerified: true,
      accountStatus: 'approved'
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email to registered user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Password reset email sent');

      // Verify OTP was created
      const otp = await OTP.findOne({ 
        email: testUser.email,
        type: 'password_reset' 
      });
      expect(otp).toBeTruthy();
      expect(otp.code).toMatch(/^\d{6}$/);
      expect(otp.expiresAt).toBeInstanceOf(Date);
      expect(otp.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should not reveal if email does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Password reset email sent');

      // Verify no OTP was created
      const otp = await OTP.findOne({ 
        email: 'nonexistent@example.com',
        type: 'password_reset' 
      });
      expect(otp).toBeNull();
    });

    it('should rate limit password reset requests', async () => {
      // Send first request
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      // Send second request immediately
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('rate limit');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid email format');
    });

    it('should replace existing reset token', async () => {
      // Create first reset token
      const firstOTP = await OTP.create({
        email: testUser.email,
        code: '123456',
        type: 'password_reset',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      });

      // Request new reset token
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      expect(response.status).toBe(200);

      // Verify old token is replaced
      const oldOTP = await OTP.findById(firstOTP._id);
      expect(oldOTP).toBeNull();

      // Verify new token exists
      const newOTP = await OTP.findOne({ 
        email: testUser.email,
        type: 'password_reset' 
      });
      expect(newOTP).toBeTruthy();
      expect(newOTP.code).not.toBe('123456');
    });

    it('should handle multiple concurrent requests', async () => {
      const promises = [];
      
      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app)
            .post('/api/auth/forgot-password')
            .send({ email: testUser.email })
        );
      }

      const responses = await Promise.all(promises);
      
      // At least one should succeed
      const successResponses = responses.filter(r => r.status === 200);
      expect(successResponses.length).toBeGreaterThan(0);

      // Should only have one OTP in database
      const otps = await OTP.find({ 
        email: testUser.email,
        type: 'password_reset' 
      });
      expect(otps.length).toBe(1);
    });

    it('should not send reset email for suspended accounts', async () => {
      await User.findByIdAndUpdate(savedUser._id, { accountStatus: 'suspended' });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      expect(response.status).toBe(200); // Still returns 200 for security
      
      // But no OTP should be created
      const otp = await OTP.findOne({ 
        email: testUser.email,
        type: 'password_reset' 
      });
      expect(otp).toBeNull();
    });
  });

  describe('POST /api/auth/verify-reset-code', () => {
    let validOTP;

    beforeEach(async () => {
      validOTP = await OTP.create({
        email: testUser.email,
        code: '123456',
        type: 'password_reset',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      });
    });

    it('should verify valid reset code', async () => {
      const response = await request(app)
        .post('/api/auth/verify-reset-code')
        .send({ 
          email: testUser.email,
          code: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Reset code verified');
      expect(response.body.resetToken).toBeTruthy();
    });

    it('should reject invalid reset code', async () => {
      const response = await request(app)
        .post('/api/auth/verify-reset-code')
        .send({ 
          email: testUser.email,
          code: '999999'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid reset code');
    });

    it('should reject expired reset code', async () => {
      // Update OTP to expired
      await OTP.findByIdAndUpdate(validOTP._id, {
        expiresAt: new Date(Date.now() - 1000)
      });

      const response = await request(app)
        .post('/api/auth/verify-reset-code')
        .send({ 
          email: testUser.email,
          code: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('expired');
    });

    it('should generate secure reset token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-reset-code')
        .send({ 
          email: testUser.email,
          code: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.resetToken).toMatch(/^[a-zA-Z0-9]{64}$/);
    });

    it('should store reset token temporarily', async () => {
      const response = await request(app)
        .post('/api/auth/verify-reset-code')
        .send({ 
          email: testUser.email,
          code: '123456'
        });

      expect(response.status).toBe(200);
      
      // Verify user has reset token
      const updatedUser = await User.findById(savedUser._id);
      expect(updatedUser.resetToken).toBeTruthy();
      expect(updatedUser.resetTokenExpires).toBeInstanceOf(Date);
      expect(updatedUser.resetTokenExpires.getTime()).toBeGreaterThan(Date.now());
    });

    it('should clean up OTP after verification', async () => {
      await request(app)
        .post('/api/auth/verify-reset-code')
        .send({ 
          email: testUser.email,
          code: '123456'
        });

      // Verify OTP is deleted
      const otp = await OTP.findById(validOTP._id);
      expect(otp).toBeNull();
    });

    it('should limit verification attempts', async () => {
      // Multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/verify-reset-code')
          .send({ 
            email: testUser.email,
            code: '000000'
          });
      }

      // Should be rate limited
      const response = await request(app)
        .post('/api/auth/verify-reset-code')
        .send({ 
          email: testUser.email,
          code: '123456'
        });

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many attempts');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken;

    beforeEach(async () => {
      // Generate reset token
      resetToken = 'a'.repeat(64);
      await User.findByIdAndUpdate(savedUser._id, {
        resetToken,
        resetTokenExpires: new Date(Date.now() + 15 * 60 * 1000)
      });
    });

    it('should reset password with valid token', async () => {
      const newPassword = 'NewPassword123!';
      
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          resetToken,
          newPassword
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Password reset successful');

      // Verify password is updated
      const updatedUser = await User.findById(savedUser._id);
      const isPasswordValid = await bcrypt.compare(newPassword, updatedUser.password);
      expect(isPasswordValid).toBe(true);

      // Verify reset token is cleared
      expect(updatedUser.resetToken).toBeNull();
      expect(updatedUser.resetTokenExpires).toBeNull();
    });

    it('should reject invalid reset token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          resetToken: 'invalid-token',
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid reset token');
    });

    it('should reject expired reset token', async () => {
      // Update token to expired
      await User.findByIdAndUpdate(savedUser._id, {
        resetTokenExpires: new Date(Date.now() - 1000)
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          resetToken,
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('expired');
    });

    it('should validate new password strength', async () => {
      const weakPasswords = ['short', '12345678', 'password', 'Password1'];
      
      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({ 
            resetToken,
            newPassword: password
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Password must');
      }
    });

    it('should prevent reuse of old password', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          resetToken,
          newPassword: testUser.password // Same as original
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('cannot use the same password');
    });

    it('should invalidate all user sessions after reset', async () => {
      // First reset password
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          resetToken,
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(200);

      // Any existing tokens should be invalidated
      const updatedUser = await User.findById(savedUser._id);
      expect(updatedUser.tokenVersion).toBeGreaterThan(0);
    });

    it('should log password reset event', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          resetToken,
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(200);

      // Verify password reset is logged
      const updatedUser = await User.findById(savedUser._id);
      expect(updatedUser.passwordResetAt).toBeInstanceOf(Date);
    });

    it('should handle concurrent reset attempts', async () => {
      const promises = [];
      
      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app)
            .post('/api/auth/reset-password')
            .send({ 
              resetToken,
              newPassword: `NewPassword${i}123!`
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Only one should succeed
      const successResponses = responses.filter(r => r.status === 200);
      expect(successResponses.length).toBe(1);

      // Others should fail with invalid token
      const failedResponses = responses.filter(r => r.status === 400);
      expect(failedResponses.length).toBe(2);
    });
  });

  describe('Password Reset Security', () => {
    it('should use secure random codes', async () => {
      const codes = new Set();
      
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: `test${i}@example.com` });
        
        const otp = await OTP.findOne({ 
          email: `test${i}@example.com`,
          type: 'password_reset' 
        });
        
        if (otp) {
          codes.add(otp.code);
        }
      }

      // All codes should be unique
      expect(codes.size).toBe(10);
    });

    it('should implement proper timing attack protection', async () => {
      const startTime = Date.now();
      
      // Test with non-existent email
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });
      
      const nonExistentTime = Date.now() - startTime;
      
      const startTime2 = Date.now();
      
      // Test with existing email
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });
      
      const existingTime = Date.now() - startTime2;
      
      // Response times should be similar (within 100ms)
      expect(Math.abs(nonExistentTime - existingTime)).toBeLessThan(100);
    });

    it('should clean up expired reset tokens', async () => {
      // Create expired reset token
      await User.findByIdAndUpdate(savedUser._id, {
        resetToken: 'expired-token',
        resetTokenExpires: new Date(Date.now() - 1000)
      });

      // Trigger cleanup
      await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          resetToken: 'expired-token',
          newPassword: 'NewPassword123!'
        });

      // Verify token is cleaned up
      const updatedUser = await User.findById(savedUser._id);
      expect(updatedUser.resetToken).toBeNull();
      expect(updatedUser.resetTokenExpires).toBeNull();
    });

    it('should limit reset attempts per user', async () => {
      // Create multiple reset tokens
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: testUser.email });
      }

      // Should be limited
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many reset attempts');
    });
  });
});