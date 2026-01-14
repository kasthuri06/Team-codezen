import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  CameraIcon, 
  SparklesIcon, 
  UserIcon,
  CalendarIcon,
  Bars3Icon,
  XMarkIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { NavItem } from '../types';
import CreditBadge from './CreditBadge';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Virtual Try-On', href: '/tryon', icon: CameraIcon },
    { name: 'Local Try-On', href: '/local-tryon', icon: CameraIcon },
    { name: 'AI Stylist', href: '/stylist', icon: SparklesIcon },
    { name: 'Outfit Calendar', href: '/calendar', icon: CalendarIcon },
    { name: 'Subscription', href: '/subscription', icon: CreditCardIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full opacity-20 animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-full opacity-10 animate-float"></div>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className={`fixed inset-y-0 left-0 flex w-64 flex-col bg-black shadow-xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-16 items-center justify-between px-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center space-x-3">
              {/* Logo Image */}
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-2 ring-cyan-400/30">
                <img 
                  src="/sitfit-logo.png" 
                  alt="SitFit Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Brand Name with Gradient */}
              <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">Sit</span>
                <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">Fit</span>
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-cyan-300 transition-colors duration-200 p-1 rounded-lg hover:bg-purple-900/30"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 bg-gradient-to-b from-black to-gray-900">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <div
                  key={item.name}
                  className="stagger-item"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gradient-to-r hover:from-blue-900/50 hover:to-purple-900/50 hover:text-blue-200'
                    }`}
                  >
                    <item.icon className={`mr-3 h-6 w-6 flex-shrink-0 transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-300'
                    }`} />
                    {item.name}
                  </Link>
                </div>
              );
            })}
          </nav>
          <div className="border-t border-gray-700 p-4 bg-gradient-to-r from-gray-900 to-black">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-sm font-medium text-white">
                    {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user?.displayName || 'User'}
                </p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors duration-200 hover:underline"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col animate-slideDown">
        <div className="flex flex-col flex-grow bg-black/95 backdrop-blur-xl border-r border-gray-700 shadow-xl">
          <div className="flex h-16 items-center px-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center space-x-3 flex-1">
              {/* Logo Image */}
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-2 ring-cyan-400/30">
                <img 
                  src="/sitfit-logo.png" 
                  alt="SitFit Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Brand Name with Gradient */}
              <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">Sit</span>
                <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">Fit</span>
              </h1>
            </div>
            <CreditBadge />
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 bg-gradient-to-b from-black/95 to-gray-900/95">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <div
                  key={item.name}
                  className="stagger-item"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Link
                    to={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gradient-to-r hover:from-blue-900/50 hover:to-purple-900/50 hover:text-blue-200'
                    }`}
                  >
                    <item.icon className={`mr-3 h-6 w-6 flex-shrink-0 transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-300'
                    }`} />
                    {item.name}
                  </Link>
                </div>
              );
            })}
          </nav>
          <div className="border-t border-gray-700 p-4 bg-gradient-to-r from-gray-900/95 to-black/95">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-sm font-medium text-white">
                    {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-400">{user?.email}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors duration-200 mt-1 hover:underline"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-700 bg-black/95 backdrop-blur-xl px-4 shadow-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white hover:text-blue-400 transition-colors duration-200 p-2 rounded-lg hover:bg-purple-900/30"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SitFit
          </h1>
          <div className="ml-auto">
            <CreditBadge />
          </div>
        </div>

        {/* Page content */}
        <main className="py-6 animate-fadeIn">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;