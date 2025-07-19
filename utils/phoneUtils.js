// utils/phoneUtils.js - COMPREHENSIVE FIXED VERSION

/**
 * Format UAE phone number to local format (0XXXXXXXXX)
 * @param {string} phone - Input phone number
 * @returns {string} - Formatted phone number in local format
 */
export const formatUAEPhone = (phone) => {
  if (!phone) return phone;

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");

  // If no digits remain, handle edge cases
  if (cleanPhone.length === 0) {
    // Return empty string for whitespace-only input or invalid input
    return phone.trim() === '' ? '' : '';
  }

  // Handle different input formats
  if (cleanPhone.startsWith("971") && cleanPhone.length === 12) {
    // Already has country code: 971501234567 -> 0501234567
    return `0${cleanPhone.substring(3)}`;
  } else if (cleanPhone.startsWith("00971") && cleanPhone.length === 14) {
    // International format: 00971501234567 -> 0501234567
    return `0${cleanPhone.substring(5)}`;
  } else if (cleanPhone.startsWith("0") && (cleanPhone.length === 10 || cleanPhone.length === 9)) {
    // Local format: 0501234567 or 043001234 (already correct)
    return cleanPhone;
  } else if (cleanPhone.length === 9) {
    // Without leading zero: 501234567 -> 0501234567
    return `0${cleanPhone}`;
  } else if (cleanPhone.length === 8) {
    // Landline without leading zero: 43001234 -> 043001234
    return `0${cleanPhone}`;
  }

  // For unclear formats, try to determine if it's a valid pattern
  if (cleanPhone.length === 3 && /^[0-9]{3}$/.test(cleanPhone)) {
    // Short number, return as is
    return cleanPhone;
  }

  // Return empty string for invalid input
  return '';
};

/**
 * Validate UAE phone number against all valid patterns
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
export const validateUAEPhone = (phone) => {
  if (!phone) return false;

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");

  // UAE phone validation patterns
  const validPatterns = [
    // === MOBILE NUMBERS ===
    // Local format (most common from frontend)
    /^05[0-9]{8}$/, // 0501234567, 0551234567, etc.

    // Without leading zero
    /^5[0-9]{8}$/, // 501234567

    // With country code
    /^9715[0-9]{8}$/, // 971501234567

    // International format
    /^009715[0-9]{8}$/, // 00971501234567

    // === LANDLINE NUMBERS ===
    // Dubai (04)
    /^04[0-9]{7}$/, // 041234567
    /^4[0-9]{7}$/, // 41234567 (without leading 0)
    /^9714[0-9]{7}$/, // 97141234567 (with country code)
    /^009714[0-9]{7}$/, // 0097141234567 (international)

    // Abu Dhabi (02)
    /^02[0-9]{7}$/, // 021234567
    /^2[0-9]{7}$/, // 21234567 (without leading 0)
    /^9712[0-9]{7}$/, // 97121234567 (with country code)
    /^009712[0-9]{7}$/, // 0097121234567 (international)

    // Northern Emirates (03, 06, 07, 09)
    /^0[3679][0-9]{7}$/, // 031234567, 061234567, 071234567, 091234567
    /^[3679][0-9]{7}$/, // Without leading 0
    /^971[3679][0-9]{7}$/, // With country code
    /^00971[3679][0-9]{7}$/, // International format
  ];

  const isValid = validPatterns.some((pattern) => pattern.test(cleanPhone));

  // Additional length check for safety
  if (isValid) {
    return cleanPhone.length >= 9 && cleanPhone.length <= 14;
  }

  return false;
};

/**
 * Display UAE phone number in user-friendly local format
 * @param {string} phone - Phone number to format for display
 * @returns {string} - Formatted display phone (e.g., "050 123 4567")
 */
export const displayUAEPhone = (phone) => {
  if (!phone) return phone;

  const cleanPhone = phone.replace(/\D/g, "");

  // Convert to local display format
  if (cleanPhone.startsWith("971") && cleanPhone.length === 12) {
    // From international: 971501234567 -> 050 123 4567
    const localNumber = cleanPhone.substring(3);
    if (localNumber.length === 9) {
      return `0${localNumber.substring(0, 2)} ${localNumber.substring(
        2,
        5
      )} ${localNumber.substring(5)}`;
    }
  } else if (cleanPhone.startsWith("0") && cleanPhone.length === 10) {
    // From local: 0501234567 -> 050 123 4567
    return `${cleanPhone.substring(0, 3)} ${cleanPhone.substring(
      3,
      6
    )} ${cleanPhone.substring(6)}`;
  } else if (cleanPhone.length === 9) {
    // Add leading zero: 501234567 -> 050 123 4567
    return `0${cleanPhone.substring(0, 2)} ${cleanPhone.substring(
      2,
      5
    )} ${cleanPhone.substring(5)}`;
  }

  return phone;
};

