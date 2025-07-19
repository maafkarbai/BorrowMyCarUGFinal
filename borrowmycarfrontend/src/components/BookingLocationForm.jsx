import React, { useState, useEffect } from "react";
import { MapPin, ArrowRight, Info } from "lucide-react";
import AutofillLocationInput from "./AutofillLocationInput";
import { useLocationAutofill } from "../hooks/useLocationAutofill";

const BookingLocationForm = ({ 
  onLocationChange, 
  initialPickupLocation = "", 
  initialReturnLocation = "",
  carLocation = null,
  className = "" 
}) => {
  const [pickupLocation, setPickupLocation] = useState(initialPickupLocation);
  const [returnLocation, setReturnLocation] = useState(initialReturnLocation);
  const [sameAsPickup, setSameAsPickup] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { autoFillCurrentLocation } = useLocationAutofill();

  useEffect(() => {
    onLocationChange({
      pickup: pickupLocation,
      return: sameAsPickup ? pickupLocation : returnLocation,
    });
  }, [pickupLocation, returnLocation, sameAsPickup, onLocationChange]);

  const handleQuickFillCurrentLocation = async () => {
    try {
      const location = await autoFillCurrentLocation();
      if (location) {
        setPickupLocation(location);
        if (sameAsPickup) {
          setReturnLocation(location);
        }
      }
    } catch (error) {
      console.error("Error getting current location:", error);
    }
  };

  const handleSameAsPickupChange = (checked) => {
    setSameAsPickup(checked);
    if (checked && pickupLocation) {
      setReturnLocation(pickupLocation);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900">Quick Location Setup</h3>
            <p className="text-sm text-blue-700">
              Auto-fill locations with your current position
            </p>
          </div>
          <button
            type="button"
            onClick={handleQuickFillCurrentLocation}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Use Current Location
          </button>
        </div>
      </div>

      {/* Pickup Location */}
      <div>
        <AutofillLocationInput
          label="Pickup Location"
          value={pickupLocation?.name || pickupLocation?.address || ""}
          onChange={setPickupLocation}
          placeholder="Where do you want to pick up the car?"
          showCurrentLocation={true}
          showQuickSuggestions={true}
          showRecentLocations={true}
          required={true}
        />
        
        {carLocation && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center text-sm text-gray-600">
              <Info className="w-4 h-4 mr-2" />
              <span>
                Car is located in <strong>{carLocation.city}</strong>
                {carLocation.address && ` - ${carLocation.address}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Return Location */}
      <div>
        <div className="flex items-center space-x-3 mb-3">
          <input
            type="checkbox"
            id="sameAsPickup"
            checked={sameAsPickup}
            onChange={(e) => handleSameAsPickupChange(e.target.checked)}
            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <label htmlFor="sameAsPickup" className="text-sm font-medium text-gray-700">
            Return to the same location
          </label>
        </div>

        {!sameAsPickup && (
          <AutofillLocationInput
            label="Return Location"
            value={returnLocation?.name || returnLocation?.address || ""}
            onChange={setReturnLocation}
            placeholder="Where do you want to return the car?"
            showCurrentLocation={true}
            showQuickSuggestions={true}
            showRecentLocations={true}
            required={true}
          />
        )}

        {sameAsPickup && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-sm text-green-700">
              <ArrowRight className="w-4 h-4 mr-2" />
              <span>Car will be returned to the pickup location</span>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Options */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Options
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions for Pickup
              </label>
              <textarea
                placeholder="Any special instructions for the car owner..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Pickup Time
              </label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">Any time (car owner will contact you)</option>
                <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                <option value="afternoon">Afternoon (12:00 PM - 6:00 PM)</option>
                <option value="evening">Evening (6:00 PM - 10:00 PM)</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="flexibleLocation"
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="flexibleLocation" className="text-sm text-gray-700">
                I'm flexible with pickup/return location (within 5km)
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Location Summary */}
      {(pickupLocation || returnLocation) && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Location Summary</h4>
          <div className="space-y-2 text-sm">
            {pickupLocation && (
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-green-500" />
                <span>
                  <strong>Pickup:</strong> {pickupLocation.name || pickupLocation.address}
                  {pickupLocation.city && ` • ${pickupLocation.city}`}
                </span>
              </div>
            )}
            {returnLocation && !sameAsPickup && (
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                <span>
                  <strong>Return:</strong> {returnLocation.name || returnLocation.address}
                  {returnLocation.city && ` • ${returnLocation.city}`}
                </span>
              </div>
            )}
            {sameAsPickup && (
              <div className="flex items-center text-gray-600">
                <ArrowRight className="w-4 h-4 mr-2 text-blue-500" />
                <span>
                  <strong>Return:</strong> Same as pickup location
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingLocationForm;