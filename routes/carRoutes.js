// routes/carRoutes.js (Updated with all routes)
import express from "express";
import {
  createCar,
  getCars,
  getCarById,
  updateCar,
  deleteCar,
  getCarsByOwner,
  getMyCars,
  getCarAvailability,
  getSellerDashboard,
  getSellerOrders,
  bulkUpdateCars,
  toggleCarStatus,
  duplicateCarListing,
} from "../controllers/carController.js";
import {
  protect,
  restrictTo,
  requireApproval,
  optionalAuth,
  uploadLimiter,
} from "../middlewares/authMiddleware.js";
import { uploadCarImages } from "../middlewares/multer.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Car validation rules to match model fields
const carValidationRules = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("city")
    .notEmpty()
    .withMessage("City is required")
    .isIn([
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
    ])
    .withMessage("Please select a valid UAE city"),

  // Handle both price and pricePerDay from frontend - at least one is required
  body("pricePerDay")
    .notEmpty()
    .withMessage("Price per day is required")
    .isNumeric()
    .withMessage("Price per day must be a number")
    .isFloat({ min: 50, max: 5000 })
    .withMessage("Price per day must be between AED 50 and AED 5000"),

  body("make")
    .notEmpty()
    .withMessage("Car make is required")
    .isLength({ min: 2 })
    .withMessage("Car make must be at least 2 characters"),

  body("model").notEmpty().withMessage("Car model is required"),

  body("year")
    .isInt({ min: 2010, max: new Date().getFullYear() + 1 })
    .withMessage("Car year must be between 2010 and current year"),

  body("color").notEmpty().withMessage("Car color is required"),

  body("plateNumber")
    .notEmpty()
    .withMessage("Plate number is required")
    .matches(/^[A-Z]{1,3}[0-9]{1,5}$/)
    .withMessage(
      "Please enter a valid UAE plate number (e.g., A12345, ABC123)"
    ),

  body("transmission")
    .isIn(["Automatic", "Manual", "CVT", "Semi-Automatic"])
    .withMessage("Please select a valid transmission type"),

  body("fuelType")
    .isIn(["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"])
    .withMessage("Please select a valid fuel type"),

  body("mileage")
    .isInt({ min: 0, max: 500000 })
    .withMessage("Mileage must be between 0 and 500,000 km"),

  body("seatingCapacity")
    .isInt({ min: 2, max: 8 })
    .withMessage("Seating capacity must be between 2 and 8"),

  body("availabilityFrom")
    .isISO8601()
    .withMessage("Please provide a valid availability start date"),

  body("availabilityTo")
    .isISO8601()
    .withMessage("Please provide a valid availability end date"),
];

// Enhanced validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    console.log("Request body at validation:", req.body);
    
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
      code: "VALIDATION_ERROR",
    });
  }
  next();
};

// PUBLIC ROUTES
// GET /api/cars - Get all cars with filtering
router.get(
  "/",
  optionalAuth, // Optional authentication for personalized results
  getCars
);

// GET /api/cars/:id - Get single car
router.get("/:id", optionalAuth, getCarById);

// GET /api/cars/:id/availability - Get car availability and existing bookings
router.get("/:id/availability", getCarAvailability);

// GET /api/cars/owner/:ownerId - Get cars by specific owner
router.get("/owner/:ownerId", getCarsByOwner);

// PROTECTED ROUTES (Authentication required)
router.use(protect); // Apply protection to all routes below

// GET /api/cars/my/cars - Get current user's cars (Owner only)
router.get("/my/cars", restrictTo("owner"), getMyCars);

// GET /api/cars/seller/dashboard - Get seller dashboard data (Owner only)
router.get("/seller/dashboard", restrictTo("owner"), getSellerDashboard);

// GET /api/cars/seller/orders - Get seller orders (Owner only)
router.get("/seller/orders", restrictTo("owner"), getSellerOrders);

// PUT /api/cars/bulk - Bulk update multiple cars (Owner only)
router.put("/bulk", restrictTo("owner"), bulkUpdateCars);

// PATCH /api/cars/:id/toggle-status - Toggle car active/inactive status (Owner only)
router.patch("/:id/toggle-status", restrictTo("owner"), toggleCarStatus);

// POST /api/cars/:id/duplicate - Duplicate car listing (Owner only)
router.post("/:id/duplicate", restrictTo("owner"), duplicateCarListing);

// POST /api/cars - Create new car (Owner only)
router.post(
  "/",
  restrictTo("owner"), // Only owners can create cars
  requireApproval, // Account must be approved
  uploadLimiter, // Rate limiting for uploads
  uploadCarImages, // Handle file upload (up to 10 images)
  carValidationRules, // Validate input data
  handleValidationErrors, // Handle validation errors
  createCar // Create car controller
);

// PUT /api/cars/:id - Update car (Owner only, own cars)
router.put(
  "/:id",
  restrictTo("owner"),
  uploadCarImages, // Allow image updates (up to 10 images)
  carValidationRules, // Validate updated data
  handleValidationErrors,
  updateCar
);

// PATCH /api/cars/:id - Partial update car (Owner only, own cars)
router.patch(
  "/:id",
  restrictTo("owner"),
  uploadCarImages, // Allow image updates
  updateCar
);

// DELETE /api/cars/:id - Delete car (Owner only, own cars)
router.delete("/:id", restrictTo("owner"), deleteCar);

export default router;
