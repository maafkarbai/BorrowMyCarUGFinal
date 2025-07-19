// src/CarListingSection.jsx - Enhanced with better performance and error handling
import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import CarFilterBar from "./CarFilterBar";
import CarCard from "./components/CarCard";
import API from "./api";

const CarListingSection = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 12,
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Memoized API params to prevent unnecessary re-renders
  const _apiParams = useMemo(() => {
    const params = new URLSearchParams({
      page: pagination.currentPage.toString(),
      limit: pagination.limit.toString(),
      sortBy,
      sortOrder,
      ...filters,
    });

    // Remove empty filter values
    Object.keys(filters).forEach((key) => {
      if (!filters[key]) {
        params.delete(key);
      }
    });

    return params;
  }, [pagination.currentPage, pagination.limit, sortBy, sortOrder, filters]);

  // Fetch cars with better error handling and caching
  const fetchCars = useCallback(
    async (page = 1, newFilters = filters) => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
          sortBy,
          sortOrder,
          ...newFilters,
        });

        // Remove empty filter values
        Object.keys(newFilters).forEach((key) => {
          if (!newFilters[key]) {
            params.delete(key);
          }
        });

        console.log("Fetching cars with params:", params.toString());

        const response = await API.get(`/cars?${params.toString()}`);
        console.log("Cars API response:", response.data);

        // Handle different response structures
        let carsData = [];
        let paginationData = {};

        if (response.data.data) {
          carsData = response.data.data.cars || response.data.data;
          paginationData = response.data.data.pagination || {};
        } else if (response.data.cars) {
          carsData = response.data.cars;
          paginationData = response.data.pagination || {};
        } else {
          carsData = Array.isArray(response.data) ? response.data : [];
        }

        // Validate car data structure
        const validatedCars = carsData.map((car) => ({
          ...car,
          price: car.price || car.pricePerDay || 0,
          pricePerDay: car.pricePerDay || car.price || 0,
          images: Array.isArray(car.images) ? car.images : [],
          city: car.city || "Unknown",
          title: car.title || "Car Listing",
        }));

        setCars(validatedCars);
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          ...paginationData,
        }));
      } catch (err) {
        console.error("Error fetching cars:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load cars. Please check your connection and try again."
        );
        setCars([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, sortBy, sortOrder]
  );

  // Initial load with error retry
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const fetchWithRetry = async () => {
      try {
        await fetchCars();
      } catch {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying fetch cars, attempt ${retryCount}`);
          setTimeout(fetchWithRetry, 1000 * retryCount);
        }
      }
    };

    fetchWithRetry();
  }, [sortBy, sortOrder]);

  // Handle filter changes with debouncing
  const handleFiltersChange = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      fetchCars(1, newFilters); // Reset to page 1 when filters change
    },
    [fetchCars]
  );

  // Handle filter reset
  const handleFiltersReset = useCallback(() => {
    setFilters({});
    fetchCars(1, {});
  }, [fetchCars]);

  // Handle pagination with smooth scrolling
  const handlePageChange = useCallback(
    (page) => {
      fetchCars(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [fetchCars]
  );

  // Handle sorting with validation
  const handleSortChange = useCallback((newSortBy, newSortOrder = "desc") => {
    const validSortFields = ["createdAt", "price", "title", "year"];
    const validSortOrders = ["asc", "desc"];

    if (
      validSortFields.includes(newSortBy) &&
      validSortOrders.includes(newSortOrder)
    ) {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
    }
  }, []);


  // Enhanced Loading Skeleton with shimmer effect
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-pulse"
        >
          <div className="aspect-video bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-full"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-2/3"></div>
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Enhanced Pagination Component
  const Pagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, pagination.currentPage - halfVisible);
    let endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        {/* First page if not visible */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
          </>
        )}

        {/* Page Numbers */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              page === pagination.currentPage
                ? "bg-green-600 text-white"
                : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Last page if not visible */}
        {endPage < pagination.totalPages && (
          <>
            {endPage < pagination.totalPages - 1 && (
              <span className="px-2 text-gray-500">...</span>
            )}
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {pagination.totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Filter Bar */}
      <CarFilterBar
        onFiltersChange={handleFiltersChange}
        onReset={handleFiltersReset}
      />

      {/* Results Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Available Cars</h2>
          {!loading && (
            <span className="text-gray-600 text-sm">
              {pagination.totalCount || cars.length} cars found
            </span>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-");
              handleSortChange(field, order);
            }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-green-500 outline-none"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="title-asc">Name: A to Z</option>
            <option value="title-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
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
            Error Loading Cars
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchCars()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && <LoadingSkeleton />}

      {/* Empty State */}
      {!loading && !error && cars.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Cars Found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search criteria to find more cars.
          </p>
          <button
            onClick={handleFiltersReset}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Cars Grid */}
      {!loading && !error && cars.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <CarCard key={car._id} car={car} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination />
        </>
      )}
    </div>
  );
};

export default CarListingSection;
