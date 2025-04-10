-- SQL to investigate triggers and stored procedures that might be causing the error

-- List all triggers on the invoices table
SELECT 
  trigger_name,
  event_manipulation,
  event_object_schema,
  event_object_table,
  action_statement,
  action_timing
FROM 
  information_schema.triggers
WHERE 
  event_object_table = 'invoices'
ORDER BY 
  trigger_name;

-- Check the trigger functions
DO $$
DECLARE
  trigger_record RECORD;
  function_schema TEXT;
  function_name TEXT;
  function_src TEXT;
BEGIN
  -- For each trigger
  FOR trigger_record IN
    SELECT trigger_name, action_statement 
    FROM information_schema.triggers 
    WHERE event_object_table = 'invoices'
  LOOP
    RAISE NOTICE 'Examining trigger: %', trigger_record.trigger_name;
    
    -- Extract function name from statement
    BEGIN
      -- Usually action_statement is like "EXECUTE FUNCTION function_name()"
      function_name := substring(trigger_record.action_statement FROM 'EXECUTE (PROCEDURE|FUNCTION) ([^ (]+)');
      
      IF function_name IS NOT NULL THEN
        -- Get function source
        SELECT n.nspname, p.prosrc 
        INTO function_schema, function_src
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = function_name;
        
        RAISE NOTICE 'Function % in schema % source: %', function_name, function_schema, function_src;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error examining function: %', SQLERRM;
    END;
  END LOOP;
END $$;

-- Check database structure and RLS policies that might be causing EXTRACT calls
SELECT 
  schemaname, 
  tablename, 
  tableowner,
  tablespace,
  hasindexes,
  hasrules,
  hastriggers
FROM 
  pg_tables
WHERE 
  tablename = 'invoices';

-- List current search_path
SHOW search_path;

-- Look for any triggers or rules that might be extracting due_date
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  p.prosrc as function_source
FROM 
  pg_proc p
JOIN 
  pg_namespace n ON p.pronamespace = n.oid
WHERE 
  p.prosrc ILIKE '%extract%' AND p.prosrc ILIKE '%due_date%';

-- Check for RLS policies
SELECT
  pc.relname as table_name,
  pol.polname as policy_name,
  pol.polcmd as command,
  pol.polpermissive as permissive,
  pg_get_expr(pol.polqual, pol.polrelid) as expression
FROM
  pg_policy pol
JOIN
  pg_class pc ON pol.polrelid = pc.oid
WHERE
  pc.relname = 'invoices';
