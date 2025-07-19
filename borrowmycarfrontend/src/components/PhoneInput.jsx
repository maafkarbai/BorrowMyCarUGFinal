// src/components/PhoneInput.jsx - Create this new component file
import { useState } from "react";

const PhoneInput = ({
  value,
  onChange,
  error,
  placeholder = "0501234567",
  required = false,
  className = "",
  label,
  disabled = false,
}) => {
  const [focused, setFocused] = useState(false);

  const formatPhoneDisplay = (phone) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");

    // Format as XXX XXX XXXX for display
    if (digits.length >= 10) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(
        6,
        10
      )}`;
    } else if (digits.length >= 6) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    } else if (digits.length >= 3) {
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    }
    return digits;
  };

  const handleInputChange = (e) => {
    const input = e.target.value;

    // Remove all non-digit characters
    let digits = input.replace(/\D/g, "");

    // Handle different input formats
    if (digits.startsWith("971") && digits.length >= 12) {
      // International format: 971501234567 -> 0501234567
      digits = "0" + digits.substring(3, 12);
    } else if (digits.startsWith("00971") && digits.length >= 14) {
      // International format: 00971501234567 -> 0501234567
      digits = "0" + digits.substring(5, 14);
    } else if (digits.length > 0 && !digits.startsWith("0")) {
      // Local without leading zero: 501234567 -> 0501234567
      digits = "0" + digits.slice(0, 9);
    }

    // Limit to 10 digits (including leading 0)
    const formattedValue = digits.slice(0, 10);

    onChange(formattedValue);
  };

  const getDisplayValue = () => {
    if (!value) return "";

    // During focus, show unformatted for easier editing
    if (focused) {
      return value;
    }

    // When not focused, show formatted for better readability
    return formatPhoneDisplay(value);
  };

  const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, "");

    // UAE mobile numbers start with 05X and are 10 digits total
    const validPatterns = [
      /^05[0-9]{8}$/, // 0501234567 - UAE mobile format
      /^04[0-9]{7}$/, // 041234567 - UAE landline format (Dubai)
      /^02[0-9]{7}$/, // 021234567 - UAE landline format (Abu Dhabi)
      /^03[0-9]{7}$/, // 031234567 - UAE landline format (Northern Emirates)
      /^06[0-9]{7}$/, // 061234567 - UAE landline format (Al Ain)
      /^07[0-9]{7}$/, // 071234567 - UAE landline format (Other)
      /^09[0-9]{7}$/, // 091234567 - UAE landline format (Other)
    ];

    return validPatterns.some((pattern) => pattern.test(digits));
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    // Remove all non-digit characters
    let digits = pastedText.replace(/\D/g, "");

    // Handle different input formats
    if (digits.startsWith("971") && digits.length >= 12) {
      // International format: 971501234567 -> 0501234567
      digits = "0" + digits.substring(3, 12);
    } else if (digits.startsWith("00971") && digits.length >= 14) {
      // International format: 00971501234567 -> 0501234567
      digits = "0" + digits.substring(5, 14);
    } else if (digits.length > 0 && !digits.startsWith("0")) {
      // Local without leading zero: 501234567 -> 0501234567
      digits = "0" + digits.slice(0, 9);
    }

    // Limit to 10 digits (including leading 0)
    const formattedValue = digits.slice(0, 10);

    onChange(formattedValue);
  };

  const isValid = value ? validatePhone(value) : true;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative" onClick={(e) => {
        if (!disabled) {
          const input = e.currentTarget.querySelector('input');
          if (input) input.focus();
        }
      }}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 text-sm">🇦🇪 +971</span>
        </div>
        <input
          type="text"
          value={getDisplayValue()}
          onChange={handleInputChange}
          onPaste={handlePaste}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full pl-20 pr-4 py-3 border rounded-lg text-sm
            focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none
            transition-colors
            ${error ? "border-red-500 bg-red-50" : "border-gray-300"}
            ${!isValid && value ? "border-orange-400 bg-orange-50" : ""}
            ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
            ${className}
          `}
        />
        {value && isValid && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-green-500 text-sm">✓</span>
          </div>
        )}
      </div>

      {/* Helper text */}
      <div className="text-xs space-y-1">
        {error && <p className="text-red-600">{error}</p>}
        {!error && value && !isValid && (
          <p className="text-orange-600">
            Please enter a valid UAE phone number
          </p>
        )}
        {!error && !value && (
          <p className="text-gray-500">
            Enter your UAE phone number (e.g., 0501234567)
          </p>
        )}
      </div>

      {/* Format examples */}
      {focused && !value && (
        <div className="text-xs text-gray-400 space-y-1">
          <p className="font-medium">Accepted formats:</p>
          <ul className="space-y-0.5 ml-2">
            <li>• Mobile: 0501234567, 0551234567</li>
            <li>• Landline: 043001234, 026001234</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
