// controllers/adminController.js - Admin panel functionality
import User from "../models/User.js";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import { handleAsyncError } from "../utils/errorHandler.js";

// ADMIN DASHBOARD STATS
export const getAdminStats = handleAsyncError(async (req, res) => {
  try {
    const [
      totalUsers,
      totalOwners,
      totalRenters,
      approvedUsers,
      pendingUsers,
      totalCars,
      activeCars,
      pendingCars,
      totalBookings,
      activeBookings,
      completedBookings,
      thisMonthBookings,
      totalRevenue,
    ] = await Promise.all([
      User.countDocuments({ deletedAt: null }),
      User.countDocuments({ role: "owner", deletedAt: null }),
      User.countDocuments({ role: "renter", deletedAt: null }),
      User.countDocuments({ isApproved: true, deletedAt: null }),
      User.countDocuments({ isApproved: false, deletedAt: null }),
      Car.countDocuments({ deletedAt: null }),
      Car.countDocuments({ status: "active", deletedAt: null }),
      Car.countDocuments({ status: "pending", deletedAt: null }),
      Booking.countDocuments(),
      Booking.countDocuments({
        status: { $in: ["pending", "approved", "confirmed", "active"] },
      }),
      Booking.countDocuments({ status: "completed" }),
      Booking.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
      Booking.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalPayable" } } },
      ]),
    ]);

    // Calculate 5-star ratio
    const ratingsStats = await Booking.aggregate([
      {
        $match: {
          $or: [
            { "renterReview.rating": { $exists: true } },
            { "ownerReview.rating": { $exists: true } },
          ],
        },
      },
      {
        $project: {
          ratings: {
            $concatArrays: [
              { $ifNull: [["$renterReview.rating"], []] },
              { $ifNull: [["$ownerReview.rating"], []] },
            ],
          },
        },
      },
      { $unwind: "$ratings" },
      {
        $group: {
          _id: null,
          totalRatings: { $sum: 1 },
          fiveStarRatings: {
            $sum: { $cond: [{ $eq: ["$ratings", 5] }, 1, 0] },
          },
        },
      },
    ]);

    const fiveStarRatio =
      ratingsStats.length > 0
        ? (ratingsStats[0].fiveStarRatings / ratingsStats[0].totalRatings) * 100
        : 0;

    const stats = {
      users: {
        total: totalUsers,
        owners: totalOwners,
        renters: totalRenters,
        approved: approvedUsers,
        pending: pendingUsers,
      },
      cars: {
        total: totalCars,
        active: activeCars,
        pending: pendingCars,
      },
      bookings: {
        total: totalBookings,
        active: activeBookings,
        completed: completedBookings,
        thisMonth: thisMonthBookings,
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
      },
      metrics: {
        fiveStarRatio: Math.round(fiveStarRatio),
      },
    };

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin statistics",
      error: error.message,
    });
  }
});

