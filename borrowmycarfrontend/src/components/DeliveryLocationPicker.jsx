import React, { useState } from "react";
import { Truck, MapPin, Clock, DollarSign } from "lucide-react";
import LocationPicker from "./LocationPicker";

const DeliveryLocationPicker = ({
  carLocation,
  onDeliveryChange,
  className = "",
}) => {
  const [deliveryRequested, setDeliveryRequested] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

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

  const calculateDeliveryInfo = async (location) => {
    if (!carLocation || !location) return;

    setIsCalculating(true);
    try {
      const distance = calculateDistance(
        carLocation.coordinates,
        location.coordinates
      );

      const deliveryFee = Math.max(20, distance * 2); // AED 2 per km, minimum AED 20
      const estimatedTime = Math.max(30, distance * 3); // 3 minutes per km, minimum 30 min

      const info = {
        distance: distance.toFixed(1),
        fee: Math.round(deliveryFee),
        estimatedTime: Math.round(estimatedTime),
      };

      setDeliveryInfo(info);
      onDeliveryChange({
        requested: true,
        location: location,
        ...info,
      });
    } catch (error) {
      console.error("Error calculating delivery info:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDeliveryToggle = (enabled) => {
    setDeliveryRequested(enabled);
    if (!enabled) {
      setDeliveryLocation(null);
      setDeliveryInfo(null);
      onDeliveryChange({ requested: false });
    }
  };

  const handleLocationSelect = (location) => {
    setDeliveryLocation(location);
    if (location) {
      calculateDeliveryInfo(location);
    } else {
      setDeliveryInfo(null);
      onDeliveryChange({ requested: deliveryRequested, location: null });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Delivery Toggle */}
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <Truck className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">Car Delivery</h3>
            <p className="text-sm text-blue-700">
              Get the car delivered to your location
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={deliveryRequested}
            onChange={(e) => handleDeliveryToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Delivery Location Picker */}
      {deliveryRequested && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Address
            </label>
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              placeholder="Where should we deliver the car?"
              showCurrentLocation={true}
            />
          </div>

          {/* Delivery Information */}
          {deliveryLocation && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                Delivery Details
              </h4>

              {isCalculating ? (
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-sm">Calculating delivery info...</span>
                </div>
              ) : (
                deliveryInfo && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Distance</p>
                        <p className="font-medium">
                          {deliveryInfo.distance} km
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Est. Time</p>
                        <p className="font-medium">
                          {deliveryInfo.estimatedTime} min
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Delivery Fee</p>
                        <p className="font-medium text-green-600">
                          AED {deliveryInfo.fee}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Delivery time may vary based on traffic
                  conditions. The car owner will contact you to confirm the
                  delivery time.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryLocationPicker;