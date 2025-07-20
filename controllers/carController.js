// controllers/carController.js - FIXED with consistent price handling
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";
import {
  uploadImagesToCloud,
  deleteImagesFromCloud,
} from "../utils/cloudUploader.js";
import { handleAsyncError } from "../utils/errorHandler.js";

// Enhanced car data sanitizer with FIXED field mapping
const sanitizeCarData = (data) => {
  const sanitized = {};

  // Basic fields
  if (data.title) sanitized.title = data.title.toString().trim();
  if (data.description)
    sanitized.description = data.description.toString().trim();
  if (data.city) sanitized.city = data.city.toString().trim();
  if (data.make) sanitized.make = data.make.toString().trim();
  if (data.model) sanitized.model = data.model.toString().trim();
  if (data.color) sanitized.color = data.color.toString().trim();
  if (data.plateNumber)
    sanitized.plateNumber = data.plateNumber.toString().toUpperCase().trim();

  // CRITICAL FIX: Handle both pricePerDay (frontend) and price (backend)
  if (data.pricePerDay) {
    sanitized.price = parseFloat(data.pricePerDay);
  } else if (data.price) {
    sanitized.price = parseFloat(data.price);
  }

  // Numeric fields
  if (data.year) sanitized.year = parseInt(data.year);
  if (data.mileage) sanitized.mileage = parseInt(data.mileage);
  if (data.seatingCapacity)
    sanitized.seatingCapacity = parseInt(data.seatingCapacity);

  // Enum fields
  if (data.transmission)
    sanitized.transmission = data.transmission.toString().trim();
  if (data.fuelType) sanitized.fuelType = data.fuelType.toString().trim();
  if (data.specifications)
    sanitized.specifications = data.specifications.toString().trim();

  // Array fields
  if (data.features) {
    sanitized.features = Array.isArray(data.features)
      ? data.features.map((f) => f.toString().trim())
      : [data.features.toString().trim()];
  }

  // Date fields
  if (data.availabilityFrom) sanitized.availabilityFrom = data.availabilityFrom;
  if (data.availabilityTo) sanitized.availabilityTo = data.availabilityTo;

  // Insurance fields
  if (data.hasInsurance !== undefined) sanitized.hasInsurance = data.hasInsurance === true || data.hasInsurance === 'true';
  if (data.insuranceProvider) sanitized.insuranceProvider = data.insuranceProvider.toString().trim();
  if (data.insurancePolicyNumber) sanitized.insurancePolicyNumber = data.insurancePolicyNumber.toString().trim();
  if (data.insuranceExpiryDate) sanitized.insuranceExpiryDate = data.insuranceExpiryDate;
  if (data.insuranceType) sanitized.insuranceType = data.insuranceType.toString().trim();

  return sanitized;
};

// CREATE CAR - FIXED
export const createCar = handleAsyncError(async (req, res) => {
  const user = req.user;

  // Check if user is approved
  if (!user.isApproved) {
    return res.status(403).json({
      success: false,
      message: "Your account must be approved before listing cars",
      code: "ACCOUNT_NOT_APPROVED",
    });
  }

  // Role-based authorization
  if (user.role !== "owner") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only car owners can list vehicles.",
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }

  // Extract and sanitize input data
  console.log("Raw request body:", req.body);
  console.log("Features from request:", req.body.features);
  const carData = sanitizeCarData(req.body);
  console.log("Sanitized car data:", JSON.stringify(carData, null, 2));

  // VALIDATION: Ensure price is set
  if (!carData.price || carData.price <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid price per day is required",
      code: "INVALID_PRICE",
    });
  }

  // Handle images upload - REQUIRE MINIMUM 3 IMAGES
  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    if (req.files.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Minimum 3 images required",
        code: "INSUFFICIENT_IMAGES",
      });
    }

    try {
      imageUrls = await uploadImagesToCloud(req.files);
    } catch (uploadError) {
      console.error("Image upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload images. Please try again.",
        code: "IMAGE_UPLOAD_FAILED",
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Car images are required",
      code: "MISSING_IMAGES",
    });
  }

  // Create car document
  const newCar = new Car({
    ...carData,
    images: imageUrls,
    owner: user.id,
    status: "pending", // Requires admin approval
  });

  const savedCar = await newCar.save();
  await savedCar.populate("owner", "name email phone profileImage");

  // Send car listing request notification
  try {
    const Notification = (await import("../models/Notification.js")).default;
    await Notification.createCarListingRequestNotification(user.id, savedCar);
  } catch (notificationError) {
    console.error("Failed to send car listing notification:", notificationError);
    // Don't fail the car creation if notification fails
  }

  // Add pricePerDay for frontend compatibility
  const responseData = {
    ...savedCar.toObject(),
    pricePerDay: savedCar.price,
  };

  res.status(201).json({
    success: true,
    message: "Car listed successfully!",
    data: { car: responseData },
  });
});

