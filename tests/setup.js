import { vi, beforeAll, afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Reset database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  vi.clearAllMocks();
});

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';
process.env.TWILIO_ACCOUNT_SID = 'AC_test_mock';
process.env.TWILIO_AUTH_TOKEN = 'test_auth_token';
process.env.TWILIO_PHONE_NUMBER = '+1234567890';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-api-key';
process.env.CLOUDINARY_API_SECRET = 'test-api-secret';
process.env.NODE_ENV = 'test';

// Global test utilities
global.testHelpers = {
  generateValidUAEPhone: () => {
    const prefixes = ['050', '052', '054', '055', '056', '058'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    return `+971${prefix.substring(1)}${suffix}`;
  },
  
  generateTestUser: (role = 'renter') => ({
    fullName: `Test ${role} ${Date.now()}`,
    email: `test.${role}.${Date.now()}@example.com`,
    password: 'Test123!@#',
    phoneNumber: global.testHelpers.generateValidUAEPhone(),
    role,
    emiratesId: 'TEST-ID-' + Date.now(),
    drivingLicense: role === 'owner' ? 'DL-' + Date.now() : undefined
  }),
  
  createAuthHeader: (token) => ({
    Authorization: `Bearer ${token}`
  })
};