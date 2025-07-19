const { describe, it, expect, beforeEach, vi } = require('vitest');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const app = require('../../index');

describe('Role Based Access Control', () => {
  let renterUser, ownerUser, adminUser;
  let renterToken, ownerToken, adminToken;

  beforeEach(async () => {
    // Create users with different roles
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

    adminUser = await User.create({
      ...global.testHelpers.generateTestUser('admin'),
      password: '$2a$10$hashedPassword',
      documents: { emiratesIdFront: 'url', emiratesIdBack: 'url' },
      isEmailVerified: true,
      accountStatus: 'approved'
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

    adminToken = jwt.sign(
      { userId: adminUser._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  describe('Renter Role Access', () => {
    it('should allow renter to access renter-only endpoints', async () => {
      const response = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${renterToken}`);

      expect(response.status).toBe(200);
    });

    it('should allow renter to create bookings', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          carId: 'test-car-id',
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 48 * 60 * 60 * 1000)
        });

      expect(response.status).not.toBe(403);
    });

    it('should deny renter access to owner-only endpoints', async () => {
      const response = await request(app)
        .get('/api/cars/my-cars')
        .set('Authorization', `Bearer ${renterToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Insufficient permissions');
    });

    it('should deny renter access to admin endpoints', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${renterToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Admin access required');
    });

    it('should allow renter to update their own profile', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          fullName: 'Updated Name'
        });

      expect(response.status).toBe(200);
    });

    it('should deny renter from updating other users', async () => {
      const response = await request(app)
        .put(`/api/users/${ownerUser._id}`)
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          fullName: 'Hacked Name'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Owner Role Access', () => {
    it('should allow owner to access owner-only endpoints', async () => {
      const response = await request(app)
        .get('/api/cars/my-cars')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
    });

    it('should allow owner to create car listings', async () => {
      const response = await request(app)
        .post('/api/cars')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          make: 'Toyota',
          model: 'Camry',
          year: 2022,
          pricePerDay: 150
        });

      expect(response.status).not.toBe(403);
    });

    it('should allow owner to access renter endpoints', async () => {
      const response = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
    });

    it('should deny owner access to admin endpoints', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Admin access required');
    });

    it('should allow owner to manage their own bookings', async () => {
      const response = await request(app)
        .get('/api/bookings/owner-bookings')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
    });

    it('should deny owner from accessing other owners\' cars', async () => {
      const anotherOwner = await User.create({
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

      const response = await request(app)
        .get(`/api/cars/owner/${anotherOwner._id}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Admin Role Access', () => {
    it('should allow admin to access all endpoints', async () => {
      const endpoints = [
        '/api/admin/users',
        '/api/admin/bookings',
        '/api/admin/cars',
        '/api/admin/analytics'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).not.toBe(403);
      }
    });

    it('should allow admin to approve/reject users', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${renterUser._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should allow admin to suspend users', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${renterUser._id}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Violation of terms' });

      expect(response.status).toBe(200);
    });

    it('should allow admin to access system metrics', async () => {
      const response = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should allow admin to manage all bookings', async () => {
      const response = await request(app)
        .get('/api/admin/bookings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should allow admin to delete inappropriate content', async () => {
      const response = await request(app)
        .delete(`/api/admin/cars/inappropriate-car-id`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).not.toBe(403);
    });
  });

  describe('Role Validation', () => {
    it('should reject requests without authentication', async () => {
      const response = await request(app)
        .get('/api/bookings/my-bookings');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Authentication required');
    });

    it('should reject requests with invalid roles', async () => {
      const invalidRoleToken = jwt.sign(
        { userId: renterUser._id, role: 'invalid_role' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const response = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${invalidRoleToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Invalid role');
    });

    it('should update access when user role changes', async () => {
      // User initially has renter role
      let response = await request(app)
        .get('/api/cars/my-cars')
        .set('Authorization', `Bearer ${renterToken}`);

      expect(response.status).toBe(403);

      // Update user to owner role
      await User.findByIdAndUpdate(renterUser._id, { role: 'owner' });

      // Generate new token with updated role
      const newToken = jwt.sign(
        { userId: renterUser._id, role: 'owner' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      response = await request(app)
        .get('/api/cars/my-cars')
        .set('Authorization', `Bearer ${newToken}`);

      expect(response.status).toBe(200);
    });

    it('should handle multiple role checks', async () => {
      // Endpoint that requires either owner or admin role
      const response = await request(app)
        .get('/api/analytics/earnings')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);

      const adminResponse = await request(app)
        .get('/api/analytics/earnings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);

      const renterResponse = await request(app)
        .get('/api/analytics/earnings')
        .set('Authorization', `Bearer ${renterToken}`);

      expect(renterResponse.status).toBe(403);
    });
  });

  describe('Resource Access Control', () => {
    it('should allow users to access only their own resources', async () => {
      // Renter should only see their own bookings
      const response = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${renterToken}`);

      expect(response.status).toBe(200);
      if (response.body.bookings) {
        response.body.bookings.forEach(booking => {
          expect(booking.renterId).toBe(renterUser._id.toString());
        });
      }
    });

    it('should prevent cross-user data access', async () => {
      // Try to access another user's profile
      const response = await request(app)
        .get(`/api/users/${ownerUser._id}/profile`)
        .set('Authorization', `Bearer ${renterToken}`);

      expect(response.status).toBe(403);
    });

    it('should allow admins to access all resources', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${renterUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Role Hierarchy', () => {
    it('should respect role hierarchy (admin > owner > renter)', async () => {
      const protectedEndpoint = '/api/restricted/hierarchy-test';
      
      // Admin should have highest access
      const adminResponse = await request(app)
        .get(protectedEndpoint)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminResponse.status).not.toBe(403);

      // Owner should have medium access
      const ownerResponse = await request(app)
        .get(protectedEndpoint)
        .set('Authorization', `Bearer ${ownerToken}`);

      // Renter should have lowest access
      const renterResponse = await request(app)
        .get(protectedEndpoint)
        .set('Authorization', `Bearer ${renterToken}`);

      expect(renterResponse.status).toBe(403);
    });

    it('should handle role inheritance correctly', async () => {
      // Owner should be able to do everything a renter can do
      const renterEndpoint = '/api/bookings/my-bookings';
      
      const ownerResponse = await request(app)
        .get(renterEndpoint)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(ownerResponse.status).toBe(200);
    });
  });
});