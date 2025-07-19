# BorrowMyCar - Frontend

A modern React frontend for the BorrowMyCar platform - a comprehensive car rental application for the UAE market.

## 🚗 Features

### Core Functionality
- **User Authentication**: Registration, login, and profile management with JWT
- **Car Browsing**: Advanced filtering, searching, and map-based car discovery
- **Booking System**: Complete booking flow with availability checking and payment
- **Payment Integration**: Secure Stripe payment processing with real-time updates
- **Interactive Maps**: Mapbox integration for location-based features and routing
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Internationalization**: Arabic and English language support with RTL support

### User Features
- **Renters**: Browse cars, make bookings, manage rentals, and process payments
- **Owners**: List cars, manage availability, approve bookings, and track earnings
- **Profile Management**: UAE-specific profile features with document upload

### UAE-Specific Features
- UAE phone number formatting and validation
- Emirates ID and visa document handling
- Arabic language support with proper RTL layout
- Local currency formatting (AED)
- UAE-centric location services

## 🛠 Tech Stack

- **Framework**: React 19 with hooks and context
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: React Router v7 with file-based routing
- **Styling**: Tailwind CSS v4 with custom components
- **Maps**: Mapbox GL JS with React Map GL
- **Payments**: Stripe with React Stripe.js
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context API
- **Internationalization**: i18next with react-i18next
- **Testing**: Vitest with jsdom
- **Linting**: ESLint with React-specific rules

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or bun package manager
- Backend API running (see root README)

## 🚀 Quick Start

### 1. Installation

```bash
# Install dependencies
npm install
# or with bun
bun install
```

### 2. Environment Setup

Create a `.env` file in the `borrowmycarfrontend` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Mapbox Configuration
VITE_MAPBOX_ACCESS_TOKEN=pk.your-mapbox-access-token

# Environment
VITE_NODE_ENV=development
```

### 3. Development

```bash
# Start development server
npm run dev
# or with bun
bun dev

# The app will be available at http://localhost:5173
```

### 4. Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📚 Application Structure

### Component Architecture

```
src/
├── components/              # Reusable UI components
│   ├── ButtonAccent.jsx    # Styled button component
│   ├── CarCard.jsx         # Car display card
│   ├── PhoneInput.jsx      # UAE phone input with validation
│   ├── ProtectedRoute.jsx  # Authentication guard
│   ├── PaymentForm.jsx     # Stripe payment form
│   ├── PaymentModal.jsx    # Payment modal dialog
│   └── Mapbox/            # Map-related components
│       ├── BaseMap.jsx    # Base map component
│       └── CarLocationMap.jsx # Car location display
├── context/               # React Context providers
│   ├── AuthContext.jsx    # Authentication state
│   ├── AuthProvider.jsx   # Auth provider wrapper
│   ├── PaymentContext.jsx # Payment state management
│   └── StripeProvider.jsx # Stripe provider wrapper
├── hooks/                 # Custom React hooks
│   └── useLocationSearch.js # Location search functionality
├── pages/                 # Page components
│   ├── BookingSuccess.jsx # Booking confirmation
│   └── Checkout.jsx       # Payment checkout
├── assets/               # Static assets
│   └── services/         # Service utilities
└── tests/               # Test files
    ├── components/      # Component tests
    └── context/        # Context tests
```

### Page Components (Root Level)

- `App.jsx` - Main application component with routing
- `Login.jsx` / `Signup.jsx` - Authentication pages
- `BrowseCars.jsx` - Car browsing with filters
- `CarDetails.jsx` - Individual car details and booking
- `ListCar.jsx` - Car listing form for owners
- `MyBookings.jsx` - User's booking history
- `Profile.jsx` / `Settings.jsx` - User account management
- `HowItWorks.jsx` - Information page
- `NotFound.jsx` - 404 error page

## 🎨 Styling and UI

### Tailwind CSS Configuration

The app uses Tailwind CSS v4 with custom configurations:

- **Colors**: UAE-themed color palette with primary blues and accent colors
- **Typography**: Arabic and English font support
- **Components**: Reusable utility classes for buttons, cards, and forms
- **RTL Support**: Right-to-left layout support for Arabic content

### Responsive Design

- Mobile-first approach with breakpoints for tablet and desktop
- Touch-friendly interface elements
- Optimized map interactions for mobile devices

## 🌍 Internationalization (i18n)

### Language Support

The app supports Arabic and English with:

- Automatic language detection based on browser settings
- Manual language switching
- RTL (Right-to-Left) layout for Arabic
- Localized number and currency formatting

### Translation Files

```
src/i18n/locales/
├── en.json    # English translations
└── ar.json    # Arabic translations
```

### Usage Example

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <button onClick={() => i18n.changeLanguage('ar')}>
        العربية
      </button>
    </div>
  );
}
```

