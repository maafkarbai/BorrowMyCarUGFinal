// src/utils/BookingValidation.js - Validation utilities for booking forms

export const validateBookingForm = (booking, car) => {
  const errors = {};

  // Date validation
  if (!booking.startDate) {
    errors.startDate = "Start date is required";
  }

  if (!booking.endDate) {
    errors.endDate = "End date is required";
  }

  if (booking.startDate && booking.endDate) {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      errors.startDate = "Start date cannot be in the past";
    }

    if (start >= end) {
      errors.endDate = "End date must be after start date";
    }

    // Check car availability
    if (car) {
      const availableFrom = new Date(car.availabilityFrom);
      const availableTo = new Date(car.availabilityTo);

      if (start < availableFrom || end > availableTo) {
        errors.dates = `Selected dates must be between ${availableFrom.toLocaleDateString()} and ${availableTo.toLocaleDateString()}`;
      }
    }
  }

  // Location validation
  if (!booking.pickupLocation || !booking.pickupLocation.trim()) {
    errors.pickupLocation = "Pickup location is required";
  }

  if (!booking.returnLocation || !booking.returnLocation.trim()) {
    errors.returnLocation = "Return location is required";
  }

  // Payment method validation
  if (!booking.paymentMethod) {
    errors.paymentMethod = "Please select a payment method";
  }

  // Validate payment method is one of the accepted values
  if (
    booking.paymentMethod &&
    !["Card", "Cash"].includes(booking.paymentMethod)
  ) {
    errors.paymentMethod = "Invalid payment method selected";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const calculateBookingCost = (startDate, endDate, dailyRate) => {
  if (!startDate || !endDate || !dailyRate) {
    return { days: 0, totalCost: 0 };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { days: 0, totalCost: 0 };
  }

  return {
    days: diffDays,
    totalCost: diffDays * dailyRate,
  };
};

export const formatPaymentMethod = (method) => {
  const methods = {
    credit_card: "Credit Card",
    debit_card: "Debit Card",
    card: "Credit/Debit Card",
    cash_on_delivery: "Cash on Meet",
    cash: "Cash on Meet",
    bank_transfer: "Bank Transfer",
    paypal: "PayPal",
  };
  return methods[method] || "Unknown";
};

export const getPaymentMethodIcon = (method) => {
  if (method === "cash_on_delivery" || method === "cash") {
    return "💵";
  }
  if (method === "paypal") {
    return "🅿️";
  }
  if (method === "bank_transfer") {
    return "🏦";
  }
  return "💳";
};

// Validation for car listing form (bonus utility)
export const validateCarListingForm = (form, images) => {
  const errors = {};

  // Basic field validation
  if (!form.title || form.title.trim().length < 3) {
    errors.title = "Car title must be at least 3 characters";
  }

  if (!form.description || form.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
  }

  if (!form.city || form.city.trim().length < 2) {
    errors.city = "City is required";
  }

  // Price validation
  const price = parseFloat(form.pricePerDay);
  if (!form.pricePerDay || isNaN(price) || price <= 0) {
    errors.pricePerDay = "Price per day must be greater than 0";
  }

  if (price > 10000) {
    errors.pricePerDay = "Price per day seems too high (max AED 10,000)";
  }

  // Date validation
  if (!form.availabilityFrom) {
    errors.availabilityFrom = "Start date is required";
  }

  if (!form.availabilityTo) {
    errors.availabilityTo = "End date is required";
  }

  if (form.availabilityFrom && form.availabilityTo) {
    const start = new Date(form.availabilityFrom);
    const end = new Date(form.availabilityTo);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      errors.availabilityFrom = "Start date cannot be in the past";
    }

    if (start >= end) {
      errors.availabilityTo = "End date must be after start date";
    }

    // Check for reasonable rental period (max 1 year)
    const diffTime = end - start;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays > 365) {
      errors.availabilityTo = "Rental period cannot exceed 1 year";
    }
  }

  // Image validation
  if (!images || images.length === 0) {
    errors.images = "At least one image is required";
  }

  if (images && images.length > 10) {
    errors.images = "Maximum 10 images allowed";
  }

  // Validate each image
  if (images && images.length > 0) {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (let i = 0; i < images.length; i++) {
      const image = images[i];

      if (!validTypes.includes(image.type)) {
        errors.images = `Image ${
          i + 1
        }: Only JPEG, PNG, and WebP files are allowed`;
        break;
      }

      if (image.size > maxSize) {
        errors.images = `Image ${i + 1}: File size must be less than 5MB`;
        break;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// UAE cities validation
export const validateUAECity = (city) => {
  const uaeCities = [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Fujairah",
    "Ras Al Khaimah",
    "Umm Al Quwain",
    "Dubai Marina",
    "Downtown Dubai",
    "Jumeirah",
    "Deira",
    "Bur Dubai",
    "Al Barsha",
    "Dubai Investment Park",
    "Dubai Silicon Oasis",
    "Dubai South",
    "Al Nahda Dubai",
    "Jumeirah Lake Towers",
    "Business Bay",
    "DIFC",
    "Dubai Hills",
    "Al Qusais",
    "Al Mizhar",
    "International City",
    "Discovery Gardens",
    "Dubai Sports City",
    "Abu Dhabi City",
    "Al Ain",
    "Al Ruwais",
    "Khalifa City",
    "Al Shamkha",
    "Yas Island",
    "Saadiyat Island",
    "Al Reef",
    "Al Rahba",
    "Masdar City",
    "Mohammed Bin Zayed City",
    "Al Falah",
    "Al Mushrif",
    "Tourist Club Area",
    "Sharjah City",
    "Al Nahda Sharjah",
    "Al Qasimia",
    "Al Majaz",
    "Al Khan",
    "Al Taawun",
    "Al Suyoh",
    "Muwaileh",
    "University City Sharjah",
  ];

  return uaeCities.includes(city);
};

export default {
  validateBookingForm,
  calculateBookingCost,
  formatPaymentMethod,
  getPaymentMethodIcon,
  validateCarListingForm,
  validateUAECity,
};
