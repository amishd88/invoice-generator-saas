import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../services/auth/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * A simplified version of the ProtectedRoute component
 * This component checks if the user is authenticated and redirects to login if not
 */
const SimpleProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default SimpleProtectedRoute;
