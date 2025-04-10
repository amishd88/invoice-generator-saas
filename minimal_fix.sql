-- Minimal fix to solve the PostgreSQL EXTRACT function error
-- This script creates a simple wrapper function and fixes any malformed dates

-- 1. Fix any invalid dates in the database
UPDATE invoices
SET due_date = NULL
WHERE due_date IS NOT NULL AND (
  due_date::TEXT !~ '^\d{4}-\d{2}-\d{2}' OR
  due_date::TEXT = '' OR
  LENGTH(due_date::TEXT) < 10
);

-- 2. Create a function to safely handle date extraction
-- This avoids PostgreSQL's type checking errors
CREATE OR REPLACE FUNCTION safe_extract_from_text(field text, date_text text)
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  -- Handle nulls and empty strings
  IF date_text IS NULL OR date_text = '' THEN
    RETURN NULL;
  END IF;
  
  -- Extract date parts using string operations instead of EXTRACT
  CASE field
    WHEN 'year' THEN
      RETURN SUBSTRING(date_text, 1, 4)::integer;
    WHEN 'month' THEN
      RETURN SUBSTRING(date_text, 6, 2)::integer;
    WHEN 'day' THEN
      RETURN SUBSTRING(date_text, 9, 2)::integer;
    ELSE
      -- For other fields, try to cast to date and use extract
      BEGIN
        RETURN extract(field::text::regtype FROM date_text::date);
      EXCEPTION WHEN OTHERS THEN
        RETURN NULL;
      END;
  END CASE;
  
EXCEPTION WHEN OTHERS THEN
  -- If any error occurs, return NULL
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Find any views or functions that use EXTRACT on due_date and note them
DO $$
DECLARE
  view_record RECORD;
BEGIN
  FOR view_record IN
    SELECT viewname, definition
    FROM pg_views
    WHERE definition ILIKE '%extract%due_date%'
  LOOP
    RAISE NOTICE 'View "%" contains EXTRACT on due_date', view_record.viewname;
    RAISE NOTICE 'Consider replacing EXTRACT with safe_extract_from_text in this view';
  END LOOP;
END $$;

-- 4. Test the function with a sample date
SELECT 
  'Original EXTRACT function (might fail):' as test_type,
  EXTRACT(year FROM '2023-01-15'::date) as extract_year,
  EXTRACT(month FROM '2023-01-15'::date) as extract_month,
  EXTRACT(day FROM '2023-01-15'::date) as extract_day
UNION ALL
SELECT
  'Our safe_extract_from_text function:' as test_type,
  safe_extract_from_text('year', '2023-01-15') as extract_year,
  safe_extract_from_text('month', '2023-01-15') as extract_month,
  safe_extract_from_text('day', '2023-01-15') as extract_day;
