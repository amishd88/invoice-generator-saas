/**
 * API Error Handler
 * 
 * This utility helps standardize error handling for API requests
 * and provides user-friendly error messages.
 */

// Standard error structure
export interface ApiError {
  message: string;
  details?: any;
  retry?: boolean;
}

// Error codes from Supabase/PostgreSQL that we want to handle specially
const ERROR_CODES: Record<string, string> = {
  '23505': 'A record with this information already exists.',
  '23503': 'The referenced record does not exist.',
  '23514': 'The data does not meet validation requirements.',
  '42P01': 'The requested resource does not exist.',
  '42703': 'The requested field does not exist.',
  '22023': 'Invalid parameter value.',
  '22P02': 'Invalid input syntax.',
  '28000': 'Authorization failed.',
  '28P01': 'Authentication failed.',
  '2201W': 'Invalid array input.',
  '2201E': 'Invalid text representation.'
};

// Map database error constraint names to user-friendly messages
const CONSTRAINT_MESSAGES: Record<string, string> = {
  'customers_email_key': 'A customer with this email already exists.',
  'products_sku_key': 'A product with this SKU already exists.',
  'invoices_invoice_number_key': 'An invoice with this number already exists.'
};

/**
 * Format database errors for end-user consumption
 */
export function handleDatabaseError(error: any): ApiError {
  console.log('Handling database error:', error);
  
  // Default error response
  const response: ApiError = {
    message: 'An unexpected error occurred',
    details: {},
    retry: false
  };
  
  // If we have a PostgreSQL error code, map it to a user-friendly message
  if (error.code && ERROR_CODES[error.code]) {
    response.message = ERROR_CODES[error.code];
    response.details = { code: error.code, hint: error.hint };
  }
  
  // If we have a constraint violation, use the constraint-specific message
  if (error.code === '23505' && error.detail) {
    const constraintMatch = error.detail.match(/\((.*?)\)=/);
    if (constraintMatch && constraintMatch[1]) {
      response.message = `A record with this ${constraintMatch[1]} already exists.`;
    }
  }
  
  // If we have a specific constraint name, use its message
  if (error.constraint && CONSTRAINT_MESSAGES[error.constraint]) {
    response.message = CONSTRAINT_MESSAGES[error.constraint];
  }
  
  // Handle network errors
  if (error.message && error.message.includes('Failed to fetch')) {
    response.message = 'Network connection error. Please check your internet connection.';
    response.retry = true;
  }
  
  // Handle authentication errors
  if (error.statusCode === 401 || error.status === 401) {
    response.message = 'Your session has expired. Please sign in again.';
    // Redirect to login page or refresh token as needed
  }
  
  // Include the original error message in details for debugging
  response.details = {
    ...response.details,
    originalMessage: error.message,
    originalError: error
  };
  
  console.log('Formatted error response:', response);
  return response;
}

/**
 * Handles validation errors from form validations
 */
export function handleValidationError(errors: Record<string, string>): ApiError {
  return {
    message: 'Please correct the errors in the form',
    details: { validationErrors: errors },
    retry: false
  };
}

/**
 * Handle generic API errors
 */
export function handleApiError(error: any): ApiError {
  // If it's already an ApiError object, return it
  if (error && error.message && (error.details !== undefined || error.retry !== undefined)) {
    return error as ApiError;
  }
  
  // If it's a database/Supabase error
  if (error && error.code) {
    return handleDatabaseError(error);
  }
  
  // Default error handling for other types
  return {
    message: error?.message || 'An unexpected error occurred',
    details: error,
    retry: false
  };
}

// Toast handler interface
export interface ToastHandler {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

// Global toast handler
let toastHandler: ToastHandler | null = null;

/**
 * Sets the toast handler for the application
 * This allows API error handling to show toast notifications
 */
export function setToastHandler(handler: ToastHandler): void {
  toastHandler = handler;
}

/**
 * Get the current toast handler
 */
export function getToastHandler(): ToastHandler | null {
  return toastHandler;
}
