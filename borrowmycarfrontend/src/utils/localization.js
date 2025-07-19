import i18n from '../i18n';

/**
 * Format currency based on current language
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: AED)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'AED') => {
  const locale = i18n.language === 'ar' ? 'ar-AE' : 'en-AE';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format date based on current language
 * @param {Date|string} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const locale = i18n.language === 'ar' ? 'ar-AE' : 'en-AE';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
};

/**
 * Format date and time based on current language
 * @param {Date|string} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date, options = {}) => {
  const locale = i18n.language === 'ar' ? 'ar-AE' : 'en-AE';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  const locale = i18n.language === 'ar' ? 'ar-AE' : 'en-AE';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  // Use Intl.RelativeTimeFormat for modern browsers
  if (typeof Intl.RelativeTimeFormat !== 'undefined') {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    
    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  }
  
  // Fallback for older browsers
  if (diffInSeconds < 60) {
    return i18n.language === 'ar' ? 'الآن' : 'now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return i18n.language === 'ar' ? `منذ ${minutes} دقيقة` : `${minutes} minutes ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return i18n.language === 'ar' ? `منذ ${hours} ساعة` : `${hours} hours ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return i18n.language === 'ar' ? `منذ ${days} يوم` : `${days} days ago`;
  }
};

/**
 * Format numbers based on current language
 * @param {number} number - The number to format
 * @param {Object} options - Intl.NumberFormat options
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, options = {}) => {
  const locale = i18n.language === 'ar' ? 'ar-AE' : 'en-AE';
  
  return new Intl.NumberFormat(locale, options).format(number);
};

/**
 * Format phone number for display based on current language
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove non-digits
  const digits = phoneNumber.replace(/\D/g, '');
  
  // UAE phone number formatting
  if (digits.startsWith('971')) {
    // International format: +971 XX XXX XXXX
    const match = digits.match(/^971(\d{2})(\d{3})(\d{4})$/);
    if (match) {
      return `+971 ${match[1]} ${match[2]} ${match[3]}`;
    }
  } else if (digits.startsWith('0')) {
    // Local format: 0XX XXX XXXX
    const match = digits.match(/^0(\d{2})(\d{3})(\d{4})$/);
    if (match) {
      return `0${match[1]} ${match[2]} ${match[3]}`;
    }
  }
  
  return phoneNumber; // Return original if no pattern matches
};

/**
 * Format time duration (e.g., "2 hours", "30 minutes")
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
export const formatDuration = (minutes) => {
  const locale = i18n.language === 'ar' ? 'ar-AE' : 'en-AE';
  
  if (minutes < 60) {
    return i18n.language === 'ar' ? `${minutes} دقيقة` : `${minutes} minutes`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return i18n.language === 'ar' ? `${hours} ساعة` : `${hours} hours`;
    } else {
      return i18n.language === 'ar' 
        ? `${hours} ساعة و${remainingMinutes} دقيقة` 
        : `${hours} hours and ${remainingMinutes} minutes`;
    }
  } else {
    const days = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    
    if (remainingHours === 0) {
      return i18n.language === 'ar' ? `${days} يوم` : `${days} days`;
    } else {
      return i18n.language === 'ar' 
        ? `${days} يوم و${remainingHours} ساعة` 
        : `${days} days and ${remainingHours} hours`;
    }
  }
};

/**
 * Format distance based on current language
 * @param {number} distance - Distance in kilometers
 * @param {string} unit - Unit of measurement ('km' or 'mi')
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance, unit = 'km') => {
  const locale = i18n.language === 'ar' ? 'ar-AE' : 'en-AE';
  const formattedDistance = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(distance);
  
  const unitText = unit === 'km' 
    ? (i18n.language === 'ar' ? 'كم' : 'km')
    : (i18n.language === 'ar' ? 'ميل' : 'mi');
  
  return `${formattedDistance} ${unitText}`;
};

/**
 * Format percentage based on current language
 * @param {number} percentage - Percentage value (0-100)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (percentage) => {
  const locale = i18n.language === 'ar' ? 'ar-AE' : 'en-AE';
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(percentage / 100);
};

/**
 * Format file size based on current language
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size string
 */
export const formatFileSize = (bytes) => {
  const locale = i18n.language === 'ar' ? 'ar-AE' : 'en-AE';
  
  if (bytes === 0) return i18n.language === 'ar' ? '0 بايت' : '0 Bytes';
  
  const k = 1024;
  const sizes = i18n.language === 'ar' 
    ? ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت']
    : ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  
  return `${new Intl.NumberFormat(locale).format(size)} ${sizes[i]}`;
};

/**
 * Format rating stars based on current language
 * @param {number} rating - Rating value (0-5)
 * @param {number} totalRatings - Total number of ratings
 * @returns {string} Formatted rating string
 */
export const formatRating = (rating, totalRatings) => {
  const locale = i18n.language === 'ar' ? 'ar-AE' : 'en-AE';
  const formattedRating = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(rating);
  
  const formattedTotal = new Intl.NumberFormat(locale).format(totalRatings);
  
  return i18n.language === 'ar' 
    ? `${formattedRating} من 5 (${formattedTotal} تقييم)`
    : `${formattedRating} out of 5 (${formattedTotal} reviews)`;
};

/**
 * Format list items based on current language
 * @param {Array} items - Array of items to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted list string
 */
export const formatList = (items, options = {}) => {
  const locale = i18n.language === 'ar' ? 'ar-AE' : 'en-AE';
  
  if (typeof Intl.ListFormat !== 'undefined') {
    const defaultOptions = {
      style: 'long',
      type: 'conjunction',
      ...options
    };
    
    return new Intl.ListFormat(locale, defaultOptions).format(items);
  }
  
  // Fallback for older browsers
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) {
    return i18n.language === 'ar' ? `${items[0]} و${items[1]}` : `${items[0]} and ${items[1]}`;
  }
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  const separator = i18n.language === 'ar' ? '، ' : ', ';
  const conjunction = i18n.language === 'ar' ? ' و' : ' and ';
  
  return otherItems.join(separator) + conjunction + lastItem;
};

/**
 * Format car specifications based on current language
 * @param {Object} specs - Car specifications object
 * @returns {Object} Formatted specifications object
 */
export const formatCarSpecs = (specs) => {
  const locale = i18n.language === 'ar' ? 'ar-AE' : 'en-AE';
  
  return {
    year: new Intl.NumberFormat(locale).format(specs.year),
    mileage: specs.mileage ? `${new Intl.NumberFormat(locale).format(specs.mileage)} ${i18n.language === 'ar' ? 'كم' : 'km'}` : '',
    seatingCapacity: specs.seatingCapacity ? `${specs.seatingCapacity} ${i18n.language === 'ar' ? 'مقاعد' : 'seats'}` : '',
    doors: specs.doors ? `${specs.doors} ${i18n.language === 'ar' ? 'أبواب' : 'doors'}` : '',
    engineSize: specs.engineSize ? `${specs.engineSize}${i18n.language === 'ar' ? 'ل' : 'L'}` : '',
    ...specs
  };
};

/**
 * Format booking duration based on current language
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {string} Formatted booking duration
 */
export const formatBookingDuration = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const diffInMs = end - start;
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 1) {
    return i18n.language === 'ar' ? 'يوم واحد' : '1 day';
  } else if (diffInDays < 7) {
    return i18n.language === 'ar' ? `${diffInDays} أيام` : `${diffInDays} days`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    const remainingDays = diffInDays % 7;
    
    if (remainingDays === 0) {
      return i18n.language === 'ar' ? `${weeks} أسبوع` : `${weeks} weeks`;
    } else {
      return i18n.language === 'ar' 
        ? `${weeks} أسبوع و${remainingDays} أيام`
        : `${weeks} weeks and ${remainingDays} days`;
    }
  } else {
    const months = Math.floor(diffInDays / 30);
    const remainingDays = diffInDays % 30;
    
    if (remainingDays === 0) {
      return i18n.language === 'ar' ? `${months} شهر` : `${months} months`;
    } else {
      return i18n.language === 'ar' 
        ? `${months} شهر و${remainingDays} أيام`
        : `${months} months and ${remainingDays} days`;
    }
  }
};

/**
 * Format time in 12/24 hour format based on current language
 * @param {Date|string} time - Time to format
 * @param {boolean} is24Hour - Whether to use 24-hour format
 * @returns {string} Formatted time string
 */
export const formatTime = (time, is24Hour = false) => {
  const locale = i18n.language === 'ar' ? 'ar-AE' : 'en-AE';
  const timeObj = typeof time === 'string' ? new Date(time) : time;
  
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !is24Hour
  };
  
  return new Intl.DateTimeFormat(locale, options).format(timeObj);
};

/**
 * Format short date (e.g., "Jan 15" or "15 يناير")
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted short date string
 */
export const formatShortDate = (date) => {
  const locale = i18n.language === 'ar' ? 'ar-AE' : 'en-AE';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric'
  }).format(dateObj);
};

/**
 * Format month and year (e.g., "January 2024" or "يناير 2024")
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted month and year string
 */
export const formatMonthYear = (date) => {
  const locale = i18n.language === 'ar' ? 'ar-AE' : 'en-AE';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric'
  }).format(dateObj);
};

/**
 * Format day of week (e.g., "Monday" or "الإثنين")
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted day of week string
 */
export const formatDayOfWeek = (date) => {
  const locale = i18n.language === 'ar' ? 'ar-AE' : 'en-AE';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long'
  }).format(dateObj);
};

/**
 * Get localized direction (LTR or RTL)
 * @returns {string} Text direction ('ltr' or 'rtl')
 */
export const getTextDirection = () => {
  return i18n.language === 'ar' ? 'rtl' : 'ltr';
};

/**
 * Check if current language is RTL
 * @returns {boolean} True if RTL, false if LTR
 */
export const isRTL = () => {
  return i18n.language === 'ar';
};

/**
 * Get localized language name
 * @param {string} languageCode - Language code (e.g., 'en', 'ar')
 * @returns {string} Localized language name
 */
export const getLanguageName = (languageCode) => {
  const names = {
    'en': { en: 'English', ar: 'الإنجليزية' },
    'ar': { en: 'Arabic', ar: 'العربية' }
  };
  
  return names[languageCode]?.[i18n.language] || languageCode;
};