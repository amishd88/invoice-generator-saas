import { supabase } from '../lib/supabaseClient';
import { handleApiError, handleAuthError } from './apiErrorHandler';

type ApiRequestOptions = {
  showToastOnError?: boolean;
  logToConsole?: boolean;
  logToServer?: boolean;
  context?: string;
  retryCount?: number;
  maxRetries?: number;
  retryDelay?: number;
};

const defaultOptions: ApiRequestOptions = {
  showToastOnError: true,
  logToConsole: true,
  logToServer: false,
  context: 'API Request',
  retryCount: 0,
  maxRetries: 2,
  retryDelay: 1000
};

/**
 * Wrapper function for API requests that handles:
 * - Authentication token management
 * - Error handling
 * - Retries for transient errors
 * - Loading state management
 * 
 * @param requestFn The actual request function to execute
 * @param options Options for handling the request
 * @returns The result of the request
 */
export async function executeApiRequest<T>(
  requestFn: () => Promise<T>,
  options: ApiRequestOptions = {}
): Promise<T> {
  // Merge provided options with defaults
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    // Check if user is authenticated before making the request
    const { data: authData } = await supabase.auth.getSession();
    
    if (!authData?.session) {
      throw new Error('Not authenticated');
    }
    
    // Execute the actual request
    return await requestFn();
    
  } catch (error: any) {
    // Check if it's an authentication error
    if (error.status === 401 || error.message?.includes('authenticated')) {
      handleAuthError(error);
      
      // Try to refresh the token
      try {
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          throw refreshError;
        }
        
        if (data?.session) {
          // If retry count is below max retries, try again
          if (mergedOptions.retryCount! < mergedOptions.maxRetries!) {
            // Wait for retry delay
            await new Promise(resolve => setTimeout(resolve, mergedOptions.retryDelay));
            
            // Retry with incremented count
            return executeApiRequest(requestFn, {
              ...mergedOptions,
              retryCount: mergedOptions.retryCount! + 1
            });
          }
        }
      } catch (refreshError) {
        handleAuthError(refreshError);
      }
    }
    
    // For other errors, handle normally
    handleApiError(error, mergedOptions.context!, {
      showToast: mergedOptions.showToastOnError,
      logToConsole: mergedOptions.logToConsole,
      logToServer: mergedOptions.logToServer
    });
    
    // Re-throw the error for the caller to handle
    throw error;
  }
}

/**
 * Specific wrapper for Supabase queries that adds proper error handling
 * and authentication management
 * 
 * @param queryBuilder A function that builds and returns a Supabase query
 * @param options Options for handling the request
 * @returns The result of the Supabase query
 */
export async function executeSupabaseQuery<T>(
  queryBuilder: () => Promise<{ data: T; error: any }>,
  options: ApiRequestOptions = {}
): Promise<T> {
  return executeApiRequest(async () => {
    const { data, error } = await queryBuilder();
    
    if (error) {
      throw error;
    }
    
    return data as T;
  }, options);
}

/**
 * Helper for authenticated GET requests to external APIs
 * 
 * @param url The URL to fetch
 * @param options Fetch options and request handling options
 * @returns The response data
 */
export async function authenticatedGet<T>(
  url: string,
  options: ApiRequestOptions & RequestInit = {}
): Promise<T> {
  const { showToastOnError, logToConsole, logToServer, context, retryCount, maxRetries, retryDelay, ...fetchOptions } = options;
  
  return executeApiRequest(async () => {
    // Get the current session
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    
    // Set up headers with authentication
    const headers = new Headers(fetchOptions.headers);
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    
    // Execute the fetch
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      method: 'GET'
    });
    
    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    // Parse JSON response
    return await response.json();
  }, { showToastOnError, logToConsole, logToServer, context, retryCount, maxRetries, retryDelay });
}

/**
 * Helper for authenticated POST requests to external APIs
 * 
 * @param url The URL to fetch
 * @param body The request body
 * @param options Fetch options and request handling options
 * @returns The response data
 */
export async function authenticatedPost<T>(
  url: string,
  body: any,
  options: ApiRequestOptions & RequestInit = {}
): Promise<T> {
  const { showToastOnError, logToConsole, logToServer, context, retryCount, maxRetries, retryDelay, ...fetchOptions } = options;
  
  return executeApiRequest(async () => {
    // Get the current session
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    
    // Set up headers with authentication
    const headers = new Headers(fetchOptions.headers);
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    
    // Execute the fetch
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      method: 'POST',
      body: JSON.stringify(body)
    });
    
    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    // Parse JSON response
    return await response.json();
  }, { showToastOnError, logToConsole, logToServer, context, retryCount, maxRetries, retryDelay });
}
