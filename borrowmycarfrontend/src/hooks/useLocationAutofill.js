import { useState, useCallback, useEffect } from 'react';

const useLocationAutofill = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [recentLocations, setRecentLocations] = useState([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Load recent locations from localStorage on init
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentLocations');
      if (saved) {
        setRecentLocations(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recent locations:', error);
    }
  }, []);

  // Save recent locations to localStorage
  const saveToRecentLocations = useCallback((location) => {
    if (!location) return;

    setRecentLocations(prev => {
      // Remove existing if present, then add to front
      const filtered = prev.filter(loc => loc !== location);
      const updated = [location, ...filtered].slice(0, 10); // Keep only 10 most recent
      
      try {
        localStorage.setItem('recentLocations', JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving recent locations:', error);
      }
      
      return updated;
    });
  }, []);

  // Get current location using browser geolocation
  const autoFillCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return Promise.reject(new Error('Geolocation is not supported by this browser'));
    }

    setIsGettingLocation(true);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Try to reverse geocode to get a readable address
            // For now, return a basic location string
            const locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            
            setCurrentLocation({
              latitude,
              longitude,
              displayName: locationString,
              coordinates: `${latitude}, ${longitude}`
            });
            
            setIsGettingLocation(false);
            resolve(locationString);
          } catch (error) {
            console.error('Error processing location:', error);
            setIsGettingLocation(false);
            reject(error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsGettingLocation(false);
          
          let errorMessage;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'Unknown error occurred';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }, []);

  // Mock search function for UAE locations
  const searchLocations = useCallback(async (query) => {
    if (!query || query.length < 2) {
      return [];
    }

    // Mock UAE location data - in a real app, this would call a geocoding API
    const uaeLocations = [
      'Dubai Mall, Dubai',
      'Burj Khalifa, Dubai',
      'Dubai Marina, Dubai',
      'Jumeirah Beach, Dubai',
      'Dubai International Airport, Dubai',
      'Sheikh Zayed Road, Dubai',
      'Business Bay, Dubai',
      'Downtown Dubai, Dubai',
      'DIFC, Dubai',
      'Abu Dhabi Mall, Abu Dhabi',
      'Corniche, Abu Dhabi',
      'Yas Island, Abu Dhabi',
      'Emirates Palace, Abu Dhabi',
      'Abu Dhabi International Airport, Abu Dhabi',
      'Al Ain Mall, Al Ain',
      'Sharjah City Centre, Sharjah',
      'Ajman City Centre, Ajman',
      'RAK Mall, Ras Al Khaimah',
      'Fujairah Mall, Fujairah'
    ];

    // Filter locations based on query
    const filtered = uaeLocations.filter(location =>
      location.toLowerCase().includes(query.toLowerCase())
    );

    // Return top 5 matches
    return filtered.slice(0, 5).map(location => ({
      name: location,
      displayName: location,
      type: 'location'
    }));
  }, []);

  // Get quick suggestions (popular UAE locations)
  const getQuickSuggestions = useCallback(() => {
    return [
      { name: 'Dubai Mall, Dubai', type: 'popular' },
      { name: 'Dubai Marina, Dubai', type: 'popular' },
      { name: 'Downtown Dubai, Dubai', type: 'popular' },
      { name: 'Abu Dhabi Mall, Abu Dhabi', type: 'popular' },
      { name: 'Sharjah City Centre, Sharjah', type: 'popular' }
    ];
  }, []);

  return {
    currentLocation,
    recentLocations,
    isGettingLocation,
    searchLocations,
    autoFillCurrentLocation,
    saveToRecentLocations,
    getQuickSuggestions
  };
};

export { useLocationAutofill };