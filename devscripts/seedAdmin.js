// scripts/seedAdmin.js - Create admin users quickly
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const createAdminUser = async () => {
  try {
    console.log("🔐 Creating admin user...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "BorrowMyCar",
    });
    console.log("✅ Connected to MongoDB");

    // Get admin details from command line args or use defaults
    const adminData = {
      name: process.argv[2] || "Super Admin",
      email: process.argv[3] || "admin@borrowmycar.ae",
      phone: process.argv[4] || "0501234567",
      password: process.argv[5] || "admin123",
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log(`⚠️ Admin user with email ${adminData.email} already exists`);

      // Ask if they want to update the existing user to admin
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        existingAdmin.isApproved = true;
        await existingAdmin.save();
        console.log(
          `✅ Updated existing user to admin role: ${adminData.email}`
        );
      } else {
        console.log(`✅ User is already an admin: ${adminData.email}`);
      }
    } else {
      // Create new admin user
      const admin = await User.create({
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        password: adminData.password,
        role: "admin",
        isApproved: true,
        preferredCity: "Dubai",
        drivingLicenseUrl:
          "https://via.placeholder.com/400x300?text=Admin+License",
        profileImage: "https://via.placeholder.com/150?text=Admin",
      });

      console.log(`✅ Admin user created successfully!`);
      console.log(`📧 Email: ${admin.email}`);
      console.log(`🔑 Password: ${adminData.password}`);
      console.log(`👤 Name: ${admin.name}`);
      console.log(`📱 Phone: ${admin.phone}`);
    }

    console.log("\n🎯 Admin Login Details:");
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log("\n🚀 You can now access admin endpoints at /api/admin/*");
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);

    if (error.code === 11000) {
      console.log("📝 Duplicate key error - user might already exist");
    }

    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

// Run the script
createAdminUser();
