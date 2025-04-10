import React from 'react';
import { ApiError } from '../../utils/apiErrorHandler';

export interface ErrorStateProps {
  error: ApiError | Error | string | null;
  onRetry?: () => void;
  title?: string;
  className?: string;
  compact?: boolean;
}

/**
 * ErrorState component
 * 
 * A reusable component for displaying errors in a consistent way
 * 
 * @param error The error to display
 * @param onRetry Optional callback for retry action
 * @param title Optional custom title for the error
 * @param className Optional additional CSS classes
 * @param compact Whether to display a more compact version
 */
const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  title = 'Something went wrong',
  className = '',
  compact = false
}) => {
  if (!error) return null;
  
  // Format the error message
  let errorMessage: string;
  let canRetry = false;
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if ('message' in error) {
    errorMessage = error.message;
    if ('retry' in error) {
      canRetry = error.retry || false;
    }
  } else {
    errorMessage = 'An unexpected error occurred';
  }
  
  // Compact version (for inline errors)
  if (compact) {
    return (
      <div className={`text-red-600 text-sm my-2 ${className}`}>
        <p>{errorMessage}</p>
        {(onRetry && canRetry) && (
          <button
            onClick={onRetry}
            className="text-red-700 underline ml-2 hover:text-red-800 focus:outline-none"
          >
            Try again
          </button>
        )}
      </div>
    );
  }
  
  // Standard error display
  return (
    <div className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md ${className}`} role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-1 text-sm text-red-700">
            <p>{errorMessage}</p>
          </div>
          {(onRetry && canRetry) && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 hover:bg-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
