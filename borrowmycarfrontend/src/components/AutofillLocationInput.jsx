import React, { useState, useRef, useEffect } from "react";
import { MapPin, Navigation, Search, X, Target, Clock } from "lucide-react";
import { useLocationAutofill } from "../hooks/useLocationAutofill";

const AutofillLocationInput = ({
  value = "",
  onChange,
  placeholder = "Search for a location in UAE...",
  showCurrentLocation = true,
  showQuickSuggestions = true,
  showRecentLocations = true,
  className = "",
  required = false,
  label = "",
  error = "",
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef(null);
  const suggestionTimeoutRef = useRef(null);

  // Use the location autofill hook
  const {
    currentLocation,
    recentLocations,
    isGettingLocation,
    searchLocations,
    autoFillCurrentLocation,
    saveToRecentLocations,
    getQuickSuggestions,
  } = useLocationAutofill();

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounced search for suggestions
  useEffect(() => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    if (inputValue.length >= 2) {
      suggestionTimeoutRef.current = setTimeout(() => {
        searchSuggestions(inputValue);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, [inputValue]);

  const searchSuggestions = async (query) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const results = await searchLocations(query);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error searching suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await autoFillCurrentLocation();
      if (location) {
        handleLocationSelect(location);
      }
    } catch (error) {
      console.error("Geolocation error:", error);
      alert("Unable to get your current location. Please try again.");
    }
  };

  const handleLocationSelect = (location) => {
    const locationString = location.name || location.address || location.text;
    setInputValue(locationString);
    setShowSuggestions(false);
    onChange(location);

    // Save to recent locations
    saveToRecentLocations(location);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // If input is cleared, reset onChange
    if (!newValue.trim()) {
      onChange("");
    }
  };

  const handleInputFocus = () => {
    if (inputValue.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const clearInput = () => {
    setInputValue("");
    setShowSuggestions(false);
    onChange("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const quickSuggestions = getQuickSuggestions();

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="flex items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              required={required}
              className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                error ? "border-red-500" : "border-gray-300"
              }`}
            />

            {inputValue && (
              <button
                type="button"
                onClick={clearInput}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {showCurrentLocation && (
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="ml-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Use current location"
            >
              {isGettingLocation ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Target className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-80 rounded-lg border border-gray-200 overflow-auto">
            {isLoading && (
              <div className="px-4 py-3 text-center text-gray-500">
                <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2" />
                Searching...
              </div>
            )}

            {/* Current Location */}
            {currentLocation && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  CURRENT LOCATION
                </div>
                <button
                  type="button"
                  onClick={() => getCurrentLocation()}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center"
                >
                  <Navigation className="h-4 w-4 text-blue-500 mr-3" />
                  <div>
                    <div className="font-medium">Use Current Location</div>
                    <div className="text-sm text-gray-500">
                      Auto-detect your location
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Recent Locations */}
            {showRecentLocations && recentLocations.length > 0 && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  RECENT LOCATIONS
                </div>
                {recentLocations.map((location, index) => (
                  <button
                    key={`recent-${index}`}
                    type="button"
                    onClick={() => handleLocationSelect(location)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center"
                  >
                    <Clock className="h-4 w-4 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <div className="font-medium">{location.name}</div>
                      {location.city && (
                        <div className="text-sm text-gray-500">
                          {location.city}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Suggestions */}
            {showQuickSuggestions && inputValue.length < 2 && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  POPULAR LOCATIONS
                </div>
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={`quick-${index}`}
                    type="button"
                    onClick={() => handleLocationSelect(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center"
                  >
                    <MapPin className="h-4 w-4 text-green-500 mr-3" />
                    <div>
                      <div className="font-medium">{suggestion.name}</div>
                      <div className="text-sm text-gray-500">
                        {suggestion.city}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Search Results */}
            {suggestions.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  SEARCH RESULTS
                </div>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleLocationSelect(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center"
                  >
                    <Search className="h-4 w-4 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <div className="font-medium">{suggestion.text}</div>
                      <div className="text-sm text-gray-500">
                        {suggestion.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!isLoading && suggestions.length === 0 && inputValue.length >= 2 && (
              <div className="px-4 py-8 text-center text-gray-500">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <div>No locations found</div>
                <div className="text-sm">Try a different search term</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutofillLocationInput;