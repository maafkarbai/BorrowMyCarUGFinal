import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Navigation,
  Star,
  Phone,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  DoorOpen,
  Briefcase,
  Clock,
  CheckCircle,
} from "lucide-react";
import UserAvatar from "./UserAvatar";

const CarCard = ({ car, userLocation = null, showDistance = true }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const getDistanceText = () => {
    if (!userLocation || !car.location || !showDistance) return null;
    return `5.2 km away`;
  };

  const getWeeklyPrice = () => {
    const dailyPrice = car.price || car.pricePerDay || 0;
    return Math.round(dailyPrice * 6.5); // 7 days with small discount
  };

  const getMonthlyPrice = () => {
    const dailyPrice = car.price || car.pricePerDay || 0;
    return Math.round(dailyPrice * 28); // 30 days with discount
  };

  const getWeeklyKmLimit = () => {
    return "1500 km/week";
  };

  const getMonthlyKmLimit = () => {
    return "4000 km/month";
  };

  const isUnavailable = car.status !== "active";
  const images = car.images || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && hasMultipleImages) {
      nextImage(e);
    }
    if (isRightSwipe && hasMultipleImages) {
      prevImage(e);
    }
  };

  return (
    <Link
      to={`/cars/${car._id}`}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow w-full text-left block"
      aria-label={`Rent ${car.title}`}
    >
      <div
        className="relative group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentImageIndex] || "/default-car.jpg"}
          alt={`${car.title} - Image ${currentImageIndex + 1}`}
          className="w-full h-48 object-cover transition-opacity duration-300"
          onError={(e) => {
            e.target.src = "/default-car.jpg";
          }}
        />

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full opacity-70 group-hover:opacity-100 transition-all duration-200 shadow-lg z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full opacity-70 group-hover:opacity-100 transition-all duration-200 shadow-lg z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1.5 bg-black bg-opacity-40 px-2 py-1 rounded-full">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToImage(index, e)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  index === currentImageIndex
                    ? "bg-white shadow-sm"
                    : "bg-white bg-opacity-60 hover:bg-opacity-80"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-xs">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}

        {isUnavailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Unavailable</span>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Car Title and Model */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {car.make} • {car.model} • {car.specifications || "Other"}
            </h3>
          </div>
          <div className="flex items-center ml-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">
              {car.averageRating || "4.5"}
            </span>
          </div>
        </div>

        {/* Car Specifications Row */}
        <div className="flex items-center gap-2 sm:gap-4 mb-3 text-sm text-gray-600 flex-wrap">
          <div className="flex items-center" title="Year">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{car.year || "2025"}</span>
          </div>
          <div className="flex items-center" title="Seating Capacity">
            <Users className="w-4 h-4 mr-1" />
            <span>{car.seatingCapacity || "5"}</span>
          </div>
          <div className="flex items-center" title="Doors">
            <DoorOpen className="w-4 h-4 mr-1" />
            <span>5+</span>
          </div>
          <div className="flex items-center" title="Luggage">
            <Briefcase className="w-4 h-4 mr-1" />
            <span>3</span>
          </div>
        </div>

        {/* Special Features */}
        <div className="mb-3">
          <h4 className="font-medium text-gray-900 mb-2">
            {car.securityDeposit === 0 ? "ZERO DEPOSIT OPTION" : `AED ${car.securityDeposit} DEPOSIT`} | {car.make} {car.model} {car.year}
          </h4>
        </div>

        {/* Pricing Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors" role="button" tabIndex="0">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Weekly Rent
            </div>
            <div className="font-bold text-lg text-gray-900">
              AED {getWeeklyPrice()}
            </div>
            <div className="text-xs text-gray-500">{getWeeklyKmLimit()}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors" role="button" tabIndex="0">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Monthly Rent
            </div>
            <div className="font-bold text-lg text-gray-900">
              AED {getMonthlyPrice()}
            </div>
            <div className="text-xs text-gray-500">{getMonthlyKmLimit()}</div>
          </div>
        </div>

        {/* Features */}
        <div className="flex items-center gap-2 sm:gap-4 mb-3 text-sm flex-wrap">
          <div className="flex items-center text-gray-600" title="Minimum Rental Period">
            <Clock className="w-4 h-4 mr-1" />
            <span className="whitespace-nowrap">Minimum {car.minimumRentalDays || 1} days rental</span>
          </div>
          <div className="flex items-center text-green-600" title="Insurance Included">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="whitespace-nowrap">Basic Insurance</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{car.location || `${car.city}, ${car.city}`}</span>
          {getDistanceText() && (
            <>
              <Navigation className="w-4 h-4 ml-3 mr-1" />
              <span>{getDistanceText()}</span>
            </>
          )}
        </div>

        {/* Owner Information Section */}
        <div className="border-t border-gray-100 pt-3 mt-3">
          <div className="flex items-center justify-between">
            <Link
              to={`/users/${car.owner?._id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 -ml-2 transition-colors"
            >
              <UserAvatar
                user={car.owner}
                size="md"
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {car.owner?.name || "Owner"}
                </p>
                <div className="flex items-center space-x-2">
                  {car.owner?.averageRating && (
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 ml-1">
                        {car.owner.averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>

            {/* Contact Button */}
            {car.owner?.phone && (
              <a
                href={`tel:${car.owner.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                title={`Call ${car.owner.name}`}
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-3">
          <div>
            <span className="text-xl font-bold text-gray-900">
              AED {car.price || car.pricePerDay}
            </span>
            <span className="text-sm text-gray-500 block">per day</span>
          </div>
          <button
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isUnavailable
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
            disabled={isUnavailable}
            onClick={(e) => {
              if (isUnavailable) {
                e.preventDefault();
              }
            }}
          >
            {isUnavailable ? "Unavailable" : "Book Now"}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default CarCard;
