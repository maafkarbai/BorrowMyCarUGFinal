// components/AvailabilityDatePicker.jsx - Smart date picker with availability restrictions
import React, { useState, useEffect } from "react";
import API from "../api";

const AvailabilityDatePicker = ({
  carId,
  startDate,
  endDate,
  onDateChange,
  onError,
  className = ""
}) => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unavailableDates, setUnavailableDates] = useState([]);

  // Fetch car availability data
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!carId) return;
      
      try {
        setLoading(true);
        const response = await API.get(`/cars/${carId}/availability`);
        const data = response.data.data;
        
        setAvailability(data);
        setUnavailableDates(data.unavailableDates || []);
      } catch (error) {
        console.error("Error fetching availability:", error);
        onError?.("Failed to load availability data");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [carId, onError]);

  // Helper function to check if a date is unavailable
  const isDateUnavailable = (dateString) => {
    if (!availability) return false;
    
    const checkDate = new Date(dateString);
    const availableFrom = new Date(availability.availabilityFrom);
    const availableTo = new Date(availability.availabilityTo);
    
    // Check if outside availability range
    if (checkDate < availableFrom || checkDate > availableTo) {
      return true;
    }
    
    // Check if date falls within any booked period
    return unavailableDates.some(booking => {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      return checkDate >= bookingStart && checkDate <= bookingEnd;
    });
  };

  // Helper function to get the minimum selectable date
  const getMinDate = () => {
    const today = new Date();
    const availableFrom = availability ? new Date(availability.availabilityFrom) : today;
    return availableFrom > today ? availableFrom : today;
  };

  // Helper function to get the maximum selectable date
  const getMaxDate = () => {
    return availability ? new Date(availability.availabilityTo) : null;
  };

  // Helper function to get next available date after a given date
  const getNextAvailableDate = (fromDate) => {
    if (!availability) return null;
    
    const checkDate = new Date(fromDate);
    const maxDate = getMaxDate();
    
    while (checkDate <= maxDate) {
      if (!isDateUnavailable(checkDate.toISOString().split('T')[0])) {
        return checkDate;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }
    
    return null;
  };

  // Handle start date change
  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    
    if (isDateUnavailable(selectedDate)) {
      const nextAvailable = getNextAvailableDate(new Date(selectedDate));
      if (nextAvailable) {
        onDateChange({
          startDate: nextAvailable.toISOString().split('T')[0],
          endDate: endDate
        });
        onError?.(`Selected date was unavailable. Moved to next available: ${nextAvailable.toLocaleDateString()}`);
      } else {
        onError?.("No available dates found after selected date");
      }
      return;
    }
    
    // If end date is before start date or start date is unavailable, clear end date
    let newEndDate = endDate;
    if (endDate && selectedDate >= endDate) {
      newEndDate = "";
    }
    
    onDateChange({
      startDate: selectedDate,
      endDate: newEndDate
    });
  };

  // Handle end date change
  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value;
    
    if (isDateUnavailable(selectedDate)) {
      onError?.("Selected end date is not available");
      return;
    }
    
    // Check if any days between start and end are unavailable
    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(selectedDate);
      const checkDate = new Date(start);
      checkDate.setDate(checkDate.getDate() + 1); // Start checking from day after start date
      
      while (checkDate < end) {
        if (isDateUnavailable(checkDate.toISOString().split('T')[0])) {
          onError?.("There are unavailable dates in the selected range");
          return;
        }
        checkDate.setDate(checkDate.getDate() + 1);
      }
    }
    
    onDateChange({
      startDate,
      endDate: selectedDate
    });
  };

  // Generate disabled dates pattern for input (not all browsers support this)
  const _getDisabledDatesPattern = () => {
    // This is a basic implementation - modern browsers have limited support
    // for disabling specific dates in date inputs
    return "";
  };

  if (loading) {
    return (
      <div className={`space-y-4 sm:space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-16 sm:h-20 bg-gray-200 rounded-xl mb-4 sm:mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="h-12 sm:h-16 bg-gray-200 rounded-xl"></div>
            <div className="h-12 sm:h-16 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!availability) {
    return (
      <div className={`text-red-600 text-sm ${className}`}>
        Unable to load availability data
      </div>
    );
  }

  const minDate = getMinDate()?.toISOString().split('T')[0];
  const maxDate = getMaxDate()?.toISOString().split('T')[0];

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Availability Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 text-sm">
        <div className="font-medium text-blue-800 mb-2">Availability Period</div>
        <div className="text-blue-700 font-medium">
          {new Date(availability.availabilityFrom).toLocaleDateString()} - {new Date(availability.availabilityTo).toLocaleDateString()}
        </div>
        {unavailableDates.length > 0 && (
          <div className="mt-3 text-blue-600">
            {unavailableDates.length} booking{unavailableDates.length !== 1 ? 's' : ''} during this period
          </div>
        )}
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            min={minDate}
            max={maxDate}
            className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors text-sm sm:text-base touch-manipulation"
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            min={startDate || minDate}
            max={maxDate}
            disabled={!startDate}
            className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation"
            required
          />
        </div>
      </div>

      {/* Booking Constraints Info */}
      <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
        <div className="text-sm font-medium text-gray-700 mb-3">Rental Information</div>
        <div className="text-xs sm:text-sm text-gray-600 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></span>
            <span>Minimum rental: {availability.minimumRentalDays} day{availability.minimumRentalDays !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></span>
            <span>Maximum rental: {availability.maximumRentalDays} day{availability.maximumRentalDays !== 1 ? 's' : ''}</span>
          </div>
          {unavailableDates.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></span>
              <span>Some dates may be unavailable due to existing bookings</span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Calendar Legend */}
      {unavailableDates.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-5">
          <div className="text-sm font-medium text-orange-800 mb-3">Unavailable Periods</div>
          <div className="space-y-2 sm:space-y-3">
            {unavailableDates.slice(0, 3).map((booking, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs sm:text-sm">
                <span className="text-gray-700 font-medium">
                  {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                </span>
                <span className="capitalize text-orange-600 font-medium px-2 py-1 bg-orange-100 rounded-full text-xs sm:text-sm">
                  {booking.status}
                </span>
              </div>
            ))}
            {unavailableDates.length > 3 && (
              <div className="text-orange-600 italic text-xs sm:text-sm pt-2 border-t border-orange-200">
                +{unavailableDates.length - 3} more booking{unavailableDates.length - 3 !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityDatePicker;