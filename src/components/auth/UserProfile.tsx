import { useState } from 'react';
import { useAuth } from '../../services/auth/AuthContext';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      setError('Failed to sign out. Please try again.');
    }
  };

  const clearSuccess = () => setSuccessMessage(null);
  const clearError = () => setError(null);

  return (
    <div className="relative inline-block text-left">
      {successMessage && <SuccessMessage message={successMessage} onDismiss={clearSuccess} />}
      {error && <ErrorMessage message={error} onDismiss={clearError} />}

      <div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          id="user-menu-button"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
        </button>
      </div>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          <div className="py-3 px-4 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user?.email || 'No email'}
            </p>
          </div>
          <div className="py-1" role="none">
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
