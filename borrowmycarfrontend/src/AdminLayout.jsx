import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useAdminAuth } from './context/AdminAuthProvider';
import { Helmet } from 'react-helmet-async';

const AdminLayout = () => {
  const { login: _login } = useAuth();
  const { adminUser, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    // Get previous user state before logging out
    const previousUserState = adminLogout();
    
    // If there was a previous user session, restore it
    if (previousUserState?.user && previousUserState?.token) {
      try {
        // Restore the previous user session to the appropriate storage
        const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
        storage.setItem('token', previousUserState.token);
        storage.setItem('user', JSON.stringify(previousUserState.user));
        
        // Force a page reload to properly restore the AuthProvider state
        window.location.href = '/';
      } catch (error) {
        console.error('Error restoring previous session:', error);
        navigate('/', { replace: true });
      }
    } else {
      // No previous session, just navigate to home page
      navigate('/', { replace: true });
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊', current: location.pathname === '/admin/dashboard' },
    { name: 'Users', href: '/admin/users', icon: '👥', current: location.pathname === '/admin/users' },
    { name: 'Cars', href: '/admin/cars', icon: '🚗', current: location.pathname === '/admin/cars' },
    { name: 'Bookings', href: '/admin/bookings', icon: '📅', current: location.pathname === '/admin/bookings' },
    { name: 'Reports', href: '/admin/reports', icon: '📈', current: location.pathname === '/admin/reports' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️', current: location.pathname === '/admin/settings' },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Panel | BorrowMyCar</title>
      </Helmet>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-gray-600 opacity-75"></div>
          </div>
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between h-16 px-6 bg-red-600 flex-shrink-0">
            <div className="flex items-center">
              <div className="text-white text-xl font-bold">
                🚗 Admin Panel
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 mt-8 px-4 overflow-y-auto">
            <div className="space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="px-4 py-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Quick Actions
                </p>
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => navigate('/admin/users?filter=pending')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 rounded hover:bg-gray-50"
                  >
                    📋 Pending Approvals
                  </button>
                  <button
                    onClick={() => navigate('/admin/reports')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 rounded hover:bg-gray-50"
                  >
                    📊 Export Data
                  </button>
                  <button
                    onClick={() => window.open('/', '_blank')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 rounded hover:bg-gray-50"
                  >
                    🌐 View Site
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col lg:pl-0">
          {/* Top navigation */}
          <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-sm">
                      {adminUser?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{adminUser?.name}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate('/admin/settings')}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Settings"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 py-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;