// scripts/seedData.js - FIXED with valid enum features
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";
import dotenv from "dotenv";

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "BorrowMyCar",
    });
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Car.deleteMany({});
    await Booking.deleteMany({});
    console.log("🧹 Cleared existing data");

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@borrowmycar.ae",
      phone: "0501234567", // UAE local format
      password: "admin123",
      role: "admin",
      isApproved: true,
      preferredCity: "Dubai",
      drivingLicenseUrl:
        "https://via.placeholder.com/400x300?text=Admin+License",
    });

    // Create test car owners
    const owner1 = await User.create({
      name: "Ahmed Al-Mansouri",
      email: "ahmed@test.com",
      phone: "0502345678", // UAE local format
      password: "password123",
      role: "owner",
      isApproved: true,
      preferredCity: "Dubai",
      drivingLicenseUrl:
        "https://via.placeholder.com/400x300?text=Ahmed+License",
    });

    const owner2 = await User.create({
      name: "Fatima Al-Zahra",
      email: "fatima@test.com",
      phone: "0503456789", // UAE local format
      password: "password123",
      role: "owner",
      isApproved: true,
      preferredCity: "Abu Dhabi",
      drivingLicenseUrl:
        "https://via.placeholder.com/400x300?text=Fatima+License",
    });

    // Create test renters
    const renter1 = await User.create({
      name: "Sarah Johnson",
      email: "sarah@test.com",
      phone: "0504567890", // UAE local format
      password: "password123",
      role: "renter",
      isApproved: true,
      preferredCity: "Dubai",
      drivingLicenseUrl:
        "https://via.placeholder.com/400x300?text=Sarah+License",
    });

    const renter2 = await User.create({
      name: "Michael Chen",
      email: "michael@test.com",
      phone: "0505678901", // UAE local format
      password: "password123",
      role: "renter",
      isApproved: true,
      preferredCity: "Sharjah",
      drivingLicenseUrl:
        "https://via.placeholder.com/400x300?text=Michael+License",
    });

    console.log("👥 Created test users");

    // Valid features from Car model enum
    const validFeatures = [
      "GPS Navigation",
      "Bluetooth",
      "USB Charging",
      "Wireless Charging",
      "Sunroof",
      "Leather Seats",
      "Heated Seats",
      "Cooled Seats",
      "Backup Camera",
      "Parking Sensors",
      "Cruise Control",
      "Keyless Entry",
      "Push Start",
      "Auto AC",
      "Dual Zone AC",
      "Premium Sound System",
    ];

    // Create test cars with ONLY valid features
    const cars = [];

    // Ahmed's cars
    const car1 = await Car.create({
      owner: owner1._id,
      title: "Toyota Camry 2023 - Luxury Sedan",
      description:
        "Premium Toyota Camry with leather seats, GPS navigation, and excellent fuel economy. Perfect for business trips or family outings.",
      city: "Dubai",
      price: 180, // Using 'price' field consistently
      availabilityFrom: new Date(),
      availabilityTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
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
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1494976888653-603eb4928b84?w=800&h=600&fit=crop",
      ],
      status: "active",
    });

    const car2 = await Car.create({
      owner: owner1._id,
      title: "BMW X3 2024 - Premium SUV",
      description:
        "Luxury SUV with premium sound system and spacious interior. Ideal for family adventures.",
      city: "Dubai",
      price: 320,
      availabilityFrom: new Date(),
      availabilityTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      make: "BMW",
      model: "X3",
      year: 2024,
      color: "Space Gray",
      plateNumber: "B67890",
      transmission: "Automatic",
      fuelType: "Petrol",
      mileage: 8000,
      seatingCapacity: 5,
      specifications: "GCC Specs",
      features: [
        "GPS Navigation",
        "Sunroof",
        "Leather Seats",
        "Premium Sound System",
      ],
      images: [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop",
      ],
      status: "active",
    });

    // Fatima's cars
    const car3 = await Car.create({
      owner: owner2._id,
      title: "Honda Civic 2023 - Compact Sedan",
      description:
        "Fuel-efficient and reliable Honda Civic, perfect for city driving and daily commutes.",
      city: "Abu Dhabi",
      price: 150,
      availabilityFrom: new Date(),
      availabilityTo: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
      make: "Honda",
      model: "Civic",
      year: 2023,
      color: "Midnight Blue",
      plateNumber: "C11111",
      transmission: "Automatic",
      fuelType: "Petrol",
      mileage: 12000,
      seatingCapacity: 5,
      specifications: "GCC Specs",
      features: [
        "Bluetooth",
        "USB Charging",
        "Backup Camera",
        "Cruise Control",
      ],
      images: [
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
      ],
      status: "active",
    });

    const car4 = await Car.create({
      owner: owner2._id,
      title: "Mercedes C-Class 2024 - Executive Sedan",
      description:
        "Elegant Mercedes C-Class with premium interior, advanced safety features, and smooth performance.",
      city: "Abu Dhabi",
      price: 280,
      availabilityFrom: new Date(),
      availabilityTo: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days
      make: "Mercedes-Benz",
      model: "C-Class",
      year: 2024,
      color: "Obsidian Black",
      plateNumber: "D22222",
      transmission: "Automatic",
      fuelType: "Petrol",
      mileage: 5000,
      seatingCapacity: 5,
      specifications: "GCC Specs",
      features: [
        "GPS Navigation",
        "Leather Seats",
        "Heated Seats",
        "Premium Sound System",
      ],
      images: [
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1606114737970-346c60ef1069?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1563694983011-6f4d90358083?w=800&h=600&fit=crop",
      ],
      status: "active",
    });

    // Add more diverse cars for better testing
    const car5 = await Car.create({
      owner: owner1._id,
      title: "Nissan Patrol 2023 - Family SUV",
      description:
        "Spacious family SUV perfect for desert trips and large groups. Comes with advanced safety features.",
      city: "Dubai",
      price: 250,
      availabilityFrom: new Date(),
      availabilityTo: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
      make: "Nissan",
      model: "Patrol",
      year: 2023,
      color: "Arctic White",
      plateNumber: "E33333",
      transmission: "Automatic",
      fuelType: "Petrol",
      mileage: 25000,
      seatingCapacity: 8,
      specifications: "GCC Specs",
      features: [
        "GPS Navigation",
        "Premium Sound System",
        "Parking Sensors",
        "Auto AC",
        "Keyless Entry",
      ],
      images: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&h=600&fit=crop",
      ],
      status: "active",
    });

    const car6 = await Car.create({
      owner: owner2._id,
      title: "Hyundai Elantra 2022 - Economy Sedan",
      description:
        "Affordable and fuel-efficient sedan, perfect for daily commuting and city driving.",
      city: "Sharjah",
      price: 120,
      availabilityFrom: new Date(),
      availabilityTo: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000), // 100 days
      make: "Hyundai",
      model: "Elantra",
      year: 2022,
      color: "Silver",
      plateNumber: "F44444",
      transmission: "Automatic",
      fuelType: "Petrol",
      mileage: 35000,
      seatingCapacity: 5,
      specifications: "GCC Specs",
      features: ["Bluetooth", "USB Charging", "Auto AC", "Cruise Control"],
      images: [
        "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1494976888653-603eb4928b84?w=800&h=600&fit=crop",
      ],
      status: "active",
    });

    cars.push(car1, car2, car3, car4, car5, car6);
    console.log("🚗 Created test cars");

    // Create some test bookings
    const booking1 = await Booking.create({
      renter: renter1._id,
      car: car1._id,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      totalDays: 3,
      dailyRate: 180,
      totalAmount: 540,
      totalPayable: 540,
      paymentMethod: "Card",
      pickupLocation: "Dubai Mall",
      returnLocation: "Dubai Mall",
      status: "pending",
    });

    const booking2 = await Booking.create({
      renter: renter2._id,
      car: car3._id,
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000), // 17 days from now
      totalDays: 3,
      dailyRate: 150,
      totalAmount: 450,
      totalPayable: 450,
      paymentMethod: "Cash",
      pickupLocation: "Abu Dhabi Airport",
      returnLocation: "Abu Dhabi Airport",
      status: "approved",
    });

    const booking3 = await Booking.create({
      renter: renter1._id,
      car: car5._id,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      totalDays: 3,
      dailyRate: 250,
      totalAmount: 750,
      totalPayable: 750,
      paymentMethod: "Card",
      pickupLocation: "Dubai Marina",
      returnLocation: "Dubai Marina",
      status: "completed",
    });

    console.log("📅 Created test bookings");

    console.log("\n✅ Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`👥 Users: 5 (1 admin, 2 owners, 2 renters)`);
    console.log(`🚗 Cars: ${cars.length}`);
    console.log(`📅 Bookings: 3`);

    console.log("\n🔑 Test Accounts:");
    console.log("Admin: admin@borrowmycar.ae / admin123");
    console.log("Owner 1: ahmed@test.com / password123 (Phone: 0502345678)");
    console.log("Owner 2: fatima@test.com / password123 (Phone: 0503456789)");
    console.log("Renter 1: sarah@test.com / password123 (Phone: 0504567890)");
    console.log("Renter 2: michael@test.com / password123 (Phone: 0505678901)");

    console.log("\n📱 Phone Format Examples:");
    console.log("✓ Local format: 0501234567 (recommended)");
    console.log("✓ With country code: +971501234567");
    console.log("✓ International: 00971501234567");

    console.log("\n🚗 Valid Car Features:");
    console.log("✓ GPS Navigation, Bluetooth, USB Charging");
    console.log("✓ Leather Seats, Sunroof, Backup Camera");
    console.log("✓ Premium Sound System, Cruise Control");
    console.log("✓ Keyless Entry, Push Start, Auto AC");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();
