// utils/errorHandler.js (Enhanced)

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle specific MongoDB errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400, "INVALID_ID");
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${
    field.charAt(0).toUpperCase() + field.slice(1)
  } '${value}' already exists`;
  return new AppError(message, 400, "DUPLICATE_FIELD");
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join(". ")}`;
  return new AppError(message, 400, "VALIDATION_ERROR");
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401, "INVALID_TOKEN");

const handleJWTExpiredError = () =>
  new AppError(
    "Your token has expired! Please log in again.",
    401,
    "TOKEN_EXPIRED"
  );

// Handle Multer errors
const handleMulterError = (err) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return new AppError(
      "File size too large. Maximum 5MB allowed.",
      400,
      "FILE_TOO_LARGE"
    );
  }
  if (err.code === "LIMIT_FILE_COUNT") {
    return new AppError(
      "Too many files. Maximum 10 files allowed.",
      400,
      "TOO_MANY_FILES"
    );
  }
  if (err.code === "INVALID_FILE_TYPE") {
    return new AppError(err.message, 400, "INVALID_FILE_TYPE");
  }
  return new AppError(err.message, 400, "FILE_UPLOAD_ERROR");
};

// Development error response
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    code: err.code,
    stack: err.stack,
  });
};

// Production error response
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error("ERROR 💥:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

// Global error handling middleware
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    if (error.name === "MulterError" || error.code === "INVALID_FILE_TYPE") {
      error = handleMulterError(error);
    }

    sendErrorProd(error, res);
  }
};

// Async error wrapper
export const handleAsyncError = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