## 🗺 Maps Integration

### Mapbox Features

- **Interactive Maps**: Car locations, user location, and route planning
- **Geocoding**: Address search and coordinate conversion
- **Directions**: Route planning and navigation
- **Clustering**: Efficient display of multiple car markers

### Map Components

- `BaseMap.jsx` - Core map functionality
- `CarLocationMap.jsx` - Car-specific map features
- `LocationPicker.jsx` - Location selection interface
- `GeocodingSearch.jsx` - Address search functionality

## 💳 Payment Integration

### Stripe Implementation

- **Payment Elements**: Modern Stripe payment forms
- **Payment Intents**: Secure payment processing
- **Webhooks**: Real-time payment status updates
- **Error Handling**: Comprehensive payment error management

### Payment Flow

1. User selects booking dates and car
2. Payment intent created on backend
3. Stripe payment form rendered
4. Payment processed securely
5. Booking confirmed and user redirected

## 🔐 Authentication & Security

### JWT Implementation

- Token storage in localStorage with automatic refresh
- Protected routes with authentication guards
- Automatic logout on token expiration
- Secure API communication with interceptors

### Security Features

- Input validation and sanitization
- XSS protection through React's built-in escaping
- CSRF protection through SameSite cookies
- Secure communication over HTTPS in production

## 🧪 Testing

### Test Setup

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Testing Strategy

- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **Context Tests**: State management testing
- **Mock Services**: API and external service mocking

## 📱 Mobile Optimization

### PWA Features (Future Enhancement)

- Service worker for offline functionality
- App manifest for mobile installation
- Push notifications for booking updates
- Offline map caching

### Mobile-Specific Features

- Touch-optimized map controls
- Swipe gestures for image galleries
- Mobile-friendly form inputs
- Optimized image loading and caching

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI interface

## 📈 Performance Optimization

### Build Optimizations

- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and CSS optimization
- **Bundle Analysis**: Webpack bundle analyzer integration

### Runtime Performance

- **React.memo**: Component memoization for expensive renders
- **useMemo/useCallback**: Hook optimization for complex calculations
- **Lazy Loading**: Delayed loading of non-critical components
- **Image Optimization**: Progressive loading and WebP support

## 🔗 API Integration

### API Client Configuration

```javascript
// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Error Handling

- Global error handling with axios interceptors
- User-friendly error messages
- Network error detection and retry logic
- Graceful degradation for offline scenarios

## 🐛 Debugging

### Development Tools

- React Developer Tools for component inspection
- Redux DevTools for state management (if implemented)
- Mapbox debugging tools for map issues
- Network tab for API debugging

### Common Issues

- **CORS Errors**: Ensure backend CORS configuration includes frontend URL
- **Environment Variables**: Prefix all variables with `VITE_`
- **Map Loading Issues**: Verify Mapbox token and network connectivity
- **Payment Errors**: Check Stripe configuration and webhook endpoints

## 📦 Deployment

### Production Build

```bash
# Build the application
npm run build

# The built files will be in the `dist` directory
```

### Environment Variables for Production

```env
VITE_API_BASE_URL=https://your-production-api.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-live-stripe-key
VITE_MAPBOX_ACCESS_TOKEN=pk.your-production-mapbox-token
VITE_NODE_ENV=production
```

### Hosting Recommendations

- **Vercel**: Optimized for React applications with automatic deployments
- **Netlify**: Easy deployment with form handling and edge functions
- **AWS S3 + CloudFront**: Scalable static hosting with CDN
- **GitHub Pages**: Free hosting for open source projects

## 🔄 State Management

### Context Architecture

```javascript
// Authentication Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Auth methods and state management
  
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### State Management Patterns

- Context for global state (auth, theme, language)
- Local state for component-specific data
- Custom hooks for shared stateful logic
- State lifting for component communication

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions regarding the frontend:

- Check the browser console for error messages
- Verify environment variables are properly set
- Ensure the backend API is running and accessible
- Review the network tab for failed API requests

For backend-related issues, refer to the [Backend README](../README.md).