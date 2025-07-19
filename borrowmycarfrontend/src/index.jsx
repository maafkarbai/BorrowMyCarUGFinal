import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import App from "./App.jsx";
import BrowseCars from "./BrowseCars.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import RoleSelection from "./RoleSelection.jsx";
import CarDetails from "./CarDetails.jsx";
import Checkout from "./pages/Checkout.jsx";
import BookingSuccess from "./pages/BookingSuccess.jsx";
import BookingConfirmed from "./BookingConfirmed.jsx";
import RegistrationSuccess from "./RegistrationSuccess.jsx";
import CarListingSuccess from "./CarListingSuccess.jsx";
import PaymentSuccess from "./PaymentSuccess.jsx";
import ListCar from "./ListCar.jsx";
import HowItWorks from "./HowItWorks.jsx";
import MyBookings from "./MyBookings.jsx";
import Settings from "./Settings.jsx";
import Profile from "./Profile.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import AdminLogin from "./AdminLogin.jsx";
import AdminLayout from "./AdminLayout.jsx";
import SellerDashboard from "./SellerDashboard.jsx";
import ListingManagement from "./ListingManagement.jsx";
import OrderManagement from "./OrderManagement.jsx";
import UserProfile from "./UserProfile.jsx";
import NotFound from "./NotFound.jsx";
import NotificationsPage from "./NotificationsPage.jsx";
import About from "./About.jsx";
import Story from "./Story.jsx";
import Contact from "./Contact.jsx";
import Help from "./Help.jsx";
import Terms from "./Terms.jsx";
import Privacy from "./Privacy.jsx";
import RentalAgreement from "./RentalAgreement.jsx";
import Insurance from "./Insurance.jsx";
import Refunds from "./Refunds.jsx";
import Cookies from "./Cookies.jsx";
import Sitemap from "./Sitemap.jsx";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AdminAuthProvider } from "./context/AdminAuthProvider.jsx";
import { PaymentProvider } from "./context/PaymentContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { HelmetProvider } from "react-helmet-async";
import "./global.css";
import "./i18n";

// Main Layout Component
const Layout = () => (
  <>
    <Navbar />
    <main className="min-h-screen">
      <Outlet />
    </main>
    <Footer />
  </>
);

// Auth Layout (no navbar/footer for login/signup)
const AuthLayout = () => (
  <main className="min-h-screen">
    <Outlet />
  </main>
);

// Optimized routes with React Router v7
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: "browse",
        element: <BrowseCars />,
      },
      {
        path: "how-it-works",
        element: <HowItWorks />,
      },
      {
        path: "cars/:id",
        element: <CarDetails />,
      },
      {
        path: "users/:userId",
        element: <UserProfile />,
      },
      {
        path: "checkout/:carId",
        element: (
          <ProtectedRoute requiredRole="renter" requireApproval={true}>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: "booking-success",
        element: (
          <ProtectedRoute>
            <BookingSuccess />
          </ProtectedRoute>
        ),
      },
      {
        path: "booking-confirmed",
        element: (
          <ProtectedRoute>
            <BookingConfirmed />
          </ProtectedRoute>
        ),
      },
      {
        path: "registration-success",
        element: <RegistrationSuccess />,
      },
      {
        path: "car-listing-success",
        element: (
          <ProtectedRoute requiredRole="owner">
            <CarListingSuccess />
          </ProtectedRoute>
        ),
      },
      {
        path: "payment-success",
        element: (
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "list-car",
        element: (
          <ProtectedRoute requiredRole="owner" requireApproval={true}>
            <ListCar />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-bookings",
        element: (
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: "seller/dashboard",
        element: (
          <ProtectedRoute requiredRole="owner" requireApproval={true}>
            <SellerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "seller/listings",
        element: (
          <ProtectedRoute requiredRole="owner" requireApproval={true}>
            <ListingManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "seller/orders",
        element: (
          <ProtectedRoute requiredRole="owner" requireApproval={true}>
            <OrderManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-cars",
        element: (
          <ProtectedRoute requiredRole="owner" requireApproval={true}>
            <ListingManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "support",
        element: <Help />,
      },
      {
        path: "notifications",
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
      // Company pages
      {
        path: "about",
        element: <About />,
      },
      {
        path: "story",
        element: <Story />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      // Support pages
      {
        path: "help",
        element: <Help />,
      },
      // Legal pages
      {
        path: "terms",
        element: <Terms />,
      },
      {
        path: "privacy",
        element: <Privacy />,
      },
      {
        path: "rental-agreement",
        element: <RentalAgreement />,
      },
      {
        path: "insurance",
        element: <Insurance />,
      },
      {
        path: "refunds",
        element: <Refunds />,
      },
      {
        path: "cookies",
        element: <Cookies />,
      },
      {
        path: "sitemap",
        element: <Sitemap />,
      },
    ],
  },
  {
    path: "/admin",
    children: [
      {
        index: true,
        element: <AdminLogin />,
      },
      {
        element: (
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        ),
        children: [
          {
            path: "dashboard",
            element: <AdminDashboard />,
          },
          {
            path: "users",
            element: <AdminDashboard />,
          },
          {
            path: "cars",
            element: <AdminDashboard />,
          },
          {
            path: "bookings",
            element: <AdminDashboard />,
          },
          {
            path: "reports",
            element: <AdminDashboard />,
          },
          {
            path: "settings",
            element: <AdminDashboard />,
          },
        ],
      },
    ],
  },
  // Clean authentication routes
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/auth",
    element: <RoleSelection />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  // 404 catch all
  {
    path: "*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <PaymentProvider>
            <NotificationProvider>
              <RouterProvider router={router} />
            </NotificationProvider>
          </PaymentProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>
);