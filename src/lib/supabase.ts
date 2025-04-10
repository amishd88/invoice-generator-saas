// This file exists for backward compatibility
// All functions are re-exported from supabaseClient.ts

import { supabase as supabaseClient, fetchFromSupabase, testConnection } from './supabaseClient';

// Re-export the client and all functions
export const supabase = supabaseClient;
export { fetchFromSupabase, testConnection };

// Default export
export default supabase;
