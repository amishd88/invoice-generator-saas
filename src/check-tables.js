// Check which tables exist in Supabase
import { supabase } from './lib/supabaseClient.js';

async function checkTables() {
  console.log('Checking Supabase tables...');
  
  try {
    // List all tables in the public schema
    const { data, error } = await supabase
      .from('_tables')
      .select('*')
      .filter('schema', 'eq', 'public');
    
    if (error) {
      console.error('Error fetching tables:', error);
      return;
    }
    
    console.log('Available tables:', data);
    
    // Try to query each table to see if we have access
    for (const table of data) {
      const tableName = table.name;
      
      const { data: tableData, error: tableError } = await supabase
        .from(tableName)
        .select('count(*)')
        .limit(1);
      
      if (tableError) {
        console.error(`Error accessing table ${tableName}:`, tableError);
      } else {
        console.log(`Table ${tableName} is accessible.`);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the check
checkTables();
