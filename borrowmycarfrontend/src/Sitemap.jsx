import React from 'react';
import { Link } from 'react-router-dom';

const Sitemap = () => {
  const mainPages = [
    { name: 'Home', path: '/' },
    { name: 'Browse Cars', path: '/browse' },
    { name: 'List Your Car', path: '/list-car' },
    { name: 'How It Works', path: '/how-it-works' }
  ];

  const userPages = [
    { name: 'Login', path: '/login' },
    { name: 'Sign Up', path: '/signup' },
    { name: 'Forgot Password', path: '/forgot-password' },
    { name: 'Profile', path: '/profile' },
    { name: 'Settings', path: '/settings' },
    { name: 'My Bookings', path: '/my-bookings' }
  ];

  const dashboardPages = [
    { name: 'Seller Dashboard', path: '/seller-dashboard' },
    { name: 'Admin Login', path: '/admin-login' },
    { name: 'Admin Dashboard', path: '/admin-dashboard' }
  ];

  const legalPages = [
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Cookie Policy', path: '/cookies' },
    { name: 'Refund Policy', path: '/refunds' },
    { name: 'Rental Agreement', path: '/rental-agreement' },
    { name: 'Insurance Policy', path: '/insurance' }
  ];

  const companyPages = [
    { name: 'About Us', path: '/about' },
    { name: 'Our Story', path: '/story' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Help & Support', path: '/help' }
  ];

  const SitemapSection = ({ title, pages }) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <ul className="space-y-2">
        {pages.map((page) => (
          <li key={page.path}>
            <Link
              to={page.path}
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              {page.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sitemap</h1>
        <p className="text-gray-600 mb-12">
          Find all the pages and resources available on BorrowMyCar. Use this sitemap to quickly navigate to any section of our website.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <SitemapSection title="Main Pages" pages={mainPages} />
          <SitemapSection title="User Account" pages={userPages} />
          <SitemapSection title="Dashboards" pages={dashboardPages} />
          <SitemapSection title="Legal & Policies" pages={legalPages} />
          <SitemapSection title="Company" pages={companyPages} />
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;