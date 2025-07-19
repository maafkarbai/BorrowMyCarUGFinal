# BorrowMyCar - Backend API

A comprehensive car rental platform backend for the UAE market, built with Node.js, Express, and MongoDB.

## 🚗 Features

### Core Functionality
- **User Management**: Registration, authentication, and profile management with UAE-specific validation
- **Car Listings**: Full CRUD operations for car listings with image uploads
- **Booking System**: Complete booking lifecycle with availability checking and payment integration
- **Payment Processing**: Stripe integration for secure payments and refunds
- **Geolocation**: Mapbox integration for location-based car searching and routing
- **File Uploads**: Cloudinary integration for car images and profile pictures
- **Internationalization**: Arabic and English language support

### User Roles
- **Renters**: Browse and book cars
- **Owners**: List and manage their vehicles
- **Admins**: Verify users and moderate content

### UAE-Specific Features
- Emirates ID and visa document verification
- UAE phone number validation and formatting
- Local driving license validation
- International driving license support for tourists

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **File Storage**: Cloudinary
- **Payments**: Stripe
- **Maps**: Mapbox GL JS
- **SMS**: Twilio (configured)
- **Testing**: Jest with Supertest
- **Validation**: Express-validator with custom UAE validators

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Stripe account
- Mapbox account

## 🚀 Quick Start

### 1. Installation

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm run setup
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=mongodb://localhost:27017/borrowmycar
# or for MongoDB Atlas:
# DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/borrowmycar

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=90d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Mapbox
MAPBOX_ACCESS_TOKEN=pk.your-mapbox-token

# Twilio (optional)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone

# Environment
NODE_ENV=development
PORT=5000
```

### 3. Database Setup

```bash
# Clean up any existing indexes
npm run cleanup:indexes

# Seed the database with test data
npm run seed
```

### 4. Development

```bash
# Start backend only
npm run dev

# Start both backend and frontend
npm run dev:both

# Fresh start (cleanup, seed, and start both servers)
npm run fresh:start
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PATCH /api/auth/updateProfile` - Update user profile

### Car Management
- `GET /api/cars` - List all cars with filtering
- `GET /api/cars/:id` - Get specific car details
- `POST /api/cars` - Create new car listing (owner only)
- `PATCH /api/cars/:id` - Update car listing (owner only)
- `DELETE /api/cars/:id` - Delete car listing (owner only)

### Booking System
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/bookings/:id/status` - Update booking status (owner only)

### Payment Processing
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook handler
- `POST /api/payments/refund` - Process refund

## 🗂 Project Structure

```
├── config/                 # Configuration files
│   ├── db.js              # Database connection
│   ├── mapbox.js          # Mapbox configuration
│   └── stripe.js          # Stripe configuration
├── controllers/           # Business logic
│   ├── authController.js  # Authentication
│   ├── bookingController.js # Booking management
│   ├── carController.js   # Car management
│   └── paymentController.js # Payment processing
├── middlewares/           # Custom middleware
│   ├── authMiddleware.js  # JWT authentication
│   └── multer.js          # File upload handling
├── models/               # Database schemas
│   ├── Booking.js        # Booking model
│   ├── Car.js           # Car model
│   └── User.js          # User model
├── routes/              # API routes
│   ├── authRoutes.js    # Authentication routes
│   ├── bookingRoutes.js # Booking routes
│   ├── carRoutes.js     # Car routes
│   └── paymentRoutes.js # Payment routes
├── scripts/             # Utility scripts
│   ├── cleanupIndexes.js # Database cleanup
│   └── seedData.js      # Data seeding
├── tests/               # Test files
│   ├── controllers/     # Controller tests
│   ├── integration/     # Integration tests
│   └── utils/          # Utility tests
├── utils/               # Helper utilities
│   ├── BookingValidation.js # Booking validation
│   ├── cloudUploader.js # File upload utilities
│   ├── errorHandler.js  # Error handling
│   ├── mapboxUtils.js   # Mapbox utilities
│   ├── phoneUtils.js    # UAE phone validation
│   └── validators.js    # Input validation
└── index.js            # Application entry point
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testPathPattern=authController
```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run dev:both` - Start both backend and frontend
- `npm run seed` - Seed database with test data
- `npm run setup` - Install all dependencies (backend + frontend)
- `npm run build` - Build frontend for production
- `npm run test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run cleanup:indexes` - Clean up MongoDB indexes
- `npm run fresh:start` - Full reset and start

## 🌍 Internationalization

The backend supports Arabic and English languages:
- Automatic language detection from request headers
- Localized error messages and responses
- UAE-specific content and validation messages

## 🔐 Security Features

- JWT-based authentication with secure token handling
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration for production
- Secure file upload handling
- Environment variable protection

## 📱 UAE-Specific Features

### Phone Number Validation
```javascript
// Example usage
import { validateUAEPhone, formatUAEPhone } from './utils/phoneUtils.js';

const phone = '+971501234567';
const isValid = validateUAEPhone(phone); // true
const formatted = formatUAEPhone(phone); // '+971 50 123 4567'
```

### Document Verification
- Emirates ID validation
- Visa document verification
- UAE and international driving license validation

## 📈 Performance Considerations

- Database indexing for optimized queries
- Image optimization through Cloudinary
- Pagination for large data sets
- Efficient booking conflict detection
- Caching strategies for frequent queries

## 🚨 Error Handling

The API uses a consistent error response format:

```json
{
  "status": "error",
  "error": {
    "statusCode": 400,
    "status": "fail",
    "isOperational": true,
    "message": "Validation error message"
  }
}
```

## 🔗 Related Projects

- [Frontend Repository](./borrowmycarfrontend/) - React frontend application

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.