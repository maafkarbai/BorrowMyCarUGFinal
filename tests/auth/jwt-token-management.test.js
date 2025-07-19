const { describe, it, expect, beforeEach, vi } = require('vitest');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const app = require('../../index');

describe('JWT Token Management', () => {
  let testUser;
  let savedUser;
  let validToken;

  beforeEach(async () => {
    testUser = global.testHelpers.generateTestUser('renter');
    
    savedUser = await User.create({
      ...testUser,
      password: '$2a$10$hashedPassword',
      documents: {
        emiratesIdFront: 'test-url',
        emiratesIdBack: 'test-url'
      },
      isEmailVerified: true,
      accountStatus: 'approved'
    });

    validToken = jwt.sign(
      { userId: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  describe('POST /api/auth/login', () => {
    it('should generate JWT token on successful login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.user).toMatchObject({
        id: savedUser._id.toString(),
        email: testUser.email,
        role: 'renter'
      });

      // Verify token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(savedUser._id.toString());
      expect(decoded.role).toBe('renter');
    });

    it('should set secure HTTP-only cookie', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.headers['set-cookie']).toBeDefined();
      
      const cookieHeader = response.headers['set-cookie'][0];
      expect(cookieHeader).toContain('HttpOnly');
      expect(cookieHeader).toContain('Secure');
      expect(cookieHeader).toContain('SameSite=Strict');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid credentials');
      expect(response.body.token).toBeUndefined();
    });

    it('should reject login for unverified email', async () => {
      await User.findByIdAndUpdate(savedUser._id, { isEmailVerified: false });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Email not verified');
    });

    it('should reject login for suspended accounts', async () => {
      await User.findByIdAndUpdate(savedUser._id, { accountStatus: 'suspended' });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Account suspended');
    });

    it('should handle rate limiting for failed login attempts', async () => {
      const promises = [];
      
      // Attempt multiple failed logins
      for (let i = 0; i < 6; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: testUser.email,
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Last few attempts should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('JWT Token Validation', () => {
    it('should validate valid JWT token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe(savedUser._id.toString());
    });

    it('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: savedUser._id, role: savedUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('expired');
    });

    it('should reject malformed token', async () => {
      const malformedTokens = [
        'invalid.token.here',
        'Bearer invalid',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
        ''
      ];

      for (const token of malformedTokens) {
        const response = await request(app)
          .get('/api/auth/profile')
          .set('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(response.body.error).toContain('Invalid token');
      }
    });

    it('should reject token with invalid signature', async () => {
      const invalidToken = jwt.sign(
        { userId: savedUser._id, role: savedUser.role },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid token');
    });

    it('should reject token for deleted user', async () => {
      // Delete user but keep token
      await User.findByIdAndDelete(savedUser._id);

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('User not found');
    });

    it('should handle token without Bearer prefix', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', validToken);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid token format');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should refresh valid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.token).not.toBe(validToken);

      // Verify new token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(savedUser._id.toString());
    });

    it('should not refresh expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: savedUser._id, role: savedUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('expired');
    });

    it('should include updated user data in refreshed token', async () => {
      // Update user role
      await User.findByIdAndUpdate(savedUser._id, { role: 'owner' });

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.role).toBe('owner');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout and clear cookie', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Logged out successfully');
      
      // Check if cookie is cleared
      const cookieHeader = response.headers['set-cookie'];
      if (cookieHeader) {
        expect(cookieHeader[0]).toContain('Max-Age=0');
      }
    });

    it('should handle logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Logged out successfully');
    });
  });

  describe('Token Security Features', () => {
    it('should include user agent in token payload for security', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('User-Agent', 'Test Browser')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.userAgent).toBeDefined();
    });

    it('should reject token with mismatched user agent', async () => {
      const tokenWithUA = jwt.sign(
        { 
          userId: savedUser._id, 
          role: savedUser.role,
          userAgent: 'Original Browser'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${tokenWithUA}`)
        .set('User-Agent', 'Different Browser');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid session');
    });

    it('should handle concurrent token usage', async () => {
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${validToken}`)
        );
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should validate token payload structure', async () => {
      const tokenWithMissingFields = jwt.sign(
        { userId: savedUser._id }, // Missing role
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${tokenWithMissingFields}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid token payload');
    });
  });
});