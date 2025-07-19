import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Menu,
  X,
  Bell,
  Car,
  Calendar,
  Settings,
  LogOut,
  User,
  Shield,
  BarChart3,
  Plus,
  Search,
  MapPin,
  ChevronDown,
  Home,
  HelpCircle,
} from "lucide-react";
import API from "./api";
import LanguageToggle from "./components/LanguageToggle";
import NotificationBell from "./components/NotificationBell";
import { useTranslation } from "react-i18next";
import { useAuth } from "./context/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const { t } = useTranslation();
  const { user, loading, logout } = useAuth();


  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Search functionality
  useEffect(() => {
    const searchCars = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await API.get(
          `/cars?search=${encodeURIComponent(searchQuery)}&limit=5`
        );
        setSearchResults(response.data.data.cars || []);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchCars, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Navigation items based on user role
  const getNavItems = () => {
    if (!user) {
      return [
        { label: t("navigation.browseCars"), path: "/", icon: Car },
        { label: t("navigation.howItWorks"), path: "/how-it-works", icon: HelpCircle },
      ];
    }

    // Keep only essential items in main navbar
    return [
      { label: t("navigation.home"), path: "/", icon: Home },
      { label: t("navigation.browseCars"), path: "/browse", icon: Car },
    ];
  };



  const navItems = getNavItems();

  const profileMenuItems = [
    { label: t("profile.myProfile"), path: "/profile", icon: User },
    { label: t("navigation.myBookings"), path: "/my-bookings", icon: Calendar },
    ...(user?.role === "owner"
      ? [
          { label: "My Cars", path: "/my-cars", icon: Car },
          { label: "Seller Dashboard", path: "/seller/dashboard", icon: BarChart3 },
          { label: "My Listings", path: "/seller/listings", icon: Car },
          { label: "Orders", path: "/seller/orders", icon: Calendar },
        ]
      : []),
    ...(user?.role === "admin"
      ? [
          { label: "Admin Dashboard", path: "/admin/dashboard", icon: BarChart3 },
          { label: "User Management", path: "/admin?tab=users", icon: User },
          { label: "Car Management", path: "/admin?tab=cars", icon: Shield },
          { label: "Bookings", path: "/admin?tab=bookings", icon: Calendar },
        ]
      : []),
    { label: t("navigation.settings"), path: "/settings", icon: Settings },
    { label: "Support", path: "/support", icon: HelpCircle },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsProfileOpen(false);
      navigate("/");
    }
  };

  const handleSearchResultClick = (car) => {
    navigate(`/cars/${car._id}`);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const isActivePath = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-xl mr-3 animate-pulse"></div>
                <div className="hidden sm:block">
                  <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex space-x-4">
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`sticky top-0 z-50 bg-white border-b transition-all duration-300 ${
        scrolled ? "shadow-lg border-gray-200" : "border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center group cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl mr-3 group-hover:shadow-lg transition-all duration-200">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-xl text-gray-900">
                  BorrowMyCar
                </span>
                <div className="text-xs text-gray-500 -mt-1">
                  UAE Car Rental
                </div>
              </div>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cars by make, model, or location..."
                className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                onFocus={() => setIsSearchOpen(true)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>

              {/* Search Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div>
                      <div className="text-sm text-gray-500 mt-2">
                        Searching...
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      <div className="text-xs text-gray-500 px-4 py-2 font-medium">
                        Search Results
                      </div>
                      {searchResults.map((car) => (
                        <button
                          key={car._id}
                          onClick={() => handleSearchResultClick(car)}
                          className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                        >
                          <img
                            src={car.images?.[0] || "/placeholder-car.jpg"}
                            alt={car.title}
                            className="w-12 h-8 object-cover rounded mr-3"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {car.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {car.city} • AED {car.price}/day
                            </div>
                          </div>
                        </button>
                      ))}
                      {searchQuery.trim() && (
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full flex items-center px-4 py-3 border-t border-gray-100 hover:bg-gray-50 transition-colors text-left"
                        >
                          <Search className="h-4 w-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-700">
                            See all results for "{searchQuery}"
                          </span>
                        </button>
                      )}
                    </div>
                  ) : searchQuery.trim().length > 1 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No cars found for "{searchQuery}"
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="text-sm text-gray-600 mb-3">
                        Popular Searches
                      </div>
                      <div className="space-y-2">
                        {[
                          "BMW 3 Series Dubai",
                          "Toyota Camry Abu Dhabi",
                          "Mercedes C-Class Sharjah",
                        ].map((search, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSearchQuery(search);
                              handleSearchSubmit({ preventDefault: () => {} });
                            }}
                            className="flex items-center w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Search className="h-4 w-4 text-gray-400 mr-3" />
                            <span className="text-sm text-gray-700">
                              {search}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all relative group ${
                  isActivePath(item.path)
                    ? "text-green-600 bg-green-50"
                    : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                {item.label}
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Language Toggle & Auth Buttons / Profile */}
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {t("navigation.signIn")}
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {t("navigation.getStarted")}
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Quick Action Button (for owners) */}
                {user.role === "owner" && user.isApproved && (
                  <Link
                    to="/list-car"
                    className="hidden md:flex items-center bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-green-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t("navigation.listCar")}
                  </Link>
                )}
                {/* Notifications */}
                <NotificationBell />
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={toggleProfile}
                    className="flex items-center space-x-3 text-gray-700 hover:text-green-600 p-1 rounded-lg focus:outline-none transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      {/* Enhanced Profile Picture */}
                      <div className="relative">
                        <img
                          className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                          src={
                            user.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.name || "User"
                            )}&background=10b981&color=ffffff&size=64`
                          }
                          alt="Profile"
                          onError={(e) => {
                            // Fallback to UI Avatars if image fails to load
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.name || "User"
                            )}&background=10b981&color=ffffff&size=64`;
                          }}
                        />
                        {/* Online Status Indicator */}
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-400 border-2 border-white rounded-full"></div>
                      </div>

                      <div className="hidden md:block text-left">
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500 capitalize">
                          {user.role}
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isProfileOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={
                              user.profileImage ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.name || "User"
                              )}&background=10b981&color=ffffff&size=80`
                            }
                            alt="Profile"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.name || "User"
                              )}&background=10b981&color=ffffff&size=80`;
                            }}
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  user.isApproved
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {user.isApproved ? t("common.verified") : t("common.pending")}
                              </span>
                              <span className="text-xs text-gray-500 capitalize">
                                {user.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {profileMenuItems.map((item) => (
                          <Link
                            key={item.label}
                            to={item.path}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <item.icon className="h-4 w-4 mr-3" />
                            {item.label}
                          </Link>
                        ))}
                        {/* Logout Button */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          {t("navigation.logout")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 focus:outline-none transition-colors cursor-pointer"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          {/* Mobile Search */}
          <div className="px-4 py-3 border-b border-gray-100">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("common.search")}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </form>
          </div>

          {/* Mobile Navigation Items */}
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center w-full px-3 py-3 rounded-lg text-base font-medium transition-colors relative ${
                  isActivePath(item.path)
                    ? "text-green-600 bg-green-50"
                    : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                }`}
              >
                {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                {item.label}
                {item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}

            {!user && (
              <>
                <Link
                  to="/login"
                  className="flex items-center w-full text-gray-700 hover:text-green-600 hover:bg-green-50 px-3 py-3 rounded-lg text-base font-medium transition-colors"
                >
                  {t("navigation.signIn")}
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-3 rounded-lg text-base font-medium transition-colors"
                >
                  {t("navigation.getStarted")}
                </Link>
              </>
            )}

            {user?.role === "owner" && user?.isApproved && (
              <Link
                to="/list-car"
                className="flex items-center w-full bg-green-50 text-green-700 hover:bg-green-100 px-3 py-3 rounded-lg text-base font-medium transition-colors border border-green-200"
              >
                <Plus className="h-5 w-5 mr-3" />
                {t("navigation.listCar")}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Overlay for dropdowns */}
      {(isProfileOpen || isSearchOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsProfileOpen(false);
            setIsSearchOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;
