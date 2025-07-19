// index.js - Fixed main server file
import dotenv from "dotenv";
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY', 
  'CLOUDINARY_API_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => console.error(`  - ${varName}`));
  console.error('Please check your .env file and add the missing variables.');
  process.exit(1);
}

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB, checkDBHealth } from "./config/db.js";
import { globalErrorHandler } from "./utils/errorHandler.js";
import { generalLimiter } from "./utils/validators.js";
import { checkCloudinaryHealth } from "./utils/cloudinary.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import carRoutes from "./routes/carRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

// Connect to database
const initializeDatabase = async () => {
  try {
    console.log("🔄 Attempting database connection...");
    await connectDB();
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    console.log("⚠️ Continuing without database - some features may not work");
  }
};

// Initialize database connection
initializeDatabase();

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173", // Vite default
      "http://localhost:5174",
      "http://localhost:5175",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:5175",
    ];
    
    // Add production domains
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }
    if (process.env.PRODUCTION_URL) {
      allowedOrigins.push(process.env.PRODUCTION_URL);
    }
    
    // Allow Vercel preview deployments
    if (origin && (origin.includes('.vercel.app') || origin.includes('.vercel.sh'))) {
      callback(null, true);
    } else if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Origin",
    "X-Requested-With",
    "Accept",
    "stripe-signature", // For Stripe webhooks
  ],
};

// Middlewares
app.use(cors(corsOptions));

// Stripe webhook needs raw body
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Regular JSON parsing for other routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Rate limiting
app.use(generalLimiter);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const [dbHealth, cloudinaryHealth] = await Promise.all([
      checkDBHealth(),
      checkCloudinaryHealth(),
    ]);

    res.json({
      success: true,
      message: "BorrowMyCar API is running",
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        cloudinary: cloudinaryHealth,
        server: {
          status: "running",
          environment: process.env.NODE_ENV || "development",
          version: "1.0.0",
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message,
    });
  }
});

// API info endpoint
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to BorrowMyCar API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      cars: "/api/cars",
      bookings: "/api/bookings",
      payments: "/api/payments",
      health: "/api/health",
    },
    documentation: "https://api.borrowmycar.ae/docs",
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    code: "ROUTE_NOT_FOUND",
  });
});

// Global error handler
app.use(globalErrorHandler);

// Start server with automatic port selection
const PORT = parseInt(process.env.PORT) || 5000;

const startServer = (port) => {
  const numPort = parseInt(port);

  // Validate port range
  if (numPort < 1 || numPort > 65535) {
    console.error(`❌ Invalid port: ${numPort}. Using default port 5000.`);
    return startServer(5000);
  }

  const server = app.listen(numPort, () => {
    console.log(`🚀 Server running on port ${numPort}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`📝 API Info: http://localhost:${numPort}/api`);
    console.log(`💚 Health Check: http://localhost:${numPort}/api/health`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      const nextPort = numPort + 1;
      if (nextPort > 65535) {
        console.error("❌ No available ports found. Exiting.");
        process.exit(1);
      }
      console.log(
        `⚠️  Port ${numPort} is already in use, trying port ${nextPort}...`
      );
      startServer(nextPort);
    } else {
      console.error("❌ Server error:", err);
      process.exit(1);
    }
  });

  return server;
};

const server = startServer(PORT);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down...");
  server.close(() => {
    console.log("💥 Server closed.");
  });
});

process.on("unhandledRejection", (err) => {
  console.error("💥 UNHANDLED PROMISE REJECTION!");
  console.error(err);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION!");
  console.error(err);
  process.exit(1);
});

export default app;