// GET ALL USERS (ADMIN ONLY)
export const getAllUsers = handleAsyncError(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    role,
    isApproved,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build filter
  const filter = { deletedAt: null };
  if (role) filter.role = role;
  if (isApproved !== undefined) filter.isApproved = isApproved === "true";
  if (search) {
    filter.$or = [
      { name: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
      { phone: new RegExp(search, "i") },
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  const [users, totalCount] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.json({
    success: true,
    data: {
      users,
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

// APPROVE/REJECT USER
export const updateUserApproval = handleAsyncError(async (req, res) => {
  const { userId } = req.params;
  let { isApproved, reason } = req.body;

  // Handle simplified endpoints
  if (req.route.path.includes('/approve')) {
    isApproved = true;
  } else if (req.route.path.includes('/reject')) {
    isApproved = false;
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.isApproved = isApproved;
  if (!isApproved && reason) {
    user.rejectionReason = reason;
  }

  await user.save();

  // Send notification to user
  try {
    if (isApproved) {
      await Notification.createAccountApprovalNotification(userId);
    } else {
      await Notification.createAccountRejectionNotification(userId, reason || "Please review your documents and try again.");
    }
  } catch (notificationError) {
    console.error("Failed to send notification:", notificationError);
    // Continue with the response even if notification fails
  }

  res.json({
    success: true,
    message: `User ${isApproved ? "approved" : "rejected"} successfully`,
    data: { user: user },
  });
});

// GET ALL CARS (ADMIN)
export const getAllCars = handleAsyncError(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    city,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build filter
  const filter = { deletedAt: null };
  if (status) filter.status = status;
  if (city) filter.city = city;
  if (search) {
    filter.$or = [
      { title: new RegExp(search, "i") },
      { make: new RegExp(search, "i") },
      { model: new RegExp(search, "i") },
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  const [cars, totalCount] = await Promise.all([
    Car.find(filter)
      .populate("owner", "name email phone")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Car.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.json({
    success: true,
    data: {
      cars,
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

// APPROVE/REJECT CAR
export const updateCarApproval = handleAsyncError(async (req, res) => {
  const { carId } = req.params;
  const { status, reason, adminNotes } = req.body;

  const car = await Car.findById(carId);
  if (!car) {
    return res.status(404).json({
      success: false,
      message: "Car not found",
    });
  }

  car.status = status;
  if (reason) car.rejectionReason = reason;
  if (adminNotes) car.adminNotes = adminNotes;

  await car.save();

  res.json({
    success: true,
    message: `Car ${status} successfully`,
    data: { car },
  });
});

// GET ALL BOOKINGS (ADMIN)
export const getAllBookings = handleAsyncError(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    paymentStatus,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build filter
  const filter = {};
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  const [bookings, totalCount] = await Promise.all([
    Booking.find(filter)
      .populate("renter", "name email phone")
      .populate("car", "title make model year city")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Booking.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.json({
    success: true,
    data: {
      bookings,
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

// MODIFY USER (ADMIN)
export const modifyUser = handleAsyncError(async (req, res) => {
  const { userId } = req.params;
  const { name, email, phone, role, preferredCity, isApproved } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Update fields if provided
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (role !== undefined && ["renter", "owner"].includes(role)) user.role = role;
  if (preferredCity !== undefined) user.preferredCity = preferredCity;
  if (isApproved !== undefined) user.isApproved = isApproved;

  await user.save();

  res.json({
    success: true,
    message: "User updated successfully",
    data: { user },
  });
});

// BLOCK/UNBLOCK USER (ADMIN)
export const blockUser = handleAsyncError(async (req, res) => {
  const { userId } = req.params;
  const { isBlocked, blockReason } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.isBlocked = isBlocked;
  if (isBlocked) {
    user.blockedAt = new Date();
    user.blockReason = blockReason || "Admin decision";
  } else {
    user.blockedAt = null;
    user.blockReason = null;
  }

  await user.save();

  res.json({
    success: true,
    message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
    data: { user },
  });
});

// DELETE USER (ADMIN)
export const deleteUser = handleAsyncError(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Check if user has active bookings
  const activeBookings = await Booking.find({
    renter: userId,
    status: { $in: ["pending", "approved", "confirmed", "active"] },
  });

  if (activeBookings.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete user with active bookings",
    });
  }

  // Check if user owns cars with active bookings
  const userCars = await Car.find({ owner: userId });
  const carIds = userCars.map(car => car._id);
  
  const carsWithActiveBookings = await Booking.find({
    car: { $in: carIds },
    status: { $in: ["pending", "approved", "confirmed", "active"] },
  });

  if (carsWithActiveBookings.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete user who owns cars with active bookings",
    });
  }

  try {
    // Soft delete with timestamp in email/phone to avoid duplicates
    const timestamp = Date.now();
    user.deletedAt = new Date();
    user.email = `deleted_${timestamp}_${user._id}@deleted.com`;
    user.phone = `deleted_${timestamp}_${user._id}`;
    
    // Disable validation for this save to avoid phone validation issues
    await user.save({ validateBeforeSave: false });

    // Also soft delete user's cars
    if (userCars.length > 0) {
      await Car.updateMany(
        { owner: userId },
        { 
          deletedAt: new Date(),
          status: "deleted"
        }
      );
    }

    res.json({
      success: true,
      message: "User deleted successfully",
      data: {
        deletedCars: userCars.length
      }
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message
    });
  }
});

// DELETE CAR (ADMIN)
export const deleteCar = handleAsyncError(async (req, res) => {
  const { carId } = req.params;

  const car = await Car.findById(carId);
  if (!car) {
    return res.status(404).json({
      success: false,
      message: "Car not found",
    });
  }

  // Check for active bookings
  const activeBookings = await Booking.find({
    car: carId,
    status: { $in: ["pending", "approved", "confirmed", "active"] },
  });

  if (activeBookings.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete car with active bookings",
    });
  }

  // Soft delete
  car.deletedAt = new Date();
  car.status = "deleted";
  await car.save();

  res.json({
    success: true,
    message: "Car deleted successfully",
  });
});

// VERIFY DRIVING LICENSE MANUALLY
export const verifyDrivingLicense = handleAsyncError(async (req, res) => {
  const { userId } = req.params;
  const { verified, notes } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.licenseVerified = verified;
  if (notes) user.licenseVerificationNotes = notes;

  await user.save();

  res.json({
    success: true,
    message: `Driving license ${verified ? "verified" : "rejected"}`,
    data: { user },
  });
});

// GET DETAILED USER FOR VERIFICATION
export const getUserDetails = handleAsyncError(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("-password");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Get user's cars and bookings for context
  const [userCars, userBookings] = await Promise.all([
    Car.find({ owner: userId, deletedAt: null }).lean(),
    Booking.find({ renter: userId })
      .populate("car", "title make model")
      .lean(),
  ]);

  res.json({
    success: true,
    data: {
      user,
      cars: userCars,
      bookings: userBookings,
    },
  });
});

// BULK USER ACTIONS
export const bulkUserActions = handleAsyncError(async (req, res) => {
  const { userIds, action, reason } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "User IDs array is required",
    });
  }

  const validActions = ["approve", "reject", "delete"];
  if (!validActions.includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Invalid action. Must be: approve, reject, or delete",
    });
  }

  let updateQuery = {};
  switch (action) {
    case "approve":
      updateQuery = { isApproved: true };
      break;
    case "reject":
      updateQuery = { isApproved: false };
      if (reason) updateQuery.rejectionReason = reason;
      break;
    case "delete":
      updateQuery = { 
        deletedAt: new Date(),
        email: { $exists: true }, // We'll handle email modification separately
      };
      break;
  }

  if (action === "delete") {
    // Handle soft delete with email modification
    const users = await User.find({ _id: { $in: userIds } });
    const timestamp = Date.now();
    await Promise.all(
      users.map(async (user) => {
        user.deletedAt = new Date();
        user.email = `deleted_${timestamp}_${user._id}@deleted.com`;
        user.phone = `deleted_${timestamp}_${user._id}`;
        await user.save({ validateBeforeSave: false });
      })
    );
  } else {
    await User.updateMany(
      { _id: { $in: userIds } },
      updateQuery
    );
  }

  res.json({
    success: true,
    message: `Successfully ${action}d ${userIds.length} users`,
    data: { processedCount: userIds.length },
  });
});

// ADMIN ACTIVITY LOG
export const getAdminActivityLog = handleAsyncError(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  
  // This would require an audit log model, for now we'll return recent changes
  const recentUsers = await User.find({
    $or: [
      { updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
    ]
  })
    .select("name email isApproved role createdAt updatedAt")
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit))
    .lean();

  const recentCars = await Car.find({
    $or: [
      { updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
    ]
  })
    .populate("owner", "name email")
    .select("title status owner createdAt updatedAt")
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit))
    .lean();

  res.json({
    success: true,
    data: {
      recentUsers,
      recentCars,
      summary: {
        userChanges: recentUsers.length,
        carChanges: recentCars.length,
      },
    },
  });
});

// SYSTEM CONFIGURATION
export const getSystemConfig = handleAsyncError(async (req, res) => {
  const config = {
    platform: {
      name: "BorrowMyCar",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    },
    features: {
      autoApproval: false,
      maintenanceMode: false,
      registrationOpen: true,
      paymentGateway: "stripe",
    },
    limits: {
      maxCarsPerOwner: 10,
      maxBookingsPerUser: 5,
      maxImageSize: "10MB",
      supportedCities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"],
    },
  };

  res.json({
    success: true,
    data: { config },
  });
});

// UPDATE SYSTEM CONFIGURATION
export const updateSystemConfig = handleAsyncError(async (req, res) => {
  const { autoApproval, maintenanceMode, registrationOpen } = req.body;
  
  // In a real app, you'd store this in database or config file
  // For now, we'll just return success
  res.json({
    success: true,
    message: "System configuration updated",
    data: {
      autoApproval,
      maintenanceMode,
      registrationOpen,
    },
  });
});

// EXPORT DATA FOR REPORTS
export const exportData = handleAsyncError(async (req, res) => {
  const { type, format = "json", startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  let data = {};

  switch (type) {
    case "users":
      data.users = await User.find({
        ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
        deletedAt: null,
      }).select("-password").lean();
      break;
      
    case "cars":
      data.cars = await Car.find({
        ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
        deletedAt: null,
      })
        .populate("owner", "name email")
        .lean();
      break;
      
    case "bookings":
      data.bookings = await Booking.find({
        ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
      })
        .populate("renter", "name email")
        .populate("car", "title make model")
        .lean();
      break;
      
    default:
      return res.status(400).json({
        success: false,
        message: "Invalid export type. Must be: users, cars, or bookings",
      });
  }

  res.json({
    success: true,
    message: `${type} data exported successfully`,
    data,
    exportInfo: {
      type,
      format,
      timestamp: new Date().toISOString(),
      recordCount: Object.values(data)[0]?.length || 0,
    },
  });
});