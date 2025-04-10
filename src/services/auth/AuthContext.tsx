import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from './authService';
import { 
  AuthUser, 
  AuthError, 
  AuthContextType, 
  SignInCredentials, 
  SignUpCredentials 
} from './types';

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  clearError: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Clear any authentication errors
  const clearError = () => setError(null);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        const { user, error } = await authService.getCurrentUser();
        
        if (error) {
          setError(error);
        } else {
          setUser(user);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        setError({ message: 'Failed to load user information' });
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Set up auth state change listener
    const { data: authListener } = authService.onAuthStateChange((updatedUser) => {
      setUser(updatedUser);
    });

    // Clean up subscription on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (credentials: SignInCredentials) => {
    try {
      setIsLoading(true);
      clearError();
      
      const { user, error } = await authService.signIn(credentials);
      
      if (error) {
        setError(error);
      } else {
        setUser(user);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError({ message: 'Failed to sign in. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (credentials: SignUpCredentials) => {
    try {
      setIsLoading(true);
      clearError();
      
      const { user, error } = await authService.signUp(credentials);
      
      if (error) {
        setError(error);
      } else {
        setUser(user);
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError({ message: 'Failed to sign up. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      clearError();
      
      const { error } = await authService.signOut();
      
      if (error) {
        setError(error);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Sign out error:', err);
      setError({ message: 'Failed to sign out. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      clearError();
      
      const { error } = await authService.resetPassword(email);
      
      if (error) {
        setError(error);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError({ message: 'Failed to send reset password email. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Value to provide in context
  const value = {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the auth service index
export { authService } from './authService';
export type { AuthUser, AuthError, SignInCredentials, SignUpCredentials } from './types';
