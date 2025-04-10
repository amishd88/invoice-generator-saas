import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create and export the client with default configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a custom fetch function with proper headers
export const fetchFromSupabase = async (path: string, options = {}) => {
  // Default headers
  const headers = {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  // Build the full URL
  const url = `${supabaseUrl}${path}`;
  
  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Parse the JSON response
  const data = await response.json();
  
  // Check for errors
  if (!response.ok) {
    throw new Error(`Supabase API error: ${response.status} ${data.message || response.statusText}`);
  }
  
  return data;
};

// Export a function to test the connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('invoices').select('id').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error testing Supabase connection:', err);
    return { success: false, error: err };
  }
};