/**
 * Get phone number type (mobile, landline, etc.)
 * @param {string} phone - Phone number to analyze
 * @returns {string} - Phone type description
 */
export const getPhoneType = (phone) => {
  if (!phone || !validateUAEPhone(phone)) return "invalid";

  const cleanPhone = phone.replace(/\D/g, "");

  // Extract the significant digits (remove country code and leading zeros)
  let significantDigits = cleanPhone;
  if (cleanPhone.startsWith("00971")) {
    significantDigits = cleanPhone.substring(5);
  } else if (cleanPhone.startsWith("971")) {
    significantDigits = cleanPhone.substring(3);
  } else if (cleanPhone.startsWith("0")) {
    significantDigits = cleanPhone.substring(1);
  }

  // Determine type based on first digit
  const firstDigit = significantDigits.charAt(0);

  switch (firstDigit) {
    case "5":
      return "mobile";
    case "4":
      return "Dubai landline";
    case "2":
      return "Abu Dhabi landline";
    case "3":
      return "Northern Emirates landline";
    case "6":
      return "Al Ain landline";
    case "7":
    case "9":
      return "Other UAE landline";
    default:
      return "unknown";
  }
};

/**
 * Debug function for phone validation
 * @param {string} phone - Phone number to debug
 * @returns {object} - Debug information
 */
export const debugPhoneValidation = (phone) => {
  const cleanPhone = phone ? phone.replace(/\D/g, "") : "";

  const debugInfo = {
    original: phone,
    cleaned: cleanPhone,
    length: cleanPhone.length,
    startsWithZero: cleanPhone.startsWith("0"),
    startsWithCountryCode: cleanPhone.startsWith("971"),
    isValid: validateUAEPhone(phone),
    formatted: formatUAEPhone(phone),
    display: displayUAEPhone(phone),
    type: getPhoneType(phone),
  };

  console.log("Phone Debug Info:", debugInfo);
  return debugInfo;
};

/**
 * Format UAE phone number to international format with country code
 * @param {string} phone - Input phone number
 * @returns {string} - Formatted phone number with +971 prefix
 */
export const formatUAEPhoneInternational = (phone) => {
  if (!phone) return phone;

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");

  // Handle different input formats
  if (cleanPhone.startsWith("971") && cleanPhone.length === 12) {
    // Already has country code: 971501234567
    return `+${cleanPhone}`;
  } else if (cleanPhone.startsWith("00971") && cleanPhone.length === 14) {
    // International format: 00971501234567
    return `+${cleanPhone.substring(2)}`;
  } else if (cleanPhone.startsWith("0") && cleanPhone.length === 10) {
    // Local format: 0501234567 (most common from frontend)
    return `+971${cleanPhone.substring(1)}`;
  } else if (cleanPhone.length === 9) {
    // Without leading zero: 501234567
    return `+971${cleanPhone}`;
  }

  // Return as is if format is unclear
  return phone;
};

/**
 * Normalize phone number for database storage
 * Always stores in +971XXXXXXXXX format
 */
export const normalizePhoneForStorage = (phone) => {
  if (!phone || !validateUAEPhone(phone)) {
    throw new Error("Invalid UAE phone number");
  }
  return formatUAEPhoneInternational(phone);
};

/**
 * Extract local number without country code
 * @param {string} phone - Phone number
 * @returns {string} - Local number (e.g., "0501234567")
 */
export const getLocalNumber = (phone) => {
  if (!phone) return phone;

  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.startsWith("00971")) {
    return `0${cleanPhone.substring(5)}`;
  } else if (cleanPhone.startsWith("971")) {
    return `0${cleanPhone.substring(3)}`;
  } else if (cleanPhone.startsWith("0")) {
    return cleanPhone;
  } else if (cleanPhone.length === 9) {
    return `0${cleanPhone}`;
  }

  return phone;
};
