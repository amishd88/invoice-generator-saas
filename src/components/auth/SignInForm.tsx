import { useState } from 'react';
import { useAuth } from '../../services/auth/AuthContext';
import ErrorMessage from '../common/ErrorMessage';

const SignInForm = () => {
  const { signIn, error, clearError, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotPassword) {
      // Handle password reset flow
      await resetPassword();
    } else {
      // Handle sign in flow
      await signIn({ email, password });
    }
  };

  const resetPassword = async () => {
    if (!email) {
      // Show error for missing email
      return;
    }
    try {
      await useAuth().resetPassword(email);
      alert('Password reset email sent. Please check your inbox.');
      setForgotPassword(false);
    } catch (error) {
      console.error('Reset password error:', error);
    }
  };

  const toggleForgotPassword = () => {
    clearError();
    setForgotPassword(!forgotPassword);
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-lg shadow-lg bg-white p-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        {forgotPassword ? 'Reset Password' : 'Sign In'}
      </h2>

      {error && <ErrorMessage message={error.message} onDismiss={clearError} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {!forgotPassword && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={toggleForgotPassword}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {forgotPassword ? 'Back to Sign In' : 'Forgot Password?'}
          </button>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : forgotPassword ? (
              'Send Reset Link'
            ) : (
              'Sign In'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignInForm;
