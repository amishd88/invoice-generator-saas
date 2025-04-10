import React, { useEffect } from 'react';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

/**
 * AppInitializer component
 * 
 * This component handles application-wide initialization:
 * - Sets up API error handling with toast notifications
 * - Initializes authentication listeners
 * - Handles other global app setup tasks
 */
const AppInitializer: React.FC = () => {
  // Initialize API error handling
  useApiErrorHandler();
  
  // React Router navigate function for redirects
  const navigate = useNavigate();
  
  // Set up authentication listeners
  useEffect(() => {
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event);
      
      // Handle auth events
      switch (event) {
        case 'SIGNED_IN':
          // User signed in, potentially refresh data
          console.log('User signed in:', session?.user?.email);
          break;
          
        case 'SIGNED_OUT':
          // User signed out, redirect to login
          console.log('User signed out');
          navigate('/login');
          break;
          
        case 'USER_UPDATED':
          // User details updated, potentially refresh UI
          console.log('User updated:', session?.user?.email);
          break;
          
        case 'TOKEN_REFRESHED':
          // Auth token refreshed, no action needed
          console.log('Token refreshed');
          break;
          
        case 'PASSWORD_RECOVERY':
          // Handle password recovery flow
          navigate('/reset-password');
          break;
      }
    });
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  // This component doesn't render anything
  return null;
};

export default AppInitializer;
