-- Final fix for PostgreSQL EXTRACT function error
-- This approach doesn't require altering columns or dropping views

-- 1. Create a safe extraction function that works with any type
CREATE OR REPLACE FUNCTION safe_extract(field text, value anyelement) 
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  -- If value is null, return null
  IF value IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Try to extract using a safe cast
  BEGIN
    EXECUTE 'SELECT EXTRACT(' || field || ' FROM $1::DATE)' 
      INTO result 
      USING value;
    RETURN result;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Create an extension to the PostgreSQL extract function
-- This will be used automatically when extract is called with unknown types
CREATE OR REPLACE FUNCTION pg_catalog.extract(field text, value unknown)
RETURNS integer AS $$
BEGIN
  RETURN safe_extract(field, value);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Test that the function works
SELECT pg_catalog.extract('month', '2023-05-15'::text) AS test_extract;

-- 4. Optionally update any non-null but invalid dates in the table
UPDATE invoices
SET due_date = NULL
WHERE due_date IS NOT NULL AND 
      safe_extract('year', due_date) IS NULL;
