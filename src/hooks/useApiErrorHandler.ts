import { useEffect } from 'react';
import { useToast } from '../components/common/ToastContainer';
import { setToastHandler } from '../utils/apiErrorHandler';

/**
 * Hook to initialize the API error handler with the toast system
 * This should be called in a high-level component like App.tsx
 */
export function useApiErrorHandler() {
  const { addToast } = useToast();
  
  useEffect(() => {
    // Set up the toast handler for the API error handler
    setToastHandler({
      error: (message: string) => addToast(message, 'error'),
      success: (message: string) => addToast(message, 'success'),
      warning: (message: string) => addToast(message, 'warning'),
      info: (message: string) => addToast(message, 'info')
    });
    
    // No need to clean up as the toast handler should persist
  }, [addToast]);
  
  return null;
}
