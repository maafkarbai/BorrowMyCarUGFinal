import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  List,
  Map as MapIcon,
  Car,
  DollarSign,
  MapPin,
  Key,
} from "lucide-react";
import API from "../api";
import GeocodingSearch from "./GeocodingSearch";

const MapSearchView = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // 'map' or 'list'
  const [filters, setFilters] = useState({
    priceMin: "",
    priceMax: "",
    category: "",
    transmission: "",
    location: "",
  });
  const [searchLocation, setSearchLocation] = useState(null);

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [cars, filters, searchLocation]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await API.get("/cars");
      if (response.data.success) {
        const carsWithLocation = response.data.data.cars.filter(
          (car) => car.location && car.location.coordinates
        );
        setCars(carsWithLocation);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2[1] - point1[1]) * Math.PI / 180;
    const dLon = (point2[0] - point1[0]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1[1] * Math.PI / 180) * Math.cos(point2[1] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const applyFilters = () => {
    let filtered = [...cars];

    // Price filters
    if (filters.priceMin) {
      filtered = filtered.filter(
        (car) => car.price >= parseFloat(filters.priceMin)
      );
    }
    if (filters.priceMax) {
      filtered = filtered.filter(
        (car) => car.price <= parseFloat(filters.priceMax)
      );
    }

    // Transmission filter
    if (filters.transmission) {
      filtered = filtered.filter(
        (car) => car.transmission === filters.transmission
      );
    }

    // Location-based filtering
    if (searchLocation) {
      const maxDistance = 50; // 50km radius
      filtered = filtered.filter((car) => {
        if (!car.location?.coordinates) return false;
        const distance = calculateDistance(
          searchLocation.coordinates,
          car.location.coordinates
        );
        return distance <= maxDistance;
      });

      // Sort by distance
      filtered.sort((a, b) => {
        const distA = calculateDistance(searchLocation.coordinates, a.location.coordinates);
        const distB = calculateDistance(searchLocation.coordinates, b.location.coordinates);
        return distA - distB;
      });
    }

    setFilteredCars(filtered);
  };

  const handleLocationSelect = (location) => {
    setSearchLocation(location);
  };

  const clearLocationFilter = () => {
    setSearchLocation(null);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Find Cars Near You
          </h1>

          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List className="w-4 h-4 mr-1 inline" />
                List
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === "map"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <MapIcon className="w-4 h-4 mr-1 inline" />
                Map
              </button>
            </div>

            {/* Results Count */}
            <span className="text-sm text-gray-600">
              {filteredCars.length} cars found
            </span>
          </div>
        </div>

        {/* Location Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Location
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <GeocodingSearch
                onLocationSelect={handleLocationSelect}
                placeholder="Search for cars near a location..."
              />
            </div>
            {searchLocation && (
              <button
                onClick={clearLocationFilter}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          {searchLocation && (
            <p className="text-xs text-gray-600 mt-1">
              Showing cars within 50km of {searchLocation.name}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <input
              type="number"
              placeholder="Min Price"
              value={filters.priceMin}
              onChange={(e) =>
                setFilters({ ...filters, priceMin: e.target.value })
              }
              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max Price"
              value={filters.priceMax}
              onChange={(e) =>
                setFilters({ ...filters, priceMax: e.target.value })
              }
              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>

          <select
            value={filters.transmission}
            onChange={(e) =>
              setFilters({ ...filters, transmission: e.target.value })
            }
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="">All Transmissions</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Map View Placeholder */}
        {viewMode === "map" && (
          <div className="flex-1 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Map View
              </h3>
              <p className="text-gray-500 mb-4">
                Interactive map view coming soon
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                {filteredCars.slice(0, 4).map((car) => (
                  <div key={car._id} className="bg-white p-3 rounded-lg shadow">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{car.title}</span>
                    </div>
                    <p className="text-xs text-gray-600">{car.location?.name}</p>
                    <p className="text-sm font-bold text-green-600">AED {car.price}/day</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCars.map((car) => {
                  const distance = searchLocation && car.location?.coordinates 
                    ? calculateDistance(searchLocation.coordinates, car.location.coordinates)
                    : null;

                  return (
                    <div
                      key={car._id}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <img
                        src={car.images[0]}
                        alt={car.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {car.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{car.location?.name || car.city}</span>
                          {distance && (
                            <span className="ml-2 text-green-600 font-medium">
                              ({distance.toFixed(1)}km away)
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-600 font-bold">
                            AED {car.price}/day
                          </span>
                          <button
                            onClick={() => navigate(`/cars/${car._id}`)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <Key className="w-3 h-3" />
                            <span>Rent Now</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredCars.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No cars found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your filters or search in a different area.
                  </p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading cars...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSearchView;