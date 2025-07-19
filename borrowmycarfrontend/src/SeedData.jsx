import mongoose from "mongoose";
import _bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import Car from "../models/Car.js";
import dotenv from "dotenv";

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(globalThis.process.env.MONGO_URI);

    // Clear existing data
    await User.deleteMany({});
    await Car.deleteMany({});

    // Create test users
    const testOwner = await User.create({
      name: "Ahmed Al-Mansouri",
      email: "ahmed@test.com",
      phone: "+971501234567",
      password: "password123",
      role: "owner",
      isApproved: true,
      preferredCity: "Dubai",
      drivingLicenseUrl: "https://via.placeholder.com/400x300",
    });

    const _testRenter = await User.create({
      name: "Sarah Johnson",
      email: "sarah@test.com",
      phone: "+971509876543",
      password: "password123",
      role: "renter",
      isApproved: true,
      preferredCity: "Dubai",
      drivingLicenseUrl: "https://via.placeholder.com/400x300",
    });

    // Create test cars
    await Car.create({
      owner: testOwner._id,
      title: "Toyota Camry 2023 - Luxury Sedan",
      description:
        "Premium Toyota Camry with leather seats, GPS navigation, and excellent fuel economy.",
      city: "Dubai",
      price: 180,
      availabilityFrom: new Date(),
      availabilityTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      make: "Toyota",
      model: "Camry",
      year: 2023,
      color: "Pearl White",
      plateNumber: "A12345",
      transmission: "Automatic",
      fuelType: "Petrol",
      mileage: 15000,
      seatingCapacity: 5,
      specifications: "GCC Specs",
      features: [
        "GPS Navigation",
        "Bluetooth",
        "Leather Seats",
        "Backup Camera",
      ],
      images: [
        "https://via.placeholder.com/800x600/2563eb/ffffff?text=Toyota+Camry+1",
        "https://via.placeholder.com/800x600/1d4ed8/ffffff?text=Toyota+Camry+2",
        "https://via.placeholder.com/800x600/1e40af/ffffff?text=Toyota+Camry+3",
      ],
      status: "active",
    });

    console.log("✅ Database seeded successfully");
    globalThis.process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    globalThis.process.exit(1);
  }
};

seedDatabase();
