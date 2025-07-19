// config/db.js (Enhanced)
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Enhanced MongoDB connection with better error handling and options
export const connectDB = async () => {
  try {
    // Connection options for better performance and reliability
    const options = {
      dbName: "BorrowMyCar", // Specify the database name
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      // Removed deprecated options: bufferMaxEntries, bufferCommands
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("📴 MongoDB connection closed through app termination");
        process.exit(0);
      } catch (error) {
        console.error("❌ Error during MongoDB disconnection:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("⚠️ Database will not be available");

    // Don't exit process, just continue without database
    throw error;
  }
};

// Health check function
export const checkDBHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    return {
      status: states[state],
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      port: mongoose.connection.port,
    };
  } catch (error) {
    return {
      status: "error",
      error: error.message,
    };
  }
};
