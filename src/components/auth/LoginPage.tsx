import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../services/auth/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

enum AuthMode {
  SIGN_IN = 'sign_in',
  SIGN_UP = 'sign_up',
  RESET_PASSWORD = 'reset_password'
}

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>(AuthMode.SIGN_IN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword } = useAuth();
  const { addNotification } = useNotification();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === AuthMode.SIGN_IN) {
        await signIn({ email, password });
        addNotification('Successfully signed in!', 'success');
        navigate('/');
      } else if (mode === AuthMode.SIGN_UP) {
        if (password !== confirmPassword) {
          addNotification('Passwords do not match', 'error');
          setLoading(false);
          return;
        }
        await signUp({ email, password, fullName: email.split('@')[0] });
        addNotification('Account created successfully! Please check your email for verification.', 'success');
        setMode(AuthMode.SIGN_IN);
      } else if (mode === AuthMode.RESET_PASSWORD) {
        await resetPassword(email);
        addNotification('Password reset email sent! Please check your inbox.', 'success');
        setMode(AuthMode.SIGN_IN);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      addNotification(`Authentication failed: ${(error as Error).message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 card">
        <div className="text-center">
          <img src="/logo.svg" alt="DataMinds.Services Logo" className="h-16 mx-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-text-primary font-lexend">
            {mode === AuthMode.SIGN_IN && 'Sign in to your account'}
            {mode === AuthMode.SIGN_UP && 'Create a new account'}
            {mode === AuthMode.RESET_PASSWORD && 'Reset your password'}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {mode === AuthMode.SIGN_IN && "Don't have an account? "}
            {mode === AuthMode.SIGN_UP && 'Already have an account? '}
            {mode === AuthMode.RESET_PASSWORD && 'Remember your password? '}
            
            {mode === AuthMode.SIGN_IN && (
              <button
                type="button"
                className="font-medium text-primary-700 hover:text-primary-600 transition-colors duration-200"
                onClick={() => setMode(AuthMode.SIGN_UP)}
              >
                Sign up here
              </button>
            )}
            {mode === AuthMode.SIGN_UP && (
              <button
                type="button"
                className="font-medium text-primary-700 hover:text-primary-600 transition-colors duration-200"
                onClick={() => setMode(AuthMode.SIGN_IN)}
              >
                Sign in here
              </button>
            )}
            {mode === AuthMode.RESET_PASSWORD && (
              <button
                type="button"
                className="font-medium text-primary-700 hover:text-primary-600 transition-colors duration-200"
                onClick={() => setMode(AuthMode.SIGN_IN)}
              >
                Sign in here
              </button>
            )}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {mode !== AuthMode.RESET_PASSWORD && (
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === AuthMode.SIGN_IN ? 'current-password' : 'new-password'}
                  required
                  className="form-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
            
            {mode === AuthMode.SIGN_UP && (
              <div>
                <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="form-input"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {mode === AuthMode.SIGN_IN && (
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-primary-700 hover:text-primary-600 transition-colors duration-200"
                  onClick={() => setMode(AuthMode.RESET_PASSWORD)}
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary group relative w-full flex justify-center ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : null}
              {mode === AuthMode.SIGN_IN && 'Sign in'}
              {mode === AuthMode.SIGN_UP && 'Sign up'}
              {mode === AuthMode.RESET_PASSWORD && 'Reset password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
