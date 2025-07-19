import { useState, useEffect } from "react";

const CarFilterBar = ({ onFiltersChange, onReset }) => {
  const [filters, setFilters] = useState({
    city: "",
    makeModel: "",
    priceMin: "",
    priceMax: "",
    year: "",
    kilometers: "",
    transmission: "",
    fuelType: "",
  });

  const [showMakeModelSuggestions, setShowMakeModelSuggestions] =
    useState(false);
  const [filteredMakeModels, setFilteredMakeModels] = useState([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Compact data arrays
  const cities = [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Al Ain",
    "Fujairah",
  ];

  const makeModels = [
    "Toyota Camry",
    "Toyota Corolla",
    "Honda Civic",
    "BMW 3 Series",
    "Mercedes C-Class",
    "Nissan Altima",
    "Hyundai Elantra",
    "Audi A4",
    "Ford Mustang",
    "Kia Forte",
  ];

  const years = ["2024", "2023", "2022", "2021", "2020"];
  const kilometers = ["0-30k", "30k-60k", "60k-100k", "100k+"];
  const transmissions = ["Automatic", "Manual"];
  const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    if (key === "makeModel") {
      if (value.length > 0) {
        const filtered = makeModels
          .filter((model) => model.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 5);

        setFilteredMakeModels(filtered);
        setShowMakeModelSuggestions(filtered.length > 0);
      } else {
        setShowMakeModelSuggestions(false);
      }
    }

    if (onFiltersChange) onFiltersChange(newFilters);
  };

  const handleMakeModelSelect = (model) => {
    handleFilterChange("makeModel", model);
    setShowMakeModelSuggestions(false);
  };

  // Count active filters
  useEffect(() => {
    const count = Object.values(filters).filter((value) => value !== "").length;
    setActiveFiltersCount(count);
  }, [filters]);

  // Reset filters
  const handleReset = () => {
    const resetFilters = {
      city: "",
      makeModel: "",
      priceMin: "",
      priceMax: "",
      year: "",
      kilometers: "",
      transmission: "",
    };
    setFilters(resetFilters);
    setShowMakeModelSuggestions(false);
    if (onReset) onReset();
    if (onFiltersChange) onFiltersChange(resetFilters);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".makemodel-container")) {
        setShowMakeModelSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto bg-white border rounded-2xl shadow-sm p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-800">Filter Cars</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={handleReset}
            className="text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Compact Filter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* City */}
        <div>
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange("city", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded-lg px-2 py-2 focus:ring-1 focus:ring-green-500 outline-none"
          >
            <option value="">City</option>
            {cities.map((city, idx) => (
              <option key={idx} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Make & Model */}
        <div className="makemodel-container relative">
          <input
            type="text"
            placeholder="Make, Model"
            value={filters.makeModel}
            onChange={(e) => handleFilterChange("makeModel", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded-lg px-2 py-2 focus:ring-1 focus:ring-green-500 outline-none"
            autoComplete="off"
          />

          {showMakeModelSuggestions && filteredMakeModels.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
              {filteredMakeModels.map((model, index) => (
                <button
                  key={index}
                  onClick={() => handleMakeModelSelect(model)}
                  className="w-full text-left px-2 py-2 text-xs hover:bg-green-50 border-b last:border-b-0 cursor-pointer"
                >
                  {model}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Year */}
        <div>
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange("year", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded-lg px-2 py-2 focus:ring-1 focus:ring-green-500 outline-none"
          >
            <option value="">Year</option>
            {years.map((year, idx) => (
              <option key={idx} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Price Min */}
        <div>
          <input
            type="number"
            placeholder="Min AED"
            value={filters.priceMin}
            onChange={(e) => handleFilterChange("priceMin", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded-lg px-2 py-2 focus:ring-1 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Price Max */}
        <div>
          <input
            type="number"
            placeholder="Max AED"
            value={filters.priceMax}
            onChange={(e) => handleFilterChange("priceMax", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded-lg px-2 py-2 focus:ring-1 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Kilometers */}
        <div>
          <select
            value={filters.kilometers}
            onChange={(e) => handleFilterChange("kilometers", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded-lg px-2 py-2 focus:ring-1 focus:ring-green-500 outline-none"
          >
            <option value="">Mileage</option>
            {kilometers.map((km, idx) => (
              <option key={idx} value={km}>
                {km}
              </option>
            ))}
          </select>
        </div>

        {/* Transmission */}
        <div>
          <select
            value={filters.transmission}
            onChange={(e) => handleFilterChange("transmission", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded-lg px-2 py-2 focus:ring-1 focus:ring-green-500 outline-none"
          >
            <option value="">Transmission</option>
            {transmissions.map((trans, idx) => (
              <option key={idx} value={trans}>
                {trans}
              </option>
            ))}
          </select>
        </div>

        {/* Fuel Type */}
        <div>
          <select
            value={filters.fuelType}
            onChange={(e) => handleFilterChange("fuelType", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded-lg px-2 py-2 focus:ring-1 focus:ring-green-500 outline-none"
          >
            <option value="">Fuel Type</option>
            {fuelTypes.map((fuel, idx) => (
              <option key={idx} value={fuel}>
                {fuel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Filters */}
      {activeFiltersCount === 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Luxury", filter: { priceMin: "300" } },
              { label: "Economy", filter: { priceMax: "150" } },
              { label: "New", filter: { year: "2024" } },
              { label: "Dubai", filter: { city: "Dubai" } },
            ].map((quickFilter, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const newFilters = { ...filters, ...quickFilter.filter };
                  setFilters(newFilters);
                  if (onFiltersChange) onFiltersChange(newFilters);
                }}
                className="bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-700 px-3 py-1 rounded-full text-xs transition-colors cursor-pointer"
              >
                {quickFilter.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CarFilterBar;
