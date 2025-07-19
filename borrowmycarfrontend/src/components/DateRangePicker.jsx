import React, { useState, useEffect } from 'react';
import API from '../api';

const CarDateRangePicker = ({
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
  const [blockedDates, setBlockedDates] = useState(new Set());

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayFormatted = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Format date for display (MMM D, YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate days between dates
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Check if date is blocked
  const isDateBlocked = (dateString) => {
    return blockedDates.has(dateString);
  };

  // Generate all dates between two dates
  const generateDateRange = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

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
        
        // Generate blocked dates set
        const blocked = new Set();
        
        const availableFrom = new Date(data.availabilityFrom);
        const availableTo = new Date(data.availabilityTo);
        const today = new Date();
        
        // Block past dates (before today)
        const pastDate = new Date('2020-01-01');
        while (pastDate < today) {
          blocked.add(pastDate.toISOString().split('T')[0]);
          pastDate.setDate(pastDate.getDate() + 1);
        }
        
        // Block dates before availability starts
        const beforeAvailable = new Date(today);
        while (beforeAvailable < availableFrom) {
          blocked.add(beforeAvailable.toISOString().split('T')[0]);
          beforeAvailable.setDate(beforeAvailable.getDate() + 1);
        }
        
        // Block dates after availability ends
        const afterAvailable = new Date(availableTo);
        afterAvailable.setDate(afterAvailable.getDate() + 1);
        const futureLimit = new Date();
        futureLimit.setFullYear(futureLimit.getFullYear() + 2);
        
        while (afterAvailable < futureLimit) {
          blocked.add(afterAvailable.toISOString().split('T')[0]);
          afterAvailable.setDate(afterAvailable.getDate() + 1);
        }
        
        // Block booked dates
        data.unavailableDates?.forEach(booking => {
          const bookingDates = generateDateRange(booking.startDate, booking.endDate);
          bookingDates.forEach(date => blocked.add(date));
        });
        
        setBlockedDates(blocked);
      } catch (error) {
        console.error("Error fetching availability:", error);
        onError?.("Failed to load availability data");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [carId, onError]);

  // Handle date changes
  const handleDateChange = (field, value) => {
    const newDates = {
      startDate: field === 'startDate' ? value : startDate,
      endDate: field === 'endDate' ? value : endDate
    };

    // Validation
    if (newDates.startDate && newDates.endDate) {
      // Check if end date is before start date
      if (new Date(newDates.endDate) <= new Date(newDates.startDate)) {
        onError?.("End date must be after start date");
        return;
      }

      // Check if any date in the range is blocked
      const dateRange = generateDateRange(newDates.startDate, newDates.endDate);
      const hasBlockedDate = dateRange.some(date => isDateBlocked(date));
      
      if (hasBlockedDate) {
        onError?.("Selected date range contains unavailable dates. Please select a different range.");
        return;
      }

      // Check minimum rental days
      const days = calculateDays(newDates.startDate, newDates.endDate);
      const minDays = availability?.minimumRentalDays || 1;
      if (days < minDays) {
        onError?.(`Minimum rental period is ${minDays} day${minDays !== 1 ? 's' : ''}`);
        return;
      }

      // Check maximum rental days
      const maxDays = availability?.maximumRentalDays || 30;
      if (days > maxDays) {
        onError?.(`Maximum rental period is ${maxDays} day${maxDays !== 1 ? 's' : ''}`);
        return;
      }
    }

    onDateChange(newDates);
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
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

  const minDate = availability.availabilityFrom > getTodayFormatted() 
    ? availability.availabilityFrom 
    : getTodayFormatted();
  const maxDate = availability.availabilityTo;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Availability Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <div className="font-medium text-blue-800 mb-1">Availability Period</div>
        <div className="text-blue-700">
          {formatDateForDisplay(availability.availabilityFrom)} - {formatDateForDisplay(availability.availabilityTo)}
        </div>
        {unavailableDates.length > 0 && (
          <div className="mt-2 text-blue-600">
            {unavailableDates.length} booking{unavailableDates.length !== 1 ? 's' : ''} during this period
          </div>
        )}
      </div>

      {/* Date Range Picker */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Your Rental Dates
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formatDateForInput(startDate)}
              min={minDate}
              max={maxDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={formatDateForInput(endDate)}
              min={startDate || minDate}
              max={maxDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Selected Dates Display */}
      {startDate && endDate && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-sm font-medium text-green-800 mb-1">Selected Dates</div>
          <div className="text-green-700">
            {formatDateForDisplay(startDate)} - {formatDateForDisplay(endDate)}
          </div>
          <div className="text-green-600 text-sm mt-1">
            {calculateDays(startDate, endDate)} day{calculateDays(startDate, endDate) !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Booking Constraints Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>• Minimum rental: {availability.minimumRentalDays || 1} day{(availability.minimumRentalDays || 1) !== 1 ? 's' : ''}</div>
        <div>• Maximum rental: {availability.maximumRentalDays || 30} day{(availability.maximumRentalDays || 30) !== 1 ? 's' : ''}</div>
        <div>• Dates outside availability period are automatically blocked</div>
        <div>• Booked dates cannot be selected</div>
      </div>

      {/* Unavailable Periods List */}
      {unavailableDates.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Unavailable Periods:</div>
          <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
            {unavailableDates.map((booking, index) => (
              <div key={index} className="flex justify-between text-gray-600">
                <span>
                  {formatDateForDisplay(booking.startDate)} - {formatDateForDisplay(booking.endDate)}
                </span>
                <span className="capitalize text-orange-600 font-medium">
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CarDateRangePicker;