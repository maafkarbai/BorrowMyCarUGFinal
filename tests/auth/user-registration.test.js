const { describe, it, expect, beforeEach, vi } = require('vitest');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const app = require('../../index');

// Mock cloudinary
vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn().mockResolvedValue({
        secure_url: 'https://cloudinary.com/test-document.jpg',
        public_id: 'test-document-id'
      })
    }
  }
}));

// Mock email service
vi.mock('../../utils/emailService', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(true),
  sendApprovalNotification: vi.fn().mockResolvedValue(true)
}));

describe('User Registration with Document Upload', () => {
  let testUser;

  beforeEach(() => {
    testUser = global.testHelpers.generateTestUser('renter');
  });

  describe('POST /api/auth/register', () => {
    it('should register a new renter successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .field('fullName', testUser.fullName)
        .field('email', testUser.email)
        .field('password', testUser.password)
        .field('phoneNumber', testUser.phoneNumber)
        .field('role', 'renter')
        .attach('emiratesIdFront', Buffer.from('fake-image'), 'emirates-front.jpg')
        .attach('emiratesIdBack', Buffer.from('fake-image'), 'emirates-back.jpg');

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        message: expect.stringContaining('registered successfully'),
        userId: expect.any(String)
      });

      // Verify user was created in database
      const savedUser = await User.findOne({ email: testUser.email });
      expect(savedUser).toBeTruthy();
      expect(savedUser.fullName).toBe(testUser.fullName);
      expect(savedUser.role).toBe('renter');
      expect(savedUser.isEmailVerified).toBe(false);
      expect(savedUser.accountStatus).toBe('pending_verification');
      expect(savedUser.documents.emiratesIdFront).toBeTruthy();
      expect(savedUser.documents.emiratesIdBack).toBeTruthy();
    });

    it('should register a new owner with driving license', async () => {
      const ownerData = global.testHelpers.generateTestUser('owner');
      
      const response = await request(app)
        .post('/api/auth/register')
        .field('fullName', ownerData.fullName)
        .field('email', ownerData.email)
        .field('password', ownerData.password)
        .field('phoneNumber', ownerData.phoneNumber)
        .field('role', 'owner')
        .attach('emiratesIdFront', Buffer.from('fake-image'), 'emirates-front.jpg')
        .attach('emiratesIdBack', Buffer.from('fake-image'), 'emirates-back.jpg')
        .attach('drivingLicenseFront', Buffer.from('fake-image'), 'license-front.jpg')
        .attach('drivingLicenseBack', Buffer.from('fake-image'), 'license-back.jpg');

      expect(response.status).toBe(201);
      
      const savedUser = await User.findOne({ email: ownerData.email });
      expect(savedUser.role).toBe('owner');
      expect(savedUser.documents.drivingLicenseFront).toBeTruthy();
      expect(savedUser.documents.drivingLicenseBack).toBeTruthy();
    });

    it('should reject registration without required documents', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .field('fullName', testUser.fullName)
        .field('email', testUser.email)
        .field('password', testUser.password)
        .field('phoneNumber', testUser.phoneNumber)
        .field('role', 'renter');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Emirates ID');
    });

    it('should reject duplicate email registration', async () => {
      // Create first user
      await User.create({
        ...testUser,
        password: await bcrypt.hash(testUser.password, 10),
        documents: {
          emiratesIdFront: 'test-url',
          emiratesIdBack: 'test-url'
        }
      });

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .field('fullName', 'Another User')
        .field('email', testUser.email)
        .field('password', 'DifferentPass123!')
        .field('phoneNumber', global.testHelpers.generateValidUAEPhone())
        .field('role', 'renter')
        .attach('emiratesIdFront', Buffer.from('fake-image'), 'emirates-front.jpg')
        .attach('emiratesIdBack', Buffer.from('fake-image'), 'emirates-back.jpg');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already registered');
    });

    it('should validate password requirements', async () => {
      const weakPasswords = ['short', '12345678', 'password', 'Password1'];
      
      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .field('fullName', testUser.fullName)
          .field('email', `unique${Date.now()}@example.com`)
          .field('password', password)
          .field('phoneNumber', testUser.phoneNumber)
          .field('role', 'renter')
          .attach('emiratesIdFront', Buffer.from('fake-image'), 'emirates-front.jpg')
          .attach('emiratesIdBack', Buffer.from('fake-image'), 'emirates-back.jpg');

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('password');
      }
    });

    it('should handle large file uploads', async () => {
      // Create a 6MB buffer (exceeding typical 5MB limit)
      const largeFile = Buffer.alloc(6 * 1024 * 1024);
      
      const response = await request(app)
        .post('/api/auth/register')
        .field('fullName', testUser.fullName)
        .field('email', testUser.email)
        .field('password', testUser.password)
        .field('phoneNumber', testUser.phoneNumber)
        .field('role', 'renter')
        .attach('emiratesIdFront', largeFile, 'large-file.jpg')
        .attach('emiratesIdBack', Buffer.from('fake-image'), 'emirates-back.jpg');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('File too large');
    });

    it('should validate file types', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .field('fullName', testUser.fullName)
        .field('email', testUser.email)
        .field('password', testUser.password)
        .field('phoneNumber', testUser.phoneNumber)
        .field('role', 'renter')
        .attach('emiratesIdFront', Buffer.from('fake-file'), 'document.txt')
        .attach('emiratesIdBack', Buffer.from('fake-image'), 'emirates-back.jpg');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid file type');
    });

    it('should sanitize user input', async () => {
      const maliciousInput = {
        fullName: '<script>alert("XSS")</script>',
        email: 'test@example.com<script>',
        phoneNumber: testUser.phoneNumber
      };

      const response = await request(app)
        .post('/api/auth/register')
        .field('fullName', maliciousInput.fullName)
        .field('email', maliciousInput.email)
        .field('password', testUser.password)
        .field('phoneNumber', maliciousInput.phoneNumber)
        .field('role', 'renter')
        .attach('emiratesIdFront', Buffer.from('fake-image'), 'emirates-front.jpg')
        .attach('emiratesIdBack', Buffer.from('fake-image'), 'emirates-back.jpg');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid');
    });

    it('should handle concurrent registrations', async () => {
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        const userData = global.testHelpers.generateTestUser('renter');
        promises.push(
          request(app)
            .post('/api/auth/register')
            .field('fullName', userData.fullName)
            .field('email', userData.email)
            .field('password', userData.password)
            .field('phoneNumber', userData.phoneNumber)
            .field('role', 'renter')
            .attach('emiratesIdFront', Buffer.from('fake-image'), 'emirates-front.jpg')
            .attach('emiratesIdBack', Buffer.from('fake-image'), 'emirates-back.jpg')
        );
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Verify all users were created
      const userCount = await User.countDocuments();
      expect(userCount).toBeGreaterThanOrEqual(5);
    });
  });
});