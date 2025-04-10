-- Alternative solution for PostgreSQL EXTRACT function error
-- This approach doesn't require modifying pg_catalog schema

-- 1. Create a safe extraction function in the public schema
CREATE OR REPLACE FUNCTION public.safe_extract(field text, value text)
RETURNS numeric AS $$
DECLARE
  date_value date;
  result numeric;
BEGIN
  -- First try to convert the text value to a date
  BEGIN
    IF value IS NULL THEN
      RETURN NULL;
    END IF;
    
    -- Try to convert to date
    date_value := value::date;
    
    -- If conversion succeeded, extract the requested field
    EXECUTE 'SELECT EXTRACT(' || quote_literal(field) || ' FROM $1)' 
      INTO result 
      USING date_value;
      
    RETURN result;
  EXCEPTION WHEN others THEN
    -- If any error occurs, return NULL
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Test the function
SELECT public.safe_extract('month', '2023-05-15');

-- 3. Fix any existing data issues
UPDATE invoices
SET due_date = NULL
WHERE due_date IS NOT NULL AND due_date::text !~ '^\d{4}-\d{2}-\d{2}';
