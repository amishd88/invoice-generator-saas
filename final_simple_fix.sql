-- Most basic fix for PostgreSQL EXTRACT function error
-- This script avoids all complex syntax that might cause errors

-- 1. Fix any invalid dates in the database
UPDATE invoices
SET due_date = NULL
WHERE due_date IS NOT NULL AND (
  due_date::TEXT !~ '^\d{4}-\d{2}-\d{2}' OR
  due_date::TEXT = '' OR
  LENGTH(due_date::TEXT) < 10
);

-- 2. Create a very simple function to extract date parts from text
CREATE OR REPLACE FUNCTION safe_extract_date_part(field_name text, date_text text)
RETURNS integer AS $$
BEGIN
  -- Handle nulls and empty strings
  IF date_text IS NULL OR date_text = '' OR LENGTH(date_text) < 10 THEN
    RETURN NULL;
  END IF;
  
  -- Simple approach using CASE statement and substring
  IF field_name = 'year' THEN
    RETURN SUBSTRING(date_text, 1, 4)::integer;
  ELSIF field_name = 'month' THEN
    RETURN SUBSTRING(date_text, 6, 2)::integer;
  ELSIF field_name = 'day' THEN
    RETURN SUBSTRING(date_text, 9, 2)::integer;
  ELSE
    -- For other fields, return NULL
    RETURN NULL;
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  -- If any error occurs, return NULL
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Find views that might use EXTRACT on due_date
DO $$
DECLARE
  view_name text;
  view_def text;
BEGIN
  -- Get list of views
  FOR view_name IN 
    SELECT viewname FROM pg_views
  LOOP
    BEGIN
      -- Try to get view definition
      SELECT pg_get_viewdef(view_name::regclass, true) INTO view_def;
      
      -- Check if it mentions both EXTRACT and due_date
      IF view_def ILIKE '%extract%' AND view_def ILIKE '%due_date%' THEN
        RAISE NOTICE 'View "%" might use EXTRACT on due_date', view_name;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error getting definition for view: %', view_name;
    END;
  END LOOP;
END $$;

-- 4. Test the function with a sample date
SELECT 
  'Test with sample date:' as test_type,
  safe_extract_date_part('year', '2023-01-15') as extract_year,
  safe_extract_date_part('month', '2023-01-15') as extract_month,
  safe_extract_date_part('day', '2023-01-15') as extract_day;
