// scripts/cleanupIndexes.js - Run this to clean up duplicate indexes
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const cleanupDuplicateIndexes = async () => {
  try {
    console.log("🧹 Starting index cleanup...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "borrowmycar",
    });
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    // Clean up User collection indexes
    console.log("\n📋 Cleaning User collection indexes...");
    try {
      const userIndexes = await db.collection("users").indexes();
      console.log(
        "Current User indexes:",
        userIndexes.map((i) => i.name)
      );

      // Drop all indexes except _id_
      await db.collection("users").dropIndexes();
      console.log("✅ Dropped all User indexes");

      // Recreate only necessary indexes
      await db.collection("users").createIndex({ email: 1 }, { unique: true });
      await db.collection("users").createIndex({ phone: 1 });
      await db.collection("users").createIndex({ isApproved: 1, role: 1 });
      await db.collection("users").createIndex({ role: 1 });
      await db.collection("users").createIndex({ deletedAt: 1 });

      console.log("✅ Recreated User indexes without duplicates");
    } catch (error) {
      console.log("⚠️  User collection might not exist yet:", error.message);
    }

    // Clean up Car collection indexes
    console.log("\n🚗 Cleaning Car collection indexes...");
    try {
      const carIndexes = await db.collection("cars").indexes();
      console.log(
        "Current Car indexes:",
        carIndexes.map((i) => i.name)
      );

      // Drop all indexes except _id_
      await db.collection("cars").dropIndexes();
      console.log("✅ Dropped all Car indexes");

      // Recreate only necessary indexes
      await db.collection("cars").createIndex({ city: 1, status: 1 });
      await db.collection("cars").createIndex({ price: 1 });
      await db.collection("cars").createIndex({ make: 1, model: 1 });
      await db
        .collection("cars")
        .createIndex({ availabilityFrom: 1, availabilityTo: 1 });
      await db.collection("cars").createIndex({ owner: 1 });
      await db.collection("cars").createIndex({ status: 1 });
      await db.collection("cars").createIndex({
        title: "text",
        description: "text",
        make: "text",
        model: "text",
      });

      console.log("✅ Recreated Car indexes without duplicates");
    } catch (error) {
      console.log("⚠️  Car collection might not exist yet:", error.message);
    }

    // Clean up Booking collection indexes
    console.log("\n📅 Cleaning Booking collection indexes...");
    try {
      const bookingIndexes = await db.collection("bookings").indexes();
      console.log(
        "Current Booking indexes:",
        bookingIndexes.map((i) => i.name)
      );

      // Drop all indexes except _id_
      await db.collection("bookings").dropIndexes();
      console.log("✅ Dropped all Booking indexes");

      // Recreate only necessary indexes
      await db.collection("bookings").createIndex({ renter: 1, status: 1 });
      await db.collection("bookings").createIndex({ car: 1, status: 1 });
      await db.collection("bookings").createIndex({ startDate: 1, endDate: 1 });
      await db.collection("bookings").createIndex({ status: 1, expiresAt: 1 });
      await db.collection("bookings").createIndex({ status: 1 });
      await db.collection("bookings").createIndex({ paymentStatus: 1 });
      await db.collection("bookings").createIndex({ createdAt: -1 });

      console.log("✅ Recreated Booking indexes without duplicates");
    } catch (error) {
      console.log("⚠️  Booking collection might not exist yet:", error.message);
    }

    console.log("\n🎉 Index cleanup completed successfully!");
    console.log("\n📋 Final index summary:");

    // Show final indexes
    try {
      const collections = ["users", "cars", "bookings"];
      for (const collName of collections) {
        try {
          const indexes = await db.collection(collName).indexes();
          console.log(
            `\n${collName}:`,
            indexes.map((i) => i.name)
          );
        } catch (err) {
          console.log(`\n${collName}: Collection doesn't exist yet`);
        }
      }
    } catch (error) {
      console.log("Could not show final summary:", error.message);
    }

    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error during index cleanup:", error);
    process.exit(1);
  }
};

// Run the cleanup
cleanupDuplicateIndexes()
  .then(() => {
    console.log("\n✅ Index cleanup script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
