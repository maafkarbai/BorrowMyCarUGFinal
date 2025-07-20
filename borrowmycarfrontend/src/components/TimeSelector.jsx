import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";

const TimeSelector = ({
  pickupTime,
  returnTime,
  onTimeChange,
  onError,
  className = "",
  selectedDate = null,
  bookingStartDate = null,
  bookingEndDate = null,
}) => {
  const [localPickupTime, setLocalPickupTime] = useState(pickupTime || "10:00");
  const [localReturnTime, setLocalReturnTime] = useState(returnTime || "18:00");
  const [errors, setErrors] = useState({});

  // Generate time options (24-hour format)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = formatTime12Hour(timeString);
        times.push({ value: timeString, label: displayTime });
      }
    }
    return times;
  };

  // Format time to 12-hour format for display
  const formatTime12Hour = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Validate time selection
  const validateTimes = (pickup, returnTime) => {
    const newErrors = {};
    
    if (!pickup || !returnTime) {
      newErrors.general = "Both pickup and return times are required";
      return newErrors;
    }

    const pickupMinutes = convertTimeToMinutes(pickup);
    const returnMinutes = convertTimeToMinutes(returnTime);
    
    if (returnMinutes <= pickupMinutes) {
      newErrors.returnTime = "Return time must be after pickup time";
    }

    const minRentalHours = 2;
    const timeDifferenceHours = (returnMinutes - pickupMinutes) / 60;
    
    if (timeDifferenceHours < minRentalHours) {
      newErrors.general = `Minimum rental duration is ${minRentalHours} hours`;
    }

    // Validate against booking date range if provided
    if (bookingStartDate && bookingEndDate && selectedDate) {
      const currentDate = new Date(selectedDate);
      const startDate = new Date(bookingStartDate);
      const endDate = new Date(bookingEndDate);
      
      // Check if current date is within booking range
      if (currentDate < startDate || currentDate > endDate) {
        newErrors.general = `Meeting date must be within your booking period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      }
      
      // If it's the start date, pickup time should be reasonable
      if (currentDate.toDateString() === startDate.toDateString()) {
        const now = new Date();
        if (currentDate.toDateString() === now.toDateString()) {
          // Same day booking - pickup time should be in the future
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          if (pickupMinutes <= currentMinutes + 60) { // At least 1 hour from now
            newErrors.pickupTime = "Pickup time should be at least 1 hour from now";
          }
        }
      }
      
      // If it's the end date, return time should be before end of day
      if (currentDate.toDateString() === endDate.toDateString()) {
        if (returnMinutes > 23 * 60 + 30) { // After 11:30 PM
          newErrors.returnTime = "Return time on the last day should be before 11:30 PM";
        }
      }
    }

    return newErrors;
  };

  // Convert time string to minutes for comparison
  const convertTimeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Calculate rental duration
  const calculateDuration = (pickup, returnTime) => {
    if (!pickup || !returnTime) return '';
    
    const pickupMinutes = convertTimeToMinutes(pickup);
    const returnMinutes = convertTimeToMinutes(returnTime);
    const durationMinutes = returnMinutes - pickupMinutes;
    
    if (durationMinutes <= 0) return '';
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minutes`;
    }
  };

  // Handle time changes
  const handleTimeChange = (timeType, value) => {
    let newPickup = timeType === 'pickup' ? value : localPickupTime;
    let newReturn = timeType === 'return' ? value : localReturnTime;

    // Auto-adjust return time if pickup time is changed and return time is before pickup
    if (timeType === 'pickup') {
      const pickupMinutes = convertTimeToMinutes(value);
      const returnMinutes = convertTimeToMinutes(localReturnTime);
      
      if (returnMinutes <= pickupMinutes) {
        // Set return time to 2 hours after pickup time
        const newReturnMinutes = pickupMinutes + 120;
        const newReturnHours = Math.floor(newReturnMinutes / 60);
        const newReturnMins = newReturnMinutes % 60;
        
        // Don't exceed 23:30
        if (newReturnHours <= 23) {
          newReturn = `${newReturnHours.toString().padStart(2, '0')}:${newReturnMins.toString().padStart(2, '0')}`;
        } else {
          newReturn = "23:30";
        }
      }
    }

    setLocalPickupTime(newPickup);
    setLocalReturnTime(newReturn);

    // Validate and update parent component
    const validationErrors = validateTimes(newPickup, newReturn);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onTimeChange({
        pickupTime: newPickup,
        returnTime: newReturn,
        duration: calculateDuration(newPickup, newReturn)
      });
      if (onError) onError("");
    } else {
      if (onError) onError(Object.values(validationErrors)[0]);
    }
  };

  // Initialize times on component mount
  useEffect(() => {
    if (pickupTime && returnTime) {
      setLocalPickupTime(pickupTime);
      setLocalReturnTime(returnTime);
    }
  }, [pickupTime, returnTime]);

  const timeOptions = generateTimeOptions();
  const duration = calculateDuration(localPickupTime, localReturnTime);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Select Pickup & Return Times</h3>
      </div>

      {selectedDate && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-800">
            Selected Date: {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      )}

      {bookingStartDate && bookingEndDate && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <h4 className="text-sm font-medium text-green-800 mb-1">Booking Period</h4>
          <p className="text-xs text-green-700">
            {new Date(bookingStartDate).toLocaleDateString()} - {new Date(bookingEndDate).toLocaleDateString()}
          </p>
          <p className="text-xs text-green-600 mt-1">
            Meeting times must be within this period
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pickup Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Time
          </label>
          <select
            value={localPickupTime}
            onChange={(e) => handleTimeChange('pickup', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.pickupTime ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {timeOptions.map((time) => (
              <option key={time.value} value={time.value}>
                {time.label}
              </option>
            ))}
          </select>
          {errors.pickupTime && (
            <p className="mt-1 text-sm text-red-600">{errors.pickupTime}</p>
          )}
        </div>

        {/* Return Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Return Time
          </label>
          <select
            value={localReturnTime}
            onChange={(e) => handleTimeChange('return', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.returnTime ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {timeOptions.map((time) => (
              <option key={time.value} value={time.value}>
                {time.label}
              </option>
            ))}
          </select>
          {errors.returnTime && (
            <p className="mt-1 text-sm text-red-600">{errors.returnTime}</p>
          )}
        </div>
      </div>

      {/* Duration Display */}
      {duration && !errors.general && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <span className="font-medium">Rental Duration:</span> {duration}
          </p>
        </div>
      )}

      {/* Error Messages */}
      {errors.general && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      {/* Time Guidelines */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Booking Guidelines:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Minimum rental duration: 2 hours</li>
          <li>• Available times: 6:00 AM - 11:30 PM</li>
          <li>• Return time must be after pickup time</li>
          <li>• Times are shown in 30-minute intervals</li>
          {bookingStartDate && bookingEndDate && (
            <li>• Meeting times must be within your booking period</li>
          )}
          <li>• Same-day pickups require at least 1 hour advance notice</li>
        </ul>
      </div>
    </div>
  );
};

export default TimeSelector;