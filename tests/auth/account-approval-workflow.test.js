const { describe, it, expect, beforeEach, vi } = require('vitest');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const app = require('../../index');

// Mock email service
vi.mock('../../utils/emailService', () => ({
  sendApprovalNotification: vi.fn().mockResolvedValue(true),
  sendRejectionNotification: vi.fn().mockResolvedValue(true),
  sendDocumentRequestNotification: vi.fn().mockResolvedValue(true)
}));

describe('Account Approval Workflow', () => {
  let adminUser, pendingUser, approvedUser, rejectedUser;
  let adminToken;

  beforeEach(async () => {
    // Create admin user
    adminUser = await User.create({
      ...global.testHelpers.generateTestUser('admin'),
      password: '$2a$10$hashedPassword',
      documents: { emiratesIdFront: 'url', emiratesIdBack: 'url' },
      isEmailVerified: true,
      accountStatus: 'approved'
    });

    adminToken = jwt.sign(
      { userId: adminUser._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create users in different states
    pendingUser = await User.create({
      ...global.testHelpers.generateTestUser('renter'),
      password: '$2a$10$hashedPassword',
      documents: { emiratesIdFront: 'url', emiratesIdBack: 'url' },
      isEmailVerified: true,
      accountStatus: 'pending_approval'
    });

    approvedUser = await User.create({
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

    rejectedUser = await User.create({
      ...global.testHelpers.generateTestUser('renter'),
      password: '$2a$10$hashedPassword',
      documents: { emiratesIdFront: 'url', emiratesIdBack: 'url' },
      isEmailVerified: true,
      accountStatus: 'rejected'
    });
  });

  describe('GET /api/admin/users/pending', () => {
    it('should return all pending users for admin', async () => {
      const response = await request(app)
        .get('/api/admin/users/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.users).toBeInstanceOf(Array);
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0]._id).toBe(pendingUser._id.toString());
      expect(response.body.users[0].accountStatus).toBe('pending_approval');
    });

    it('should not return pending users for non-admin', async () => {
      const userToken = jwt.sign(
        { userId: pendingUser._id, role: 'renter' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const response = await request(app)
        .get('/api/admin/users/pending')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Admin access required');
    });

    it('should include user documents and verification status', async () => {
      const response = await request(app)
        .get('/api/admin/users/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const user = response.body.users[0];
      expect(user.documents).toBeDefined();
      expect(user.isEmailVerified).toBe(true);
      expect(user.createdAt).toBeDefined();
    });

    it('should filter by role if specified', async () => {
      // Create pending owner
      const pendingOwner = await User.create({
        ...global.testHelpers.generateTestUser('owner'),
        password: '$2a$10$hashedPassword',
        documents: { 
          emiratesIdFront: 'url', 
          emiratesIdBack: 'url',
          drivingLicenseFront: 'url',
          drivingLicenseBack: 'url'
        },
        isEmailVerified: true,
        accountStatus: 'pending_approval'
      });

      const response = await request(app)
        .get('/api/admin/users/pending?role=owner')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].role).toBe('owner');
    });

    it('should paginate results', async () => {
      // Create multiple pending users
      for (let i = 0; i < 15; i++) {
        await User.create({
          ...global.testHelpers.generateTestUser('renter'),
          password: '$2a$10$hashedPassword',
          documents: { emiratesIdFront: 'url', emiratesIdBack: 'url' },
          isEmailVerified: true,
          accountStatus: 'pending_approval'
        });
      }

      const response = await request(app)
        .get('/api/admin/users/pending?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(10);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalUsers).toBe(16); // 15 + 1 original
    });
  });

  describe('PUT /api/admin/users/:id/approve', () => {
    it('should approve pending user', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${pendingUser._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ approvalNotes: 'All documents verified' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('approved');

      // Verify user is updated
      const updatedUser = await User.findById(pendingUser._id);
      expect(updatedUser.accountStatus).toBe('approved');
      expect(updatedUser.approvedAt).toBeInstanceOf(Date);
      expect(updatedUser.approvedBy).toBe(adminUser._id.toString());
      expect(updatedUser.approvalNotes).toBe('All documents verified');
    });

    it('should not approve already approved user', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${approvedUser._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already approved');
    });

    it('should not approve rejected user without reset', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${rejectedUser._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('rejected');
    });

    it('should create notification for approved user', async () => {
      await request(app)
        .put(`/api/admin/users/${pendingUser._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      const notification = await Notification.findOne({
        userId: pendingUser._id,
        type: 'account_approved'
      });

      expect(notification).toBeTruthy();
      expect(notification.message).toContain('approved');
    });

    it('should require admin role', async () => {
      const userToken = jwt.sign(
        { userId: pendingUser._id, role: 'renter' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const response = await request(app)
        .put(`/api/admin/users/${pendingUser._id}/approve`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should validate user exists', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/api/admin/users/${fakeUserId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('User not found');
    });
  });

  describe('PUT /api/admin/users/:id/reject', () => {
    it('should reject pending user with reason', async () => {
      const rejectionReason = 'Documents are not clear';
      
      const response = await request(app)
        .put(`/api/admin/users/${pendingUser._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rejectionReason });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('rejected');

      // Verify user is updated
      const updatedUser = await User.findById(pendingUser._id);
      expect(updatedUser.accountStatus).toBe('rejected');
      expect(updatedUser.rejectedAt).toBeInstanceOf(Date);
      expect(updatedUser.rejectedBy).toBe(adminUser._id.toString());
      expect(updatedUser.rejectionReason).toBe(rejectionReason);
    });

    it('should require rejection reason', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${pendingUser._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('rejection reason');
    });

    it('should not reject already approved user', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${approvedUser._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rejectionReason: 'Test reason' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already approved');
    });

    it('should create notification for rejected user', async () => {
      await request(app)
        .put(`/api/admin/users/${pendingUser._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rejectionReason: 'Documents unclear' });

      const notification = await Notification.findOne({
        userId: pendingUser._id,
        type: 'account_rejected'
      });

      expect(notification).toBeTruthy();
      expect(notification.message).toContain('rejected');
    });

    it('should allow re-submission after rejection', async () => {
      // First reject
      await request(app)
        .put(`/api/admin/users/${pendingUser._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rejectionReason: 'Documents unclear' });

      // Then reset status for re-submission
      await request(app)
        .put(`/api/admin/users/${pendingUser._id}/reset`)
        .set('Authorization', `Bearer ${adminToken}`);

      const updatedUser = await User.findById(pendingUser._id);
      expect(updatedUser.accountStatus).toBe('pending_approval');
    });
  });

  describe('POST /api/admin/users/:id/request-documents', () => {
    it('should request additional documents from user', async () => {
      const response = await request(app)
        .post(`/api/admin/users/${pendingUser._id}/request-documents`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          documents: ['passport', 'utility_bill'],
          message: 'Please provide additional documents for verification'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('document request sent');

      // Verify user status is updated
      const updatedUser = await User.findById(pendingUser._id);
      expect(updatedUser.accountStatus).toBe('documents_requested');
      expect(updatedUser.requestedDocuments).toContain('passport');
      expect(updatedUser.requestedDocuments).toContain('utility_bill');
    });

    it('should create notification for document request', async () => {
      await request(app)
        .post(`/api/admin/users/${pendingUser._id}/request-documents`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          documents: ['passport'],
          message: 'Please provide passport'
        });

      const notification = await Notification.findOne({
        userId: pendingUser._id,
        type: 'documents_requested'
      });

      expect(notification).toBeTruthy();
      expect(notification.message).toContain('additional documents');
    });

    it('should validate document types', async () => {
      const response = await request(app)
        .post(`/api/admin/users/${pendingUser._id}/request-documents`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          documents: ['invalid_document'],
          message: 'Please provide documents'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid document type');
    });
  });

  describe('GET /api/admin/users/:id/approval-history', () => {
    it('should return approval history for user', async () => {
      // Create some approval actions
      await request(app)
        .put(`/api/admin/users/${pendingUser._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ approvalNotes: 'Initial approval' });

      const response = await request(app)
        .get(`/api/admin/users/${pendingUser._id}/approval-history`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.history).toBeInstanceOf(Array);
      expect(response.body.history[0]).toMatchObject({
        action: 'approved',
        adminId: adminUser._id.toString(),
        notes: 'Initial approval',
        timestamp: expect.any(String)
      });
    });

    it('should show chronological order of actions', async () => {
      // Approve then reject
      await request(app)
        .put(`/api/admin/users/${pendingUser._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ approvalNotes: 'Approved' });

      await request(app)
        .put(`/api/admin/users/${pendingUser._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rejectionReason: 'Found issues' });

      const response = await request(app)
        .get(`/api/admin/users/${pendingUser._id}/approval-history`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.history).toHaveLength(2);
      expect(response.body.history[0].action).toBe('approved');
      expect(response.body.history[1].action).toBe('rejected');
    });
  });

  describe('Bulk Approval Operations', () => {
    it('should approve multiple users at once', async () => {
      const pendingUser2 = await User.create({
        ...global.testHelpers.generateTestUser('renter'),
        password: '$2a$10$hashedPassword',
        documents: { emiratesIdFront: 'url', emiratesIdBack: 'url' },
        isEmailVerified: true,
        accountStatus: 'pending_approval'
      });

      const response = await request(app)
        .put('/api/admin/users/bulk-approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userIds: [pendingUser._id, pendingUser2._id],
          approvalNotes: 'Bulk approval'
        });

      expect(response.status).toBe(200);
      expect(response.body.approvedCount).toBe(2);

      // Verify users are approved
      const users = await User.find({
        _id: { $in: [pendingUser._id, pendingUser2._id] }
      });
      users.forEach(user => {
        expect(user.accountStatus).toBe('approved');
      });
    });

    it('should handle partial bulk approval failures', async () => {
      const response = await request(app)
        .put('/api/admin/users/bulk-approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userIds: [pendingUser._id, approvedUser._id], // One already approved
          approvalNotes: 'Bulk approval'
        });

      expect(response.status).toBe(200);
      expect(response.body.approvedCount).toBe(1);
      expect(response.body.errors).toHaveLength(1);
    });
  });

  describe('Auto-approval Rules', () => {
    it('should auto-approve users meeting criteria', async () => {
      // Create user with high-quality documents
      const autoApproveUser = await User.create({
        ...global.testHelpers.generateTestUser('renter'),
        password: '$2a$10$hashedPassword',
        documents: { 
          emiratesIdFront: 'high-quality-url',
          emiratesIdBack: 'high-quality-url',
          qualityScore: 95
        },
        isEmailVerified: true,
        accountStatus: 'pending_approval',
        verificationScore: 95
      });

      // Trigger auto-approval check
      const response = await request(app)
        .post('/api/admin/auto-approve-check')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.autoApprovedCount).toBeGreaterThan(0);

      // Verify user is auto-approved
      const updatedUser = await User.findById(autoApproveUser._id);
      expect(updatedUser.accountStatus).toBe('approved');
      expect(updatedUser.autoApproved).toBe(true);
    });

    it('should not auto-approve suspicious users', async () => {
      const suspiciousUser = await User.create({
        ...global.testHelpers.generateTestUser('renter'),
        password: '$2a$10$hashedPassword',
        documents: { 
          emiratesIdFront: 'low-quality-url',
          emiratesIdBack: 'low-quality-url',
          qualityScore: 30
        },
        isEmailVerified: true,
        accountStatus: 'pending_approval',
        verificationScore: 30,
        riskFlags: ['suspicious_documents']
      });

      const response = await request(app)
        .post('/api/admin/auto-approve-check')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      // Verify user is not auto-approved
      const updatedUser = await User.findById(suspiciousUser._id);
      expect(updatedUser.accountStatus).toBe('pending_approval');
      expect(updatedUser.autoApproved).toBeFalsy();
    });
  });
});