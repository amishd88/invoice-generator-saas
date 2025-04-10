-- Direct fix for the PostgreSQL EXTRACT function error
-- This approach uses a simple casting workaround

-- 1. First, backup the view definition in case we need to recreate it
DO $$
DECLARE
    view_def text;
BEGIN
    -- Get the view definition
    SELECT pg_get_viewdef('user_sales_report'::regclass) INTO view_def;
    
    -- Log the definition for reference
    RAISE NOTICE 'Current view definition: %', view_def;
    
    -- Store the definition in a temporary table for safekeeping
    CREATE TEMP TABLE view_definition AS SELECT view_def AS definition;
END $$;

-- 2. Create a function to cast any value to DATE safely for EXTRACT operations
CREATE OR REPLACE FUNCTION safe_date_cast(value anyelement) 
RETURNS date AS $$
BEGIN
  -- Try to convert to date
  BEGIN
    RETURN value::date;
  EXCEPTION WHEN OTHERS THEN
    -- If conversion fails, return null
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Find any SQL that might be using EXTRACT on the due_date column
SELECT 
    schemaname,
    viewname,
    definition
FROM 
    pg_views 
WHERE 
    definition ILIKE '%extract%due_date%';

-- 4. The most likely fix: update the view to use the safe casting function
-- You'll need to verify the actual view definition first
DO $$
BEGIN
    -- Only attempt to modify if we know what we're doing
    -- This is a placeholder - check the view definition first
    -- DROP VIEW IF EXISTS user_sales_report;
    -- Then recreate with safe casting
END $$;
