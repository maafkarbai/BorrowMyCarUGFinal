import { useState, useEffect } from "react";
import API from "./api";
import { useNavigate } from "react-router-dom";

const ListCar = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    pricePerDay: "",
    availabilityFrom: "",
    availabilityTo: "",
    // Car specifications
    make: "",
    model: "",
    year: "",
    color: "",
    transmission: "",
    fuelType: "",
    mileage: "",
    seatingCapacity: "",
    plateNumber: "",
    specifications: "GCC Specs",
    features: [],
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // Add key to reset file input
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const navigate = useNavigate();

  // Car makes and models
  const carMakes = [
    "Toyota", "Honda", "BMW", "Mercedes-Benz", "Audi", "Lexus", "Infiniti",
    "Ford", "Chevrolet", "Nissan", "Hyundai", "Kia", "Mazda", "Volkswagen",
    "Porsche", "Jaguar", "Land Rover", "Range Rover", "Jeep", "Volvo",
    "Mitsubishi", "Subaru", "Tesla", "Genesis", "Acura", "Cadillac"
  ];

  const carYears = [];
  for (let year = new Date().getFullYear(); year >= 2015; year--) {
    carYears.push(year.toString());
  }

  const carColors = [
    "White", "Black", "Silver", "Gray", "Red", "Blue", "Brown", "Gold",
    "Green", "Orange", "Purple", "Yellow", "Beige", "Maroon"
  ];

  const transmissionTypes = ["Automatic", "Manual", "CVT"];
  
  const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];
  
  const seatingOptions = ["2", "4", "5", "7", "8"];
  
  const specificationTypes = ["GCC Specs", "US Specs", "European Specs", "Japanese Specs", "Canadian Specs", "Korean Specs"];
  
  const availableFeatures = [
    "GPS Navigation", "Bluetooth", "USB Charging", "Wireless Charging",
    "Sunroof", "Leather Seats", "Heated Seats", "Cooled Seats",
    "Backup Camera", "Parking Sensors", "Cruise Control", "Keyless Entry",
    "Push Start", "Auto AC", "Dual Zone AC", "Premium Sound System"
  ];

  // UAE Cities database
  const uaeCities = [
    // Major Emirates and Cities
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Fujairah",
    "Ras Al Khaimah",
    "Umm Al Quwain",

    // Dubai Areas/Districts
    "Dubai Marina",
    "Downtown Dubai",
    "Jumeirah",
    "Deira",
    "Bur Dubai",
    "Al Barsha",
    "Dubai Investment Park",
    "Dubai Silicon Oasis",
    "Dubai South",
    "Al Nahda Dubai",
    "Jumeirah Lake Towers",
    "Business Bay",
    "DIFC",
    "Dubai Hills",
    "Al Qusais",
    "Al Mizhar",
    "International City",
    "Discovery Gardens",
    "Dubai Sports City",

    // Abu Dhabi Areas
    "Abu Dhabi City",
    "Al Ain",
    "Al Ruwais",
    "Khalifa City",
    "Al Shamkha",
    "Yas Island",
    "Saadiyat Island",
    "Al Reef",
    "Al Rahba",
    "Masdar City",
    "Mohammed Bin Zayed City",
    "Al Falah",
    "Al Mushrif",
    "Tourist Club Area",

    // Sharjah Areas
    "Sharjah City",
    "Al Nahda Sharjah",
    "Al Qasimia",
    "Al Majaz",
    "Al Khan",
    "Al Taawun",
    "Al Suyoh",
    "Muwaileh",
    "University City Sharjah",

    // Northern Emirates
    "Al Dhaid",
    "Kalba",
    "Dibba Al Fujairah",
    "Khor Fakkan",
    "Masafi",
    "Hatta",
    "Liwa Oasis",
    "Ghayathi",
    "Madinat Zayed",
    "Sila",

    // Other Notable Areas
    "Jebel Ali",
    "Al Ain City",
    "Sohar",
    "Dibba Al Hisn",
    "Al Hamriyah",
    "Emirates Hills",
    "Arabian Ranches",
    "Motor City",
    "Al Warqa",
    "Mirdif",
  ];

  // Car name suggestions database
  const carSuggestions = [
    // Toyota
    "Toyota Camry 2024",
    "Toyota Corolla 2023",
    "Toyota RAV4 2024",
    "Toyota Highlander 2023",
    "Toyota Prius 2024",
    "Toyota Land Cruiser 2023",
    "Toyota Avalon 2023",
    "Toyota Sienna 2024",

    // Honda
    "Honda Civic 2024",
    "Honda Accord 2023",
    "Honda CR-V 2024",
    "Honda Pilot 2023",
    "Honda Fit 2023",
    "Honda HR-V 2024",
    "Honda Passport 2023",
    "Honda Ridgeline 2024",

    // BMW
    "BMW 3 Series 2024",
    "BMW 5 Series 2023",
    "BMW X3 2024",
    "BMW X5 2023",
    "BMW i4 2024",
    "BMW X1 2023",
    "BMW 7 Series 2024",
    "BMW X7 2023",

    // Mercedes-Benz
    "Mercedes-Benz C-Class 2024",
    "Mercedes-Benz E-Class 2023",
    "Mercedes-Benz GLE 2024",
    "Mercedes-Benz A-Class 2023",
    "Mercedes-Benz S-Class 2024",
    "Mercedes-Benz GLC 2023",

    // Audi
    "Audi A4 2024",
    "Audi A6 2023",
    "Audi Q5 2024",
    "Audi Q7 2023",
    "Audi A3 2024",
    "Audi Q3 2023",
    "Audi A8 2024",
    "Audi e-tron 2023",

    // Nissan
    "Nissan Altima 2024",
    "Nissan Sentra 2023",
    "Nissan Rogue 2024",
    "Nissan Pathfinder 2023",
    "Nissan Leaf 2024",
    "Nissan Murano 2023",
    "Nissan Armada 2024",
    "Nissan Kicks 2023",

    // Hyundai
    "Hyundai Elantra 2024",
    "Hyundai Sonata 2023",
    "Hyundai Tucson 2024",
    "Hyundai Santa Fe 2023",
    "Hyundai Ioniq 5 2024",
    "Hyundai Kona 2023",
    "Hyundai Palisade 2024",
    "Hyundai Venue 2023",

    // Kia
    "Kia Forte 2024",
    "Kia Optima 2023",
    "Kia Sportage 2024",
    "Kia Sorento 2023",
    "Kia EV6 2024",
    "Kia Soul 2023",
    "Kia Telluride 2024",
    "Kia Rio 2023",

    // Ford
    "Ford Mustang 2024",
    "Ford F-150 2023",
    "Ford Explorer 2024",
    "Ford Escape 2023",
    "Ford Bronco 2024",
    "Ford Edge 2023",
    "Ford Expedition 2024",
    "Ford Fusion 2023",

    // Chevrolet
    "Chevrolet Malibu 2024",
    "Chevrolet Equinox 2023",
    "Chevrolet Traverse 2024",
    "Chevrolet Silverado 2023",
    "Chevrolet Bolt 2024",
    "Chevrolet Tahoe 2023",
    "Chevrolet Suburban 2024",
    "Chevrolet Camaro 2023",

    // Luxury & Sports
    "Porsche 911 2024",
    "Porsche Cayenne 2023",
    "Jaguar F-PACE 2024",
    "Land Rover Discovery 2023",
    "Lexus RX 2024",
    "Lexus ES 2023",
    "Infiniti Q50 2024",
    "Acura MDX 2023",
    "Tesla Model 3 2024",
    "Tesla Model Y 2023",
    "Tesla Model S 2024",
    "Tesla Model X 2023",

    // Popular UAE Models
    "Mitsubishi Pajero 2024",
    "Toyota Prado 2023",
    "Nissan Patrol 2024",
    "Ford Raptor 2023",
    "Range Rover Evoque 2024",
    "Jeep Grand Cherokee 2023",
    "Volkswagen Tiguan 2024",
    "Mazda CX-5 2023",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Handle car title suggestions
    if (name === "title") {
      if (value.length > 0) {
        const filtered = carSuggestions
          .filter((suggestion) =>
            suggestion.toLowerCase().includes(value.toLowerCase())
          )
          .slice(0, 8); // Limit to 8 suggestions

        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setShowSuggestions(false);
        setFilteredSuggestions([]);
      }
    }

    // Handle city suggestions
    if (name === "city") {
      if (value.length > 0) {
        const filtered = uaeCities
          .filter((city) => city.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 10); // Limit to 10 city suggestions

        setFilteredCities(filtered);
        setShowCitySuggestions(filtered.length > 0);
      } else {
        setShowCitySuggestions(false);
        setFilteredCities([]);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setForm({ ...form, title: suggestion });
    setShowSuggestions(false);
    setFilteredSuggestions([]);
  };

  const handleCityClick = (city) => {
    setForm({ ...form, city: city });
    setShowCitySuggestions(false);
    setFilteredCities([]);
  };

  const handleFeatureChange = (feature) => {
    const currentFeatures = form.features || [];
    const isSelected = currentFeatures.includes(feature);
    
    if (isSelected) {
      setForm({
        ...form,
        features: currentFeatures.filter(f => f !== feature)
      });
    } else {
      setForm({
        ...form,
        features: [...currentFeatures, feature]
      });
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".suggestion-container")) {
        setShowSuggestions(false);
      }
      if (!event.target.closest(".city-suggestion-container")) {
        setShowCitySuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const removeImage = (indexToRemove) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    setImages(updatedImages);

    // Reset the file input to clear the displayed filename
    setFileInputKey(Date.now());
  };

  const validateForm = () => {
    const {
      title,
      description,
      city,
      pricePerDay,
      availabilityFrom,
      availabilityTo,
      make,
      model,
      year,
      color,
      transmission,
      fuelType,
      seatingCapacity,
      plateNumber,
      mileage,
    } = form;

    if (!title.trim() || !description.trim() || !city.trim()) {
      setError("All required fields must be filled");
      return false;
    }

    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters long");
      return false;
    }

    if (description.trim().length > 1000) {
      setError("Description cannot exceed 1000 characters");
      return false;
    }

    if (!make || !model || !year || !color || !transmission || !fuelType || !seatingCapacity || !plateNumber.trim() || !mileage) {
      setError("Please fill in all car specification fields");
      return false;
    }

    if (parseFloat(pricePerDay) < 50) {
      setError("Price per day must be at least AED 50");
      return false;
    }

    if (parseFloat(pricePerDay) > 5000) {
      setError("Price per day cannot exceed AED 5000");
      return false;
    }

    if (parseInt(year) < 2010 || parseInt(year) > new Date().getFullYear() + 1) {
      setError("Car year must be between 2010 and current year");
      return false;
    }

    if (parseInt(mileage) < 0) {
      setError("Mileage cannot be negative");
      return false;
    }

    if (parseInt(seatingCapacity) < 2 || parseInt(seatingCapacity) > 8) {
      setError("Seating capacity must be between 2 and 8");
      return false;
    }

    // Validate UAE plate number format
    const plateRegex = /^[A-Z]{1,3}[0-9]{1,5}$/;
    if (!plateRegex.test(plateNumber.toUpperCase())) {
      setError("Please enter a valid UAE plate number (e.g., A12345)");
      return false;
    }

    const fromDate = new Date(availabilityFrom);
    const toDate = new Date(availabilityTo);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (fromDate < today) {
      setError("Availability start date cannot be in the past");
      return false;
    }

    if (toDate <= fromDate) {
      setError("End date must be after start date");
      return false;
    }

    if (images.length < 3) {
      setError("Please upload at least 3 images");
      return false;
    }

    // Validate image files
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (let file of images) {
      if (!validTypes.includes(file.type)) {
        setError("Only JPEG, PNG, WebP images are allowed");
        return false;
      }
      if (file.size > maxSize) {
        setError("Each image must be less than 5MB");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // Log form data for debugging
      console.log("Form data before submission:", form);
      console.log("Images before submission:", images);

      // Append form fields
      Object.keys(form).forEach((key) => {
        if (key === 'features' && Array.isArray(form[key])) {
          // Append each feature separately for proper array handling
          form[key].forEach((feature) => {
            formData.append('features', feature);
          });
        } else {
          formData.append(key, form[key]);
        }
      });

      // Append images
      images.forEach((image) => {
        formData.append(`images`, image);
      });

      // Log FormData contents
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      // Verify FormData is not empty
      if (![...formData.entries()].length) {
        setError("No data was created. Please check all fields.");
        return;
      }

      const response = await API.post("/cars", formData);

      // On success, redirect to car listing success page
      navigate("/car-listing-success", {
        state: { 
          car: response.data.car,
          isFirstListing: true // You can track this based on user's listings count
        },
        replace: true
      });

      // Reset form on success
      setForm({
        title: "",
        description: "",
        city: "",
        pricePerDay: "",
        availabilityFrom: "",
        availabilityTo: "",
        // Car specifications
        make: "",
        model: "",
        year: "",
        color: "",
        transmission: "",
        fuelType: "",
        mileage: "",
        seatingCapacity: "",
        plateNumber: "",
        specifications: "GCC Specs",
        features: [],
      });
      setImages([]);
      setFileInputKey(Date.now()); // Reset file input
    } catch (err) {
      console.error("Error listing car:", err);
      setError(
        err.response?.data?.message ||
          "Failed to list car. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">List Your Car</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title with Suggestions */}
        <div className="suggestion-container relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Car Title *
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            placeholder="Start typing... e.g., Toyota Camry"
            onChange={handleChange}
            onFocus={() => {
              if (form.title.length > 0 && filteredSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            autoComplete="off"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-green-50 focus:bg-green-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <span className="text-gray-900 font-medium">
                    {suggestion.split(" ").slice(0, -1).join(" ")}
                  </span>
                  <span className="text-gray-500 ml-2">
                    {suggestion.split(" ").slice(-1)[0]}
                  </span>
                </button>
              ))}

              {/* Show popular suggestions hint */}
              <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600 border-t">
                💡 Popular car models in UAE
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description * (10-1000 characters)
          </label>
          <textarea
            name="description"
            value={form.description}
            placeholder="Describe your car's features, condition, and any special notes..."
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-vertical"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>Minimum 10 characters required</span>
            <span className={`${
              form.description.length < 10 ? 'text-red-500' : 
              form.description.length > 1000 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {form.description.length}/1000
            </span>
          </div>
        </div>

        {/* City and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="city-suggestion-container relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={form.city}
              placeholder="Start typing... e.g., Dubai"
              onChange={handleChange}
              onFocus={() => {
                if (form.city.length > 0 && filteredCities.length > 0) {
                  setShowCitySuggestions(true);
                }
              }}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              autoComplete="off"
            />

            {/* City Suggestions Dropdown */}
            {showCitySuggestions && filteredCities.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCities.map((city, index) => {
                  const isMainEmirate = [
                    "Dubai",
                    "Abu Dhabi",
                    "Sharjah",
                    "Ajman",
                    "Fujairah",
                    "Ras Al Khaimah",
                    "Umm Al Quwain",
                  ].includes(city);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleCityClick(city)}
                      className="w-full text-left px-4 py-3 hover:bg-green-50 focus:bg-green-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors flex items-center justify-between"
                    >
                      <span
                        className={`${
                          isMainEmirate
                            ? "font-semibold text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        {city}
                      </span>
                      {isMainEmirate && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Emirate
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Show UAE locations hint */}
                <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600 border-t">
                  🇦🇪 UAE Cities & Emirates
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Per Day (AED) *
            </label>
            <input
              type="number"
              name="pricePerDay"
              value={form.pricePerDay}
              placeholder="150"
              min="1"
              step="0.01"
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Availability Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available From *
            </label>
            <input
              type="date"
              name="availabilityFrom"
              value={form.availabilityFrom}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Until *
            </label>
            <input
              type="date"
              name="availabilityTo"
              value={form.availabilityTo}
              onChange={handleChange}
              required
              min={
                form.availabilityFrom || new Date().toISOString().split("T")[0]
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Car Specifications Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Car Specifications</h3>
          
          {/* Make and Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Make *
              </label>
              <select
                name="make"
                value={form.make}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="">Select Make</option>
                {carMakes.map((make, index) => (
                  <option key={index} value={make}>{make}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model *
              </label>
              <input
                type="text"
                name="model"
                value={form.model}
                placeholder="e.g., Camry, Accord, X5"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Year and Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <select
                name="year"
                value={form.year}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="">Select Year</option>
                {carYears.map((year, index) => (
                  <option key={index} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color *
              </label>
              <select
                name="color"
                value={form.color}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="">Select Color</option>
                {carColors.map((color, index) => (
                  <option key={index} value={color}>{color}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Transmission and Fuel Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transmission *
              </label>
              <select
                name="transmission"
                value={form.transmission}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="">Select Transmission</option>
                {transmissionTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuel Type *
              </label>
              <select
                name="fuelType"
                value={form.fuelType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="">Select Fuel Type</option>
                {fuelTypes.map((fuel, index) => (
                  <option key={index} value={fuel}>{fuel}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mileage and Seating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mileage (km) *
              </label>
              <input
                type="number"
                name="mileage"
                value={form.mileage}
                placeholder="e.g., 50000"
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seating Capacity *
              </label>
              <select
                name="seatingCapacity"
                value={form.seatingCapacity}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="">Select Seats</option>
                {seatingOptions.map((seats, index) => (
                  <option key={index} value={seats}>{seats} seats</option>
                ))}
              </select>
            </div>
          </div>

          {/* Plate Number and Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plate Number *
              </label>
              <input
                type="text"
                name="plateNumber"
                value={form.plateNumber}
                placeholder="e.g., A12345 or 12345"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specifications
              </label>
              <select
                name="specifications"
                value={form.specifications}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                {specificationTypes.map((spec, index) => (
                  <option key={index} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Features (Optional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableFeatures.map((feature, index) => (
                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.features.includes(feature)}
                    onChange={() => handleFeatureChange(feature)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Car Images * (Min 3 required, Max 5MB each, JPEG/PNG/WebP)
          </label>
          <input
            key={fileInputKey} // Add key prop to force re-render and reset
            type="file"
            name="images"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            multiple
            onChange={handleFileChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-3">
                {images.length} image(s) selected
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                        onLoad={() => URL.revokeObjectURL(image)}
                      />
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove image"
                    >
                      ×
                    </button>

                    {/* Image Info */}
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 truncate">
                        {image.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(image.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Tips */}
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Photo Tips:</strong> Include exterior, interior,
                  dashboard, and engine photos for better visibility
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </span>
          ) : (
            "List Car"
          )}
        </button>
      </form>
    </div>
  );
};

export default ListCar;
