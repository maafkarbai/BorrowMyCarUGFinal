// models/Car.js - FIXED to remove duplicate indexes
import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Car title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Car description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      enum: {
        values: [
          "Dubai",
          "Abu Dhabi",
          "Sharjah",
          "Ajman",
          "Fujairah",
          "Ras Al Khaimah",
          "Umm Al Quwain",
          "Dubai Marina",
          "Downtown Dubai",
          "Jumeirah Lake Towers",
          "Business Bay",
          "Jumeirah",
          "Deira",
          "Bur Dubai",
          "Palm Jumeirah",
          "Dubai Sports City",
          "Dubai Silicon Oasis",
          "Dubai International City",
          "Al Qusais",
          "Al Nahda Dubai",
          "Dubai Investment Park",
          "Jumeirah Village Circle",
          "Dubai Media City",
          "Dubai Internet City",
          "Dubai Healthcare City",
          "Dubai Academic City",
          "Dubai Festival City",
          "Dubai Hills Estate",
          "Dubai Creek Harbour",
          "Al Barsha",
          "Al Karama",
          "Al Satwa",
          "Al Wasl",
          "Al Mizhar",
          "Muhaisnah",
          "Al Warqa",
          "Nad Al Hamar",
          "Oud Metha",
          "Al Jaddaf",
          "Dubai World Central",
          "Motor City",
          "Arabian Ranches",
          "The Springs",
          "The Meadows",
          "Emirates Hills",
          "The Lakes",
          "The Greens",
          "Discovery Gardens",
          "Ibn Battuta",
          "Dubai Production City",
          "Dubai Studio City",
          "Khalifa City",
          "Al Reem Island",
          "Saadiyat Island",
          "Yas Island",
          "Al Maryah Island",
          "Al Raha",
          "Al Reef",
          "Al Ghadeer",
          "Masdar City",
          "Mohammed Bin Zayed City",
          "Al Shamkha",
          "Al Wathba",
          "Al Maqtaa",
          "Al Mushrif",
          "Al Khalidiyah",
          "Al Markaziyah",
          "Al Bateen",
          "Al Zaab",
          "Al Manhal",
          "Al Nahyan",
          "Al Muroor",
          "Al Wahda Sharjah",
          "Al Majaz",
          "Al Qasimia",
          "Al Taawun",
          "Al Nahda Sharjah",
          "Al Khan",
          "Al Mamzar",
          "Al Twar",
          "Muwaileh",
          "University City Sharjah",
          "Al Nuaimiya",
          "Al Rashidiya",
          "Al Rumailah",
          "Al Jurf",
          "Ajman Downtown",
          "Al Rawda Ajman",
          "Al Hamidiyah",
          "Al Sawan",
          "Ajman Marina",
          "Al Rams",
          "Al Jazirah Al Hamra",
          "Al Nakheel",
          "Al Hamra",
          "Al Qurm",
          "Khuzam",
          "Al Seer",
          "Al Mairid",
          "Al Uraibi"
        ],
        message: "Please select a valid UAE city",
      },
    },
    // FIXED: Consistent pricing field
    price: {
      type: Number,
      required: [true, "Price per day is required"],
      min: [50, "Price cannot be less than AED 50 per day"],
      max: [5000, "Price cannot exceed AED 5000 per day"],
    },
    // Availability dates
    availabilityFrom: {
      type: Date,
      required: [true, "Availability start date is required"],
    },
    availabilityTo: {
      type: Date,
      required: [true, "Availability end date is required"],
    },
    // Car specifications
    make: {
      type: String,
      required: [true, "Car make is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Car model is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Car year is required"],
      min: [2010, "Car year cannot be before 2010"],
      max: [new Date().getFullYear() + 1, "Invalid car year"],
    },
    color: {
      type: String,
      required: [true, "Car color is required"],
      trim: true,
    },
    plateNumber: {
      type: String,
      required: [true, "Plate number is required"],
      uppercase: true,
      validate: {
        validator: function (v) {
          return /^[A-Z]{1,3}[0-9]{1,5}$/.test(v);
        },
        message: "Please enter a valid UAE plate number (e.g., A12345)",
      },
    },
    transmission: {
      type: String,
      enum: {
        values: ["Automatic", "Manual", "CVT", "Semi-Automatic"],
        message: "Please select a valid transmission type",
      },
      required: true,
      default: "Automatic",
    },
    fuelType: {
      type: String,
      enum: {
        values: ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"],
        message: "Please select a valid fuel type",
      },
      required: true,
      default: "Petrol",
    },
    mileage: {
      type: Number,
      required: [true, "Mileage is required"],
      min: [0, "Mileage cannot be negative"],
      max: [500000, "Mileage seems too high"],
    },
    seatingCapacity: {
      type: Number,
      required: [true, "Seating capacity is required"],
      min: [2, "Minimum 2 seats required"],
      max: [8, "Maximum 8 seats allowed"],
    },
    specifications: {
      type: String,
      enum: {
        values: [
          "GCC Specs",
          "US Specs",
          "Japanese Specs",
          "European Specs",
          "Canadian Specs",
          "Korean Specs",
        ],
        message: "Please select valid specifications",
      },
      required: true,
      default: "GCC Specs",
    },
    // Car features with VALID enum values
    features: [
      {
        type: String,
        enum: {
          values: [
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
          ],
          message: "Invalid feature selected",
        },
      },
    ],
    // Images array - minimum 3 required
    images: {
      type: [String],
      required: [true, "Car images are required"],
      validate: {
        validator: function (v) {
          return v && v.length >= 3;
        },
        message: "At least 3 images are required",
      },
    },
    // Additional settings
    isInstantApproval: { type: Boolean, default: true },
    minimumRentalDays: { type: Number, default: 1, min: 1 },
    maximumRentalDays: { type: Number, default: 30, min: 1 },
    deliveryAvailable: { type: Boolean, default: false },
    deliveryFee: { type: Number, default: 0, min: 0 },
    securityDeposit: { type: Number, default: 500, min: 0 },
    // Insurance details
    hasInsurance: {
      type: Boolean,
      required: [true, "Insurance status is required"],
      default: false,
    },
    insuranceProvider: {
      type: String,
      required: function() {
        return this.hasInsurance === true;
      },
      trim: true,
    },
    insurancePolicyNumber: {
      type: String,
      required: function() {
        return this.hasInsurance === true;
      },
      trim: true,
    },
    insuranceExpiryDate: {
      type: Date,
      required: function() {
        return this.hasInsurance === true;
      },
      validate: {
        validator: function(v) {
          return !this.hasInsurance || v > new Date();
        },
        message: "Insurance expiry date must be in the future",
      },
    },
    insuranceType: {
      type: String,
      enum: {
        values: ["Comprehensive", "Third Party", "Third Party Fire & Theft"],
        message: "Please select a valid insurance type",
      },
      required: function() {
        return this.hasInsurance === true;
      },
    },
    // Status tracking
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "deleted", "pending", "rejected", "maintenance"],
        message: "Invalid status",
      },
      default: "pending", // Cars should be pending by default for admin approval
    },
    totalBookings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    // Admin fields
    adminNotes: String,
    rejectionReason: String,
    // Soft delete
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// FIXED: Consolidated index definitions (no duplicates)
carSchema.index({ city: 1, status: 1 }); // Compound index for city + status queries
carSchema.index({ price: 1 }); // Price range queries
carSchema.index({ make: 1, model: 1 }); // Make + model searches
carSchema.index({ availabilityFrom: 1, availabilityTo: 1 }); // Date range queries
carSchema.index({ owner: 1 }); // Owner's cars
carSchema.index({ status: 1 }); // Status queries
carSchema.index({
  title: "text",
  description: "text",
  make: "text",
  model: "text",
}); // Text search index

// Pre-save validation
carSchema.pre("save", function (next) {
  // Validate date range
  if (this.availabilityTo <= this.availabilityFrom) {
    const error = new Error("Availability end date must be after start date");
    return next(error);
  }
  next();
});

// Hide deleted cars in queries
carSchema.pre(/^find/, function (next) {
  this.find({ deletedAt: null });
  next();
});

// Virtual for frontend compatibility
carSchema.virtual("pricePerDay").get(function () {
  return this.price;
});

// Ensure virtual fields are serialized
carSchema.set("toJSON", { virtuals: true });
carSchema.set("toObject", { virtuals: true });

export default mongoose.model("Car", carSchema);