// GET CARS - FIXED to handle both price fields
export const getCars = handleAsyncError(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    city,
    priceMin,
    priceMax,
    makeModel,
    make,
    year,
    transmission,
    fuelType,
    seatingCapacity,
    features,
    deliveryAvailable,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
  } = req.query;

  console.log("GET Cars query params:", req.query);

  // Build filter object
  const filter = { status: "active" };

  // City filter
  if (city) filter.city = city;

  // Price range filter
  if (priceMin || priceMax) {
    filter.price = {};
    if (priceMin) filter.price.$gte = parseFloat(priceMin);
    if (priceMax) filter.price.$lte = parseFloat(priceMax);
  }

  // Car specifications
  if (make) filter.make = new RegExp(make, "i");
  if (makeModel) {
    filter.$or = [
      { make: new RegExp(makeModel, "i") },
      { model: new RegExp(makeModel, "i") },
      { title: new RegExp(makeModel, "i") },
    ];
  }
  if (year) filter.year = parseInt(year);
  if (transmission) filter.transmission = transmission;
  if (fuelType) filter.fuelType = fuelType;
  if (seatingCapacity) filter.seatingCapacity = parseInt(seatingCapacity);

  // Features filter
  if (features) {
    const featureArray = Array.isArray(features) ? features : [features];
    filter.features = { $in: featureArray };
  }

  // Search in title, description, make, and model
  if (search) {
    filter.$or = [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
      { make: new RegExp(search, "i") },
      { model: new RegExp(search, "i") },
    ];
  }

  // Only show available cars
  filter.availabilityTo = { $gte: new Date() };

  console.log("Cars filter:", filter);

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Execute query with LEAN for better performance
  const [cars, totalCount] = await Promise.all([
    Car.find(filter)
      .populate("owner", "name email phone profileImage averageRating")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Car.countDocuments(filter),
  ]);

  console.log(`Found ${cars.length} cars out of ${totalCount} total`);

  // ADD pricePerDay field for frontend compatibility
  const enhancedCars = cars.map((car) => ({
    ...car,
    pricePerDay: car.price, // Frontend expects this field
  }));

  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.json({
    success: true,
    data: {
      cars: enhancedCars,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
        limit: parseInt(limit),
      },
    },
  });
});

// Get single car by ID - FIXED
export const getCarById = handleAsyncError(async (req, res) => {
  const { id } = req.params;

  let car = await Car.findById(id)
    .populate(
      "owner",
      "name email phone profileImage averageRating totalBookings createdAt"
    )
    .lean();

  if (!car || car.status === "deleted") {
    return res.status(404).json({
      success: false,
      message: "Car not found",
      code: "CAR_NOT_FOUND",
    });
  }

  // Check if car is still available
  const today = new Date();
  if (new Date(car.availabilityTo) < today) {
    return res.status(410).json({
      success: false,
      message: "This car listing has expired",
      code: "LISTING_EXPIRED",
    });
  }

  // CRITICAL FIX: Add pricePerDay for frontend compatibility
  car.pricePerDay = car.price;

  res.json({
    success: true,
    data: { car },
  });
});

// UPDATE CAR
export const updateCar = handleAsyncError(async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  // Find the car and check ownership
  const car = await Car.findById(id);
  if (!car) {
    return res.status(404).json({
      success: false,
      message: "Car not found",
      code: "CAR_NOT_FOUND",
    });
  }

  // Check ownership
  if (car.owner.toString() !== user.id) {
    return res.status(403).json({
      success: false,
      message: "You can only update your own cars",
      code: "UNAUTHORIZED",
    });
  }

  // Sanitize update data
  const updateData = sanitizeCarData(req.body);

  // Handle new images if provided
  if (req.files && req.files.length > 0) {
    try {
      // Delete old images
      if (car.images && car.images.length > 0) {
        await deleteImagesFromCloud(car.images).catch(console.error);
      }

      // Upload new images
      const newImageUrls = await uploadImagesToCloud(req.files);
      updateData.images = newImageUrls;
    } catch (uploadError) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload new images",
        code: "IMAGE_UPLOAD_FAILED",
      });
    }
  }

  // Update the car
  const updatedCar = await Car.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("owner", "name email phone profileImage");

  // Add pricePerDay for frontend compatibility
  const responseData = {
    ...updatedCar.toObject(),
    pricePerDay: updatedCar.price,
  };

  res.json({
    success: true,
    message: "Car updated successfully",
    data: { car: responseData },
  });
});

