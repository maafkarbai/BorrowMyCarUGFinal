import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import API from './api';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  ToggleLeft, 
  ToggleRight,
  Search,
  Filter,
  Image,
  DollarSign,
  Calendar,
  MapPin,
  CheckSquare,
  Square,
  MoreVertical,
  Car
} from 'lucide-react';

const ListingManagement = () => {
  const { user: _user } = useAuth();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_error, _setError] = useState(null);
  const [pagination, setPagination] = useState({});
  
  // Filters and search
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCars, setSelectedCars] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({});

  useEffect(() => {
    fetchCars();
  }, [currentPage, filters]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      });
      
      const response = await API.get(`/cars/my/cars?${params}`);
      setCars(response.data.data.cars);
      setPagination(response.data.data.pagination);
    } catch (err) {
      _setError(err.response?.data?.message || 'Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (carId) => {
    try {
      const response = await API.patch(`/cars/${carId}/toggle-status`);
      const updatedCar = response.data.data.car;
      
      setCars(cars.map(car => 
        car._id === carId ? updatedCar : car
      ));
      
      alert(`Car status changed to ${updatedCar.status}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update car status');
    }
  };

  const handleDuplicateCar = async (carId) => {
    try {
      const response = await API.post(`/cars/${carId}/duplicate`);
      const duplicatedCar = response.data.data.car;
      
      setCars([duplicatedCar, ...cars]);
      alert('Car listing duplicated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to duplicate car');
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!confirm('Are you sure you want to delete this car listing?')) return;
    
    try {
      await API.delete(`/cars/${carId}`);
      setCars(cars.filter(car => car._id !== carId));
      alert('Car deleted successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete car');
    }
  };

  const handleSelectCar = (carId) => {
    setSelectedCars(prev => 
      prev.includes(carId) 
        ? prev.filter(id => id !== carId)
        : [...prev, carId]
    );
  };

  const handleSelectAllCars = () => {
    if (selectedCars.length === cars.length) {
      setSelectedCars([]);
    } else {
      setSelectedCars(cars.map(car => car._id));
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedCars.length === 0) {
      alert('Please select cars to update');
      return;
    }

    try {
      const response = await API.put('/cars/bulk', {
        carIds: selectedCars,
        updateData: bulkUpdateData
      });
      
      alert(response.data.message);
      fetchCars();
      setSelectedCars([]);
      setShowBulkActions(false);
      setBulkUpdateData({});
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update cars');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      maintenance: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const BulkActionsModal = () => {
    if (!showBulkActions) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h3 className="text-lg font-semibold mb-4">
            Bulk Update {selectedCars.length} Cars
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={bulkUpdateData.status || ''}
                onChange={(e) => setBulkUpdateData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Don't change</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (AED per day)
              </label>
              <input
                type="number"
                placeholder="Don't change"
                value={bulkUpdateData.price || ''}
                onChange={(e) => setBulkUpdateData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Available
              </label>
              <select
                value={bulkUpdateData.deliveryAvailable ?? ''}
                onChange={(e) => setBulkUpdateData(prev => ({ 
                  ...prev, 
                  deliveryAvailable: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Don't change</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            {bulkUpdateData.deliveryAvailable && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Fee (AED)
                </label>
                <input
                  type="number"
                  placeholder="Delivery fee"
                  value={bulkUpdateData.deliveryFee || ''}
                  onChange={(e) => setBulkUpdateData(prev => ({ ...prev, deliveryFee: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowBulkActions(false);
                setBulkUpdateData({});
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkUpdate}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Cars
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CarCard = ({ car }) => {
    const isSelected = selectedCars.includes(car._id);
    
    return (
      <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}>
        {/* Image Section */}
        <div className="relative">
          <img
            src={car.images?.[0] || '/placeholder-car.jpg'}
            alt={car.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(car.status)}`}>
              {car.status}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <button
              onClick={() => handleSelectCar(car._id)}
              className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
            >
              {isSelected ? (
                <CheckSquare className="h-4 w-4 text-blue-600" />
              ) : (
                <Square className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          <div className="absolute bottom-3 right-3">
            <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
              {car.images?.length || 0} photos
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {car.title}
            </h3>
            <div className="relative">
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3">
            {car.make} {car.model} • {car.year}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600">
                <DollarSign className="h-4 w-4 mr-1" />
                Price per day
              </span>
              <span className="font-semibold">AED {car.pricePerDay}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                Total bookings
              </span>
              <span>{car.bookingStats?.totalBookings || 0}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600">
                <DollarSign className="h-4 w-4 mr-1" />
                Total earnings
              </span>
              <span className="font-semibold text-green-600">
                AED {car.bookingStats?.totalEarnings?.toLocaleString() || 0}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                Location
              </span>
              <span>{car.city}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => window.open(`/cars/${car._id}`, '_blank')}
              className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </button>
            
            <button
              onClick={() => window.open(`/list-car?edit=${car._id}`, '_blank')}
              className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </button>
            
            <button
              onClick={() => handleToggleStatus(car._id)}
              className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {car.status === 'active' ? (
                <ToggleRight className="h-4 w-4 text-green-600" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>

          {/* Additional Actions */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleDuplicateCar(car._id)}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm"
            >
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </button>
            
            <button
              onClick={() => handleDeleteCar(car._id)}
              className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && cars.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Car Listings</h1>
              <p className="text-gray-600">Manage your car rental listings</p>
            </div>
            <a
              href="/list-car"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Car
            </a>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your cars..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="min-w-[150px]">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* Sort */}
            <div className="min-w-[150px]">
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="totalBookings-desc">Most Booked</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedCars.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
              <span className="text-blue-700">
                {selectedCars.length} car(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkActions(true)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Bulk Update
                </button>
                <button
                  onClick={() => setSelectedCars([])}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Select All */}
          {cars.length > 0 && (
            <div className="mt-4 flex items-center">
              <button
                onClick={handleSelectAllCars}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                {selectedCars.length === cars.length ? (
                  <CheckSquare className="h-4 w-4 mr-2 text-blue-600" />
                ) : (
                  <Square className="h-4 w-4 mr-2" />
                )}
                {selectedCars.length === cars.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          )}
        </div>

        {/* Cars Grid */}
        {cars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {cars.map((car) => (
              <CarCard key={car._id} car={car} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cars found</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.status 
                ? 'Try adjusting your filters to see more cars.'
                : 'Start by adding your first car listing!'
              }
            </p>
            <a
              href="/list-car"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Car
            </a>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(currentPage * pagination.limit, pagination.totalCount)} of{' '}
                {pagination.totalCount} cars
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded ${
                      page === currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions Modal */}
        <BulkActionsModal />
      </div>
    </div>
  );
};

export default ListingManagement;