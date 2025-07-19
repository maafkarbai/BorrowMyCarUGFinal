// src/CarDetails.jsx - Updated with Payment Integration
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "./api";
import PaymentModal from "./components/PaymentModal";
import DatePicker from "./components/DatePicker";
import { useAuth } from "./context/AuthContext";

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState({
    startDate: "",
    endDate: "",
  });
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await API.get(`/cars/${id}`);
        setCar(res.data.data.car);
      } catch (err) {
        setError("Car not found or failed to load");
        console.error("Error fetching car:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  // Calculate total cost and days when dates change
  useEffect(() => {
    if (booking.startDate && booking.endDate && car) {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        setNumberOfDays(diffDays);
        const dailyRate = car.price || car.pricePerDay;
        const subtotal = diffDays * dailyRate;
        const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
        const insurance = Math.round(subtotal * 0.03); // 3% insurance
        const total = subtotal + serviceFee + insurance;

        setTotalCost(total);
      } else {
        setNumberOfDays(0);
        setTotalCost(0);
      }
    } else {
      setNumberOfDays(0);
      setTotalCost(0);
    }
  }, [booking.startDate, booking.endDate, car]);

  const _handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBooking((prev) => ({
      ...prev,
      [name]: value,
    }));
    setBookingError("");
  };

  const handleDatePickerChange = ({ startDate, endDate }) => {
    setBooking((prev) => ({
      ...prev,
      startDate: startDate || "",
      endDate: endDate || "",
    }));
    setBookingError("");
  };

  const handleDatePickerError = (error) => {
    setBookingError(error);
  };

  const validateBookingDates = async () => {
    if (!booking.startDate || !booking.endDate) {
      setBookingError("Please select both start and end dates");
      return false;
    }

    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setBookingError("Start date cannot be in the past");
      return false;
    }

    if (start >= end) {
      setBookingError("End date must be after start date");
      return false;
    }

    const availableFrom = new Date(car.availabilityFrom);
    const availableTo = new Date(car.availabilityTo);

    if (start < availableFrom || end > availableTo) {
      setBookingError(
        `Selected dates must be between ${availableFrom.toLocaleDateString()} and ${availableTo.toLocaleDateString()}`
      );
      return false;
    }

    // Check minimum rental days
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const minimumDays = car.minimumRentalDays || 1;
    const maximumDays = car.maximumRentalDays || 30;

    if (diffDays < minimumDays) {
      setBookingError(
        `Minimum rental period is ${minimumDays} day${
          minimumDays !== 1 ? "s" : ""
        }`
      );
      return false;
    }

    if (diffDays > maximumDays) {
      setBookingError(
        `Maximum rental period is ${maximumDays} day${
          maximumDays !== 1 ? "s" : ""
        }`
      );
      return false;
    }

    // Real-time availability check to prevent double booking
    try {
      const response = await API.get(`/cars/${car._id}/availability`);
      const { unavailableDates } = response.data.data;

      // Check if selected dates overlap with any existing bookings
      const selectedStart = start.getTime();
      const selectedEnd = end.getTime();

      const hasConflict = unavailableDates.some((booking) => {
        const bookingStart = new Date(booking.startDate).getTime();
        const bookingEnd = new Date(booking.endDate).getTime();

        // Check for any overlap
        return selectedStart < bookingEnd && selectedEnd > bookingStart;
      });

      if (hasConflict) {
        setBookingError(
          "Selected dates conflict with existing bookings. Please choose different dates."
        );
        return false;
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setBookingError("Unable to verify availability. Please try again.");
      return false;
    }

    return true;
  };

  const handleBook = async (e) => {
    e.preventDefault();

    const isValid = await validateBookingDates();
    if (!isValid) {
      return;
    }

    // Prepare payment data
    const dailyRate = car.price || car.pricePerDay;
    const subtotal = numberOfDays * dailyRate;
    const serviceFee = Math.round(subtotal * 0.05);
    const insurance = Math.round(subtotal * 0.03);
    const total = subtotal + serviceFee + insurance;

    const bookingPaymentData = {
      // Booking details
      carId: car._id,
      carTitle: car.title,
      carImage: car.images?.[0],
      carLocation: car.city,
      startDate: booking.startDate,
      endDate: booking.endDate,
      numberOfDays: numberOfDays,

      // Pricing breakdown
      dailyRate: dailyRate,
      subtotal: subtotal,
      serviceFee: serviceFee,
      insurance: insurance,
      totalAmount: total,

      // For booking creation
      totalCost: total,

      // Generate temporary booking ID
      bookingId: `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    };

    setPaymentData(bookingPaymentData);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    setBookingLoading(true);
    setShowPaymentModal(false);

    try {
      // Create the actual booking with payment info
      const bookingPayload = {
        carId: car._id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalCost: paymentData.totalAmount,
        numberOfDays: numberOfDays,
        paymentMethod: paymentResult.paymentMethod,
        paymentId: paymentResult.paymentId,
        paymentStatus: paymentResult.status || "completed",
      };

      const response = await API.post("/bookings", bookingPayload);

      navigate("/booking-confirmed", {
        state: {
          booking: response.data,
          car: car,
        },
        replace: true
      });
    } catch (err) {
      console.error("Booking creation error:", err);
      setBookingError(
        err.response?.data?.message ||
          "Booking failed after payment. Please contact support."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePaymentError = (error) => {
    setShowPaymentModal(false);
    setBookingError(error);
  };

  const nextImage = () => {
    if (car?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
    }
  };

  const prevImage = () => {
    if (car?.images?.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? car.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-64 rounded-xl"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error Loading Car
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/browse")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  if (!car) return null;

  return (
    <>
      <div className="max-w-6xl mx-auto p-6">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm">
          <button
            onClick={() => navigate("/browse")}
            className="text-green-600 hover:text-green-800 font-medium"
          >
            ← Back to Browse
          </button>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">{car.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative">
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={
                    car.images?.[currentImageIndex] ||
                    "https://via.placeholder.com/800x450?text=No+Image"
                  }
                  alt={`${car.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Image Navigation */}
                {car.images?.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {car.images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {car.images?.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {car.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-green-500 ring-2 ring-green-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Car Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {car.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {car.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      AED {car.price || car.pricePerDay} / day
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {car.description}
                  </p>
                </div>

                {/* Car Specifications */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Specifications
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Make & Model</span>
                      <p className="font-medium text-gray-900">{car.make} {car.model}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Year</span>
                      <p className="font-medium text-gray-900">{car.year}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Transmission</span>
                      <p className="font-medium text-gray-900">{car.transmission}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Fuel Type</span>
                      <p className="font-medium text-gray-900">{car.fuelType}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Mileage</span>
                      <p className="font-medium text-gray-900">{car.mileage?.toLocaleString()} km</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Seating</span>
                      <p className="font-medium text-gray-900">{car.seatingCapacity} seats</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Color</span>
                      <p className="font-medium text-gray-900">{car.color}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Plate Number</span>
                      <p className="font-medium text-gray-900">{car.plateNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Insurance Information
                  </h3>
                  {car.hasInsurance ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-green-800">This vehicle is insured</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-green-600">Provider</span>
                          <p className="font-medium text-green-900">{car.insuranceProvider}</p>
                        </div>
                        <div>
                          <span className="text-green-600">Policy Type</span>
                          <p className="font-medium text-green-900">{car.insuranceType}</p>
                        </div>
                        <div>
                          <span className="text-green-600">Policy Number</span>
                          <p className="font-medium text-green-900">{car.insurancePolicyNumber}</p>
                        </div>
                        <div>
                          <span className="text-green-600">Valid Until</span>
                          <p className="font-medium text-green-900">
                            {new Date(car.insuranceExpiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-yellow-800">This vehicle does not have insurance information on file</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Features */}
                {car.features && car.features.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Features
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {car.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Owner Section */}
                {car.owner && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Contact Owner
                    </h3>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <img
                          src={car.owner.profileImage || 'https://via.placeholder.com/60x60?text=Owner'}
                          alt={car.owner.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{car.owner.name}</h4>
                        {car.owner.averageRating && (
                          <div className="flex items-center gap-1 mt-1">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm text-gray-600">
                              {car.owner.averageRating.toFixed(1)} ({car.owner.totalBookings || 0} bookings)
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {car.owner.phone && (
                          <button
                            onClick={() => {
                              try {
                                const phoneNumber = car.owner?.phone?.replace(/\s+/g, '').replace(/\+/g, '') || '';
                                const ownerName = car.owner?.name || 'Owner';
                                const carTitle = car.title || 'this car';
                                const message = `Hi ${ownerName}, I'm interested in your car: ${carTitle}. Is it available for rent?`;
                                
                                if (phoneNumber) {
                                  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
                                } else {
                                  alert('Phone number not available');
                                }
                              } catch (error) {
                                console.error('Error opening WhatsApp:', error);
                                alert('Failed to open WhatsApp');
                              }
                            }}
                            className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
                            title={`WhatsApp ${car.owner.name}`}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.188z"/>
                            </svg>
                          </button>
                        )}
                        {car.owner.email && (
                          <button
                            onClick={() => {
                              try {
                                const carTitle = car.title || 'this car';
                                const ownerName = car.owner?.name || 'Owner';
                                const carCity = car.city || 'Location not specified';
                                const carPrice = car.price || 'Price not specified';
                                const ownerEmail = car.owner?.email;
                                
                                if (ownerEmail) {
                                  const subject = `Inquiry about ${carTitle}`;
                                  const body = `Hi ${ownerName},\n\nI'm interested in renting your car: ${carTitle}\nLocation: ${carCity}\nPrice: AED ${carPrice}/day\n\nCould you please let me know about its availability?\n\nThanks!`;
                                  window.location.href = `mailto:${ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                } else {
                                  alert('Email not available');
                                }
                              } catch (error) {
                                console.error('Error opening email:', error);
                                alert('Failed to open email');
                              }
                            }}
                            className="flex items-center justify-center w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                            title={`Email ${car.owner.name}`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Availability
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {new Date(car.availabilityFrom).toLocaleDateString()} -{" "}
                    {new Date(car.availabilityTo).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {isAuthenticated && user && user.role === "renter" ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Book This Car
                  </h2>
                  <form onSubmit={handleBook} className="space-y-4">
                    <DatePicker
                      carId={car._id}
                      startDate={booking.startDate}
                      endDate={booking.endDate}
                      onDateChange={handleDatePickerChange}
                      onError={handleDatePickerError}
                    />

                    {/* Cost Breakdown */}
                    {numberOfDays > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>
                            AED {car.price || car.pricePerDay} × {numberOfDays}{" "}
                            day{numberOfDays !== 1 ? "s" : ""}
                          </span>
                          <span>
                            AED {numberOfDays * (car.price || car.pricePerDay)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Service Fee (5%)</span>
                          <span>
                            AED{" "}
                            {Math.round(
                              numberOfDays *
                                (car.price || car.pricePerDay) *
                                0.05
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Insurance (3%)</span>
                          <span>
                            AED{" "}
                            {Math.round(
                              numberOfDays *
                                (car.price || car.pricePerDay) *
                                0.03
                            )}
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Total</span>
                          <span className="text-green-600">
                            AED {totalCost}
                          </span>
                        </div>
                      </div>
                    )}

                    {bookingError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-600">{bookingError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={bookingLoading || numberOfDays === 0}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                    >
                      {bookingLoading ? (
                        <>
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
                          Processing...
                        </>
                      ) : (
                        "Continue to Payment"
                      )}
                    </button>
                  </form>

                  <div className="mt-4 text-xs text-gray-500 text-center">
                    🔒 Your booking is secure and protected
                  </div>
                </div>
              ) : isAuthenticated && user && user.role === "owner" ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-blue-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-blue-800 mb-2">
                      Car Owner View
                    </h3>
                    <p className="text-blue-700">
                      This is your listed car. Switch to a renter account to
                      book cars.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-yellow-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-yellow-800 mb-2">
                      Login Required
                    </h3>
                    <p className="text-yellow-700 mb-4">
                      Please log in to book this car and enjoy our rental
                      service.
                    </p>
                    <button
                      onClick={() => navigate("/login")}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Login to Book
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bookingData={paymentData}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </>
  );
};

export default CarDetails;
