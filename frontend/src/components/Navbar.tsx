import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, User, LogOut, Menu, X, Briefcase, FileText, Bookmark, Settings, Shield } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, notifications, markNotificationRead, unreadCount, fetchNotifications } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [selectedCurrency, setSelectedCurrency] = useState(localStorage.getItem('currency') || 'USD');

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCurrency(value);
    localStorage.setItem('currency', value);
    window.dispatchEvent(new Event('currencyChange'));
  };

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-tr from-brand-600 to-brand-400 p-2 rounded-xl text-white shadow-md shadow-brand-500/30">
                <Briefcase className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
                JobConnect
              </span>
            </Link>

            {/* Main Desktop Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-2">
              <Link to="/" className={linkClass('/')}>
                Home
              </Link>

              {user?.role === 'JOB_SEEKER' && (
                <>
                  <Link to="/jobs" className={linkClass('/jobs')}>
                    Find Jobs
                  </Link>
                  <Link to="/saved-jobs" className={linkClass('/saved-jobs')}>
                    Saved Jobs
                  </Link>
                  <Link to="/applications" className={linkClass('/applications')}>
                    My Applications
                  </Link>
                </>
              )}

              {user?.role === 'EMPLOYER' && (
                <>
                  <Link to="/employer/dashboard" className={linkClass('/employer/dashboard')}>
                    Dashboard
                  </Link>
                  <Link to="/employer/post-job" className={linkClass('/employer/post-job')}>
                    Post a Job
                  </Link>
                </>
              )}

              {user?.role === 'ADMIN' && (
                <>
                  <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                    Admin Dashboard
                  </Link>
                  <Link to="/admin/users" className={linkClass('/admin/users')}>
                    Manage Users
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center space-x-4">
            {/* Region / Currency Selector */}
            <div className="relative">
              <select
                value={selectedCurrency}
                onChange={handleCurrencyChange}
                className="bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-650 outline-none cursor-pointer focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              >
                <option value="USD">🇺🇸 USD ($)</option>
                <option value="INR">🇮🇳 INR (₹)</option>
              </select>
            </div>
            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      fetchNotifications();
                    }}
                    className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 z-50 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                        <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full font-medium">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      <div className="py-1">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => !notif.isRead && markNotificationRead(notif.id)}
                              className={`px-4 py-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors text-xs flex flex-col space-y-1 ${
                                !notif.isRead ? 'bg-brand-50/50 font-medium' : ''
                              }`}
                            >
                              <span className="text-slate-800">{notif.message}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(notif.createdAt).toLocaleDateString()}{' '}
                                {new Date(notif.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    {user.profilePictureUrl ? (
                      <img
                        src={`http://localhost:8080${user.profilePictureUrl}`}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold uppercase">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <span className="hidden md:block text-sm font-medium text-slate-700">
                      {user.name}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 mb-1">
                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full uppercase">
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>

                      {user.role === 'JOB_SEEKER' && (
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          <User className="h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                      )}

                      {user.role === 'EMPLOYER' && (
                        <Link
                          to="/employer/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Company Profile</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Links Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>

          {user?.role === 'JOB_SEEKER' && (
            <>
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Find Jobs
              </Link>
              <Link
                to="/saved-jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Saved Jobs
              </Link>
              <Link
                to="/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                My Applications
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                My Profile
              </Link>
            </>
          )}

          {user?.role === 'EMPLOYER' && (
            <>
              <Link
                to="/employer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <Link
                to="/employer/post-job"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Post a Job
              </Link>
              <Link
                to="/employer/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Company Profile
              </Link>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Manage Users
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