// DELETE CAR (Soft delete)
export const deleteCar = handleAsyncError(async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  // Find the car and check ownership
  const car = await Car.findById(id);
  if (!car) {
    return res.status(404).json({
      success: false,
      message: "Car not found",
      code: "CAR_NOT_FOUND",
    });
  }

  // Check ownership
  if (car.owner.toString() !== user.id) {
    return res.status(403).json({
      success: false,
      message: "You can only delete your own cars",
      code: "UNAUTHORIZED",
    });
  }

  // Check for active bookings
  const activeBookings = await Booking.find({
    car: id,
    status: { $in: ["pending", "approved", "confirmed", "active"] },
  })
    .populate("user", "name email")
    .populate("car", "title make model");

  if (activeBookings.length > 0) {
    // Cancel all active bookings and notify users
    const EmailService = (await import("../utils/emailService.js")).default;
    const emailService = new EmailService();
    const Notification = (await import("../models/Notification.js")).default;

    await Booking.updateMany(
      {
        car: id,
        status: { $in: ["pending", "approved", "confirmed", "active"] },
      },
      {
        status: "cancelled",
        cancellationReason: "Car removed by owner",
        cancelledBy: user.id,
        cancelledAt: new Date(),
      }
    );

    // Send notifications and emails to affected users
    for (const booking of activeBookings) {
      // Create notification
      await Notification.create({
        user: booking.user._id,
        type: "booking_cancelled",
        title: "Booking Cancelled - Car No Longer Available",
        message: `Your booking for ${car.title} has been cancelled as the car owner has removed this listing.`,
        data: { bookingId: booking._id },
      });

      // Send cancellation email
      const bookingData = {
        carBrand: car.make,
        carModel: car.model,
        carTitle: car.title,
        startDate: booking.pickupDate,
        endDate: booking.returnDate,
        duration: Math.ceil((new Date(booking.returnDate) - new Date(booking.pickupDate)) / (1000 * 60 * 60 * 24)),
        totalAmount: booking.totalPayable,
        bookingId: booking._id,
        renterName: booking.user.name,
      };

      await emailService.sendBookingCancellationEmail(
        booking.user.email,
        bookingData,
        "The car owner has decided to remove this listing from our platform. We apologize for any inconvenience caused."
      );
    }
  }

  // Soft delete (mark as deleted)
  car.status = "deleted";
  car.deletedAt = new Date();
  await car.save();

  // Optional: Delete images from cloud storage
  if (car.images && car.images.length > 0) {
    deleteImagesFromCloud(car.images).catch(console.error);
  }

  res.json({
    success: true,
    message: "Car deleted successfully",
  });
});

// GET CARS BY OWNER
export const getCarsByOwner = handleAsyncError(async (req, res) => {
  const { ownerId } = req.params;
  const {
    page = 1,
    limit = 12,
    status = "active",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build filter
  const filter = { owner: ownerId };
  if (status !== "all") {
    filter.status = status;
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Execute query
  const [cars, totalCount] = await Promise.all([
    Car.find(filter)
      .populate("owner", "name email phone profileImage averageRating")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Car.countDocuments(filter),
  ]);

  // Add pricePerDay for frontend compatibility
  const enhancedCars = cars.map((car) => ({
    ...car,
    pricePerDay: car.price,
  }));

  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.json({
    success: true,
    data: {
      cars: enhancedCars,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
        limit: parseInt(limit),
      },
    },
  });
});

// GET MY CARS (for authenticated owner)
export const getMyCars = handleAsyncError(async (req, res) => {
  const user = req.user;
  const {
    page = 1,
    limit = 12,
    status = "active",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build filter for current user's cars
  const filter = { owner: user.id };
  if (status !== "all") {
    filter.status = status;
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Execute query
  const [cars, totalCount] = await Promise.all([
    Car.find(filter).sort(sortOptions).skip(skip).limit(parseInt(limit)).lean(),
    Car.countDocuments(filter),
  ]);

  // Add pricePerDay and booking stats
  const enhancedCars = await Promise.all(
    cars.map(async (car) => {
      // Get booking stats for each car
      const bookingStats = await Booking.aggregate([
        { $match: { car: car._id } },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalEarnings: { $sum: "$totalPayable" },
            activeBookings: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "$status",
                      ["pending", "approved", "confirmed", "active"],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

      const stats = bookingStats[0] || {
        totalBookings: 0,
        totalEarnings: 0,
        activeBookings: 0,
      };

      return {
        ...car,
        pricePerDay: car.price,
        bookingStats: stats,
      };
    })
  );

  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.json({
    success: true,
    data: {
      cars: enhancedCars,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
        limit: parseInt(limit),
      },
    },
  });
});

// GET SELLER DASHBOARD DATA
export const getSellerDashboard = handleAsyncError(async (req, res) => {
  const user = req.user;
  const { period = "30" } = req.query; // days to look back

  // Check if user is an owner
  if (user.role !== "owner") {
    return res.status(403).json({
      success: false,
      message: "Only car owners can access seller dashboard",
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }

  const periodDays = parseInt(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Get user's cars
  const userCars = await Car.find({ owner: user.id }).select("_id title");
  const carIds = userCars.map(car => car._id);

  // Get overall statistics
  const [overallStats] = await Booking.aggregate([
    { $match: { car: { $in: carIds } } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalEarnings: { $sum: "$totalPayable" },
        avgBookingValue: { $avg: "$totalPayable" },
        completedBookings: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
        },
        activeBookings: {
          $sum: {
            $cond: [
              { $in: ["$status", ["pending", "approved", "confirmed", "active"]] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  // Get earnings by period
  const earningsByPeriod = await Booking.aggregate([
    {
      $match: {
        car: { $in: carIds },
        createdAt: { $gte: startDate },
        status: { $in: ["completed", "confirmed", "active"] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        },
        dailyEarnings: { $sum: "$totalPayable" },
        dailyBookings: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
  ]);

  // Get top performing cars
  const topCars = await Booking.aggregate([
    { $match: { car: { $in: carIds } } },
    {
      $group: {
        _id: "$car",
        totalEarnings: { $sum: "$totalPayable" },
        totalBookings: { $sum: 1 },
        avgRating: { $avg: "$renterReview.rating" }
      }
    },
    { $sort: { totalEarnings: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "cars",
        localField: "_id",
        foreignField: "_id",
        as: "carDetails"
      }
    },
    { $unwind: "$carDetails" }
  ]);

  // Get recent bookings
  const recentBookings = await Booking.find({
    car: { $in: carIds }
  })
    .populate("car", "title make model images")
    .populate("renter", "name email")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Get booking status distribution
  const statusDistribution = await Booking.aggregate([
    { $match: { car: { $in: carIds } } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const stats = overallStats || {
    totalBookings: 0,
    totalEarnings: 0,
    avgBookingValue: 0,
    completedBookings: 0,
    activeBookings: 0
  };

  res.json({
    success: true,
    data: {
      overview: {
        totalCars: userCars.length,
        totalBookings: stats.totalBookings,
        totalEarnings: stats.totalEarnings,
        avgBookingValue: stats.avgBookingValue || 0,
        completedBookings: stats.completedBookings,
        activeBookings: stats.activeBookings,
        completionRate: stats.totalBookings > 0 ? (stats.completedBookings / stats.totalBookings * 100).toFixed(1) : 0
      },
      earningsByPeriod,
      topPerformingCars: topCars,
      recentBookings,
      statusDistribution
    }
  });
});

// GET SELLER ORDERS (Bookings)
export const getSellerOrders = handleAsyncError(async (req, res) => {
  const user = req.user;
  const {
    page = 1,
    limit = 20,
    status,
    startDate,
    endDate,
    carId,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = req.query;

  // Check if user is an owner
  if (user.role !== "owner") {
    return res.status(403).json({
      success: false,
      message: "Only car owners can access orders",
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }

  // Get user's cars
  const userCars = await Car.find({ owner: user.id }).select("_id");
  const carIds = userCars.map(car => car._id);

  // Build filter
  const filter = { car: { $in: carIds } };
  
  if (status) filter.status = status;
  if (carId) filter.car = carId;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Execute query
  const [orders, totalCount] = await Promise.all([
    Booking.find(filter)
      .populate("car", "title make model year images price city")
      .populate("renter", "name email phone profileImage")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Booking.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
        limit: parseInt(limit)
      }
    }
  });
});


// Get car availability with existing bookings
export const getCarAvailability = handleAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Find the car
  const car = await Car.findById(id);
  if (!car) {
    return res.status(404).json({
      success: false,
      message: "Car not found",
    });
  }

  // Get all approved bookings for this car
  const existingBookings = await Booking.find({
    car: id,
    status: { $in: ["pending", "approved", "confirmed", "in_progress"] }, // Include all active booking statuses
  }).select("startDate endDate status");

  // Create array of unavailable date ranges
  const unavailableDates = existingBookings.map(booking => ({
    startDate: booking.startDate,
    endDate: booking.endDate,
    status: booking.status,
  }));

  res.status(200).json({
    success: true,
    data: {
      carId: car._id,
      availabilityFrom: car.availabilityFrom,
      availabilityTo: car.availabilityTo,
      unavailableDates,
      minimumRentalDays: car.minimumRentalDays || 1,
      maximumRentalDays: car.maximumRentalDays || 30,
    },
  });
});

// BULK UPDATE CARS
export const bulkUpdateCars = handleAsyncError(async (req, res) => {
  const user = req.user;
  const { carIds, updateData } = req.body;

  if (!carIds || !Array.isArray(carIds) || carIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Car IDs array is required",
      code: "INVALID_INPUT"
    });
  }

  // Verify ownership of all cars
  const cars = await Car.find({ 
    _id: { $in: carIds }, 
    owner: user.id 
  });

  if (cars.length !== carIds.length) {
    return res.status(403).json({
      success: false,
      message: "You can only update your own cars",
      code: "UNAUTHORIZED"
    });
  }

  // Sanitize update data
  const allowedFields = ['status', 'price', 'availabilityFrom', 'availabilityTo', 'deliveryAvailable', 'deliveryFee'];
  const sanitizedData = {};
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      sanitizedData[field] = updateData[field];
    }
  }

  // Perform bulk update
  const result = await Car.updateMany(
    { _id: { $in: carIds }, owner: user.id },
    { $set: sanitizedData }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} cars updated successfully`,
    data: { modifiedCount: result.modifiedCount }
  });
});

// TOGGLE CAR STATUS
export const toggleCarStatus = handleAsyncError(async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  const car = await Car.findById(id);
  if (!car) {
    return res.status(404).json({
      success: false,
      message: "Car not found",
      code: "CAR_NOT_FOUND"
    });
  }

  if (car.owner.toString() !== user.id) {
    return res.status(403).json({
      success: false,
      message: "You can only update your own cars",
      code: "UNAUTHORIZED"
    });
  }

  // Toggle between active and inactive
  car.status = car.status === "active" ? "inactive" : "active";
  await car.save();

  res.json({
    success: true,
    message: `Car status changed to ${car.status}`,
    data: { car: { ...car.toObject(), pricePerDay: car.price } }
  });
});

// DUPLICATE CAR LISTING
export const duplicateCarListing = handleAsyncError(async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  const originalCar = await Car.findById(id);
  if (!originalCar) {
    return res.status(404).json({
      success: false,
      message: "Car not found",
      code: "CAR_NOT_FOUND"
    });
  }

  if (originalCar.owner.toString() !== user.id) {
    return res.status(403).json({
      success: false,
      message: "You can only duplicate your own cars",
      code: "UNAUTHORIZED"
    });
  }

  // Create duplicate with modified data
  const duplicateData = {
    ...originalCar.toObject(),
    _id: undefined,
    title: `${originalCar.title} (Copy)`,
    plateNumber: "", // Reset plate number - must be unique
    status: "pending", // Reset status
    totalBookings: 0,
    averageRating: 0,
    createdAt: undefined,
    updatedAt: undefined
  };

  const duplicatedCar = new Car(duplicateData);
  await duplicatedCar.save();
  await duplicatedCar.populate("owner", "name email phone profileImage");

  res.status(201).json({
    success: true,
    message: "Car listing duplicated successfully",
    data: { car: { ...duplicatedCar.toObject(), pricePerDay: duplicatedCar.price } }
  });
});
