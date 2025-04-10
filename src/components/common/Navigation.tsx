import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();
  const { plan, openUpgradeModal } = useSubscription();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Active link style
  const activeClass = "text-primary-700 border-b-2 border-primary-700";
  const inactiveClass = "text-text-secondary hover:text-primary-600 border-b-2 border-transparent hover:border-primary-300 transition-colors duration-200";

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img
                  className="h-10 w-auto"
                  src="/logo.svg"
                  alt="DataMinds.Services Logo"
                />
                <span className="ml-2 text-xl font-bold text-primary-800 font-lexend">
                  Invoice Generator
                </span>
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink
                  to="/"
                  className={({ isActive }) => `inline-flex items-center px-1 pt-1 ${isActive ? activeClass : inactiveClass}`}
                  end
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/invoices"
                  className={({ isActive }) => `inline-flex items-center px-1 pt-1 ${isActive ? activeClass : inactiveClass}`}
                >
                  Invoices
                </NavLink>
                <NavLink
                  to="/customers"
                  className={({ isActive }) => `inline-flex items-center px-1 pt-1 ${isActive ? activeClass : inactiveClass}`}
                >
                  Customers
                </NavLink>
                <NavLink
                  to="/products"
                  className={({ isActive }) => `inline-flex items-center px-1 pt-1 ${isActive ? activeClass : inactiveClass}`}
                >
                  Products
                </NavLink>
                <NavLink
                  to="/reports"
                  className={({ isActive }) => `inline-flex items-center px-1 pt-1 ${isActive ? activeClass : inactiveClass}`}
                >
                  Reports & Analytics
                </NavLink>
              </div>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <>
                <span className={`px-3 py-1 rounded-full text-xs font-medium mr-4 ${
                  plan === 'premium' 
                    ? 'bg-primary-700 text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}>
                  {plan === 'premium' ? 'Premium' : 'Free Plan'}
                </span>
                {plan !== 'premium' && (
                  <button
                    onClick={openUpgradeModal}
                    className="btn-primary mr-4"
                  >
                    Upgrade to Premium
                  </button>
                )}
                <div className="relative">
                  <button
                    onClick={handleSignOut}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="btn-primary"
              >
                Sign In
              </Link>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        {user ? (
          <>
            <div className="pt-2 pb-3 space-y-1">
              <NavLink
                to="/"
                className={({ isActive }) => 
                  `block pl-3 pr-4 py-2 border-l-4 ${
                    isActive 
                      ? 'border-primary-700 text-primary-700 bg-primary-50' 
                      : 'border-transparent text-text-secondary hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
                end
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/invoices"
                className={({ isActive }) => 
                  `block pl-3 pr-4 py-2 border-l-4 ${
                    isActive 
                      ? 'border-purple-700 text-purple-700 bg-purple-50' 
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Invoices
              </NavLink>
              <NavLink
                to="/customers"
                className={({ isActive }) => 
                  `block pl-3 pr-4 py-2 border-l-4 ${
                    isActive 
                      ? 'border-purple-700 text-purple-700 bg-purple-50' 
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Customers
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) => 
                  `block pl-3 pr-4 py-2 border-l-4 ${
                    isActive 
                      ? 'border-purple-700 text-purple-700 bg-purple-50' 
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </NavLink>
              <NavLink
                to="/reports"
                className={({ isActive }) => 
                  `block pl-3 pr-4 py-2 border-l-4 ${
                    isActive 
                      ? 'border-purple-700 text-purple-700 bg-purple-50' 
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Reports & Analytics
              </NavLink>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-700 flex items-center justify-center text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.email}</div>
                  <div className="text-sm font-medium text-gray-500">Plan: {plan === 'premium' ? 'Premium' : 'Free'}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {plan !== 'premium' && (
                  <button
                    onClick={() => {
                      openUpgradeModal();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-primary-700 hover:bg-gray-100"
                  >
                    Upgrade to Premium
                  </button>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-4 px-4 border-t border-gray-200">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary w-full text-center"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
