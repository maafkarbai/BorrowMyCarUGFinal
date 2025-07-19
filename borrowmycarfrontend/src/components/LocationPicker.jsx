import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, X } from "lucide-react";
import LocationAutocomplete from './LocationAutocomplete';

const LocationPicker = ({
  onLocationSelect,
  initialLocation = null,
  placeholder = "Search for a location in Dubai...",
  showCurrentLocation = true,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [showMap, setShowMap] = useState(false);
  const [inputMode, setInputMode] = useState('search'); // 'search' or 'coordinates'
  const [manualCoords, setManualCoords] = useState({ lat: '', lng: '' });

  const dubaiCities = [
    { name: 'Downtown Dubai', coordinates: [55.2744, 25.1972] },
    { name: 'Dubai Marina', coordinates: [55.1415, 25.0805] },
    { name: 'Business Bay', coordinates: [55.2634, 25.1867] },
    { name: 'Jumeirah', coordinates: [55.2408, 25.2285] },
    { name: 'Deira', coordinates: [55.3047, 25.2694] },
    { name: 'Bur Dubai', coordinates: [55.2962, 25.2632] },
    { name: 'Al Barsha', coordinates: [55.1952, 25.1124] },
    { name: 'Dubai International City', coordinates: [55.4197, 25.1657] }
  ];

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect({
        name: location.name,
        coordinates: [location.lng, location.lat],
        address: location.address || {},
        city: location.address?.city || 'Dubai',
      });
    }
  };

  const handleManualCoordsSubmit = () => {
    const lat = parseFloat(manualCoords.lat);
    const lng = parseFloat(manualCoords.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid coordinates');
      return;
    }

    if (lat < 24.5 || lat > 25.5 || lng < 54.5 || lng > 55.8) {
      alert('Coordinates must be within Dubai area');
      return;
    }

    const location = {
      name: `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      lat,
      lng,
      address: { manual: true }
    };

    handleLocationSelect(location);
    setManualCoords({ lat: '', lng: '' });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { longitude, latitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();
          
          const location = {
            name: data.display_name || `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            lat: latitude,
            lng: longitude,
            address: data.address || { current: true }
          };

          handleLocationSelect(location);
        } catch (error) {
          console.error('Error getting address:', error);
          const location = {
            name: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            lat: latitude,
            lng: longitude,
            address: { current: true }
          };
          handleLocationSelect(location);
        }

        setIsLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLoading(false);
        
        let message = "Unable to get your current location.";
        if (error.code === 1) {
          message = "Location access denied. Please enable location services and try again.";
        } else if (error.code === 2) {
          message = "Location unavailable. Please check your internet connection and try again.";
        } else if (error.code === 3) {
          message = "Location request timeout. Please try again.";
        }
        
        alert(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  };

  const clearSelection = () => {
    setSelectedLocation(null);
    if (onLocationSelect) {
      onLocationSelect(null);
    }
  };

  const handleCitySelect = (city) => {
    const location = {
      name: city.name,
      lat: city.coordinates[1],
      lng: city.coordinates[0],
      address: { city: city.name, area: city.name }
    };
    handleLocationSelect(location);
  };

  useEffect(() => {
    setSelectedLocation(initialLocation);
  }, [initialLocation]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Location Display */}
      <div className="relative">
        <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg bg-white">
          <MapPin className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            {selectedLocation ? (
              <div>
                <p className="font-medium text-gray-900">
                  {selectedLocation.name}
                </p>
                {selectedLocation.address?.city && (
                  <p className="text-sm text-gray-600">
                    {selectedLocation.address.city}, UAE
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">{placeholder}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {showCurrentLocation && (
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLoading}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                title="Auto-fill current location"
              >
                {isLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Open location picker"
            >
              <Search className="w-4 h-4" />
            </button>

            {selectedLocation && (
              <button
                type="button"
                onClick={clearSelection}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Location Picker */}
      {showMap && (
        <div className="relative border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Select Location</h3>
            <button
              onClick={() => setShowMap(false)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Input Mode Toggle */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setInputMode('search')}
              className={`px-3 py-1 rounded text-sm ${
                inputMode === 'search' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Search
            </button>
            <button
              onClick={() => setInputMode('coordinates')}
              className={`px-3 py-1 rounded text-sm ${
                inputMode === 'coordinates' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Coordinates
            </button>
          </div>

          {/* Search Mode */}
          {inputMode === 'search' && (
            <div className="space-y-3">
              <LocationAutocomplete
                onLocationSelect={handleLocationSelect}
                value={selectedLocation?.name || ''}
                placeholder="Search for a location in Dubai"
              />
            </div>
          )}

          {/* Coordinates Mode */}
          {inputMode === 'coordinates' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude (e.g., 25.2048)"
                  value={manualCoords.lat}
                  onChange={(e) => setManualCoords(prev => ({ ...prev, lat: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude (e.g., 55.2708)"
                  value={manualCoords.lng}
                  onChange={(e) => setManualCoords(prev => ({ ...prev, lng: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleManualCoordsSubmit}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Set Location
              </button>
            </div>
          )}

          {/* Quick Location Buttons */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Quick locations:</p>
            <div className="flex flex-wrap gap-2">
              {dubaiCities.map((city) => (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 rounded-full transition-colors"
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Location Preview */}
          {selectedLocation && (
            <div className="mt-4 p-3 bg-white rounded-md border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-1">Selected:</h4>
              <p className="text-sm text-gray-600">{selectedLocation.name}</p>
              <p className="text-xs text-gray-500">
                Coordinates: {selectedLocation.lat?.toFixed(6)}, {selectedLocation.lng?.toFixed(6)}
              </p>
              <div className="mt-2 w-full h-32 bg-gray-200 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-1">📍</div>
                  <div className="text-xs text-gray-600">
                    {selectedLocation.name}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;