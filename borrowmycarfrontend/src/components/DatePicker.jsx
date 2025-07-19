import React, { useState, useEffect, useRef } from "react";
import API from "../api";

const DatePicker = ({
  carId,
  startDate,
  endDate,
  onDateChange,
  onError,
  className = "",
}) => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(
    startDate ? new Date(startDate) : null
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    endDate ? new Date(endDate) : null
  );
  const [hoverDate, setHoverDate] = useState(null);
  const [selectingEndDate, setSelectingEndDate] = useState(false);
  const containerRef = useRef(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const formatDate = (date) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateRange = () => {
    if (!selectedStartDate && !selectedEndDate) return "Select dates";
    if (selectedStartDate && !selectedEndDate) return `${formatDate(selectedStartDate)} - Select end date`;
    if (selectedStartDate && selectedEndDate) {
      const days = Math.ceil((selectedEndDate - selectedStartDate) / (1000 * 60 * 60 * 24));
      return `${formatDate(selectedStartDate)} - ${formatDate(selectedEndDate)} (${days} day${days !== 1 ? 's' : ''})`;
    }
    return "Select dates";
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateUnavailable = (date) => {
    if (!availability) return false;
    
    const availableFrom = new Date(availability.availabilityFrom);
    const availableTo = new Date(availability.availabilityTo);
    
    if (date < availableFrom || date > availableTo) return true;
    
    return unavailableDates.some((booking) => {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      return date >= bookingStart && date <= bookingEnd;
    });
  };

  const isInSelectedRange = (date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date >= selectedStartDate && date <= selectedEndDate;
  };

  const isInHoverRange = (date) => {
    if (!selectedStartDate || !hoverDate || selectedEndDate) return false;
    const start = selectedStartDate;
    const end = hoverDate;
    return date >= Math.min(start, end) && date <= Math.max(start, end);
  };

  const isStartDate = (date) => {
    return selectedStartDate && date.toDateString() === selectedStartDate.toDateString();
  };

  const isEndDate = (date) => {
    return selectedEndDate && date.toDateString() === selectedEndDate.toDateString();
  };

  const getCalendarDays = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  };

  const handleDateClick = (date) => {
    if (isPastDate(date) || isDateUnavailable(date)) return;

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start new selection
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      setSelectingEndDate(true);
    } else if (selectingEndDate) {
      if (date < selectedStartDate) {
        // Selected date is before start date, make it the new start date
        setSelectedStartDate(date);
        setSelectedEndDate(null);
      } else {
        // Check if range contains any unavailable dates
        const range = [];
        const curr = new Date(selectedStartDate);
        while (curr <= date) {
          range.push(new Date(curr));
          curr.setDate(curr.getDate() + 1);
        }
        
        if (range.some(isDateUnavailable)) {
          onError?.("Selected date range contains unavailable dates.");
          return;
        }
        
        setSelectedEndDate(date);
        setSelectingEndDate(false);
        
        // Call onDateChange with the selected range
        setTimeout(() => {
          onDateChange({
            startDate: selectedStartDate.toISOString().split("T")[0],
            endDate: date.toISOString().split("T")[0],
          });
          setIsOpen(false);
        }, 300);
      }
    }
  };

  const handleMouseEnter = (date) => {
    if (selectingEndDate && selectedStartDate && !selectedEndDate) {
      setHoverDate(date);
    }
  };

  const handleMouseLeave = () => {
    if (selectingEndDate && selectedStartDate && !selectedEndDate) {
      setHoverDate(null);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const clearSelection = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setSelectingEndDate(false);
    setHoverDate(null);
    onDateChange({ startDate: "", endDate: "" });
  };

  const getDayButtonClass = (date) => {
    if (!date) return "invisible";
    
    let classes = "w-10 h-10 flex items-center justify-center text-sm font-medium transition-all duration-200 relative ";
    
    if (isPastDate(date) || isDateUnavailable(date)) {
      classes += "text-gray-300 cursor-not-allowed line-through";
    } else if (isStartDate(date) || isEndDate(date)) {
      classes += "bg-blue-600 text-white rounded-full font-semibold shadow-md";
    } else if (isInSelectedRange(date) || isInHoverRange(date)) {
      classes += "bg-blue-100 text-blue-700 rounded-lg";
    } else if (isToday(date)) {
      classes += "bg-gray-100 text-gray-900 rounded-lg font-semibold border-2 border-blue-200";
    } else {
      classes += "text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer";
    }
    
    return classes;
  };

  // Event handlers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!carId) return;
      
      try {
        setLoading(true);
        const response = await API.get(`/cars/${carId}/availability`);
        const data = response.data.data;
        setAvailability(data);
        setUnavailableDates(data.unavailableDates || []);
      } catch (err) {
        console.error("Error fetching availability:", err);
        onError?.("Failed to load availability data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailability();
  }, [carId, onError]);

  useEffect(() => {
    setSelectedStartDate(startDate ? new Date(startDate) : null);
    setSelectedEndDate(endDate ? new Date(endDate) : null);
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse h-14 bg-gray-200 rounded-xl" />
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

  const calendarDays = getCalendarDays(currentMonth.getMonth(), currentMonth.getFullYear());
  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  const nextCalendarDays = getCalendarDays(nextMonth.getMonth(), nextMonth.getFullYear());

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Date Input Display */}
      <div 
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white cursor-pointer transition-all duration-200 hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-700 font-medium">
              {formatDateRange()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {(selectedStartDate || selectedEndDate) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-6 min-w-max">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Select dates</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Current Month */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h4 className="text-lg font-semibold text-gray-800">
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h4>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => date && handleDateClick(date)}
                    onMouseEnter={() => date && handleMouseEnter(date)}
                    onMouseLeave={handleMouseLeave}
                    className={getDayButtonClass(date)}
                    disabled={!date || isPastDate(date) || isDateUnavailable(date)}
                  >
                    {date ? date.getDate() : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Month */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h4 className="text-lg font-semibold text-gray-800">
                  {months[nextMonth.getMonth()]} {nextMonth.getFullYear()}
                </h4>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {nextCalendarDays.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => date && handleDateClick(date)}
                    onMouseEnter={() => date && handleMouseEnter(date)}
                    onMouseLeave={handleMouseLeave}
                    className={getDayButtonClass(date)}
                    disabled={!date || isPastDate(date) || isDateUnavailable(date)}
                  >
                    {date ? date.getDate() : ""}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <span className="text-gray-600">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded border border-blue-200"></div>
                <span className="text-gray-600">In range</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded border-2 border-blue-200"></div>
                <span className="text-gray-600">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded text-gray-300 flex items-center justify-center text-xs">
                  <span className="line-through">×</span>
                </div>
                <span className="text-gray-600">Unavailable</span>
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          {selectedStartDate && selectedEndDate && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    Selected: {formatDateRange()}
                  </p>
                </div>
                <button
                  onClick={clearSelection}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePicker;