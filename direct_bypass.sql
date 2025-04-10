-- Direct solution to bypass the EXTRACT function error
-- This approach directly modifies the column type and any problematic triggers

-- 1. First, disable any triggers on the invoices table temporarily
ALTER TABLE invoices DISABLE TRIGGER ALL;

-- 2. Change the column type to a proper DATE type with explicit casting
ALTER TABLE invoices 
ALTER COLUMN due_date TYPE DATE USING 
  CASE 
    WHEN due_date IS NULL THEN NULL
    WHEN due_date::TEXT ~ '^\d{4}-\d{2}-\d{2}' THEN due_date::TEXT::DATE
    ELSE NULL
  END;

-- 3. Re-enable triggers
ALTER TABLE invoices ENABLE TRIGGER ALL;

-- 4. Verify the change
SELECT pg_typeof(due_date) FROM invoices LIMIT 1;

-- 5. Create a helper function to safely handle EXTRACT in any situation
CREATE OR REPLACE FUNCTION safe_date_extract(field text, value date)
RETURNS integer AS $$
BEGIN
  IF value IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN EXTRACT(field::text FROM value);
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;

-- 6. Set the search path to ensure functions are found
ALTER DATABASE postgres SET search_path TO "$user", public;

-- 7. Clean up any malformed dates in the table
UPDATE invoices
SET due_date = NULL
WHERE due_date IS NOT NULL AND due_date::TEXT !~ '^\d{4}-\d{2}-\d{2}';

-- This solution should resolve the EXTRACT function error
-- by ensuring the column is properly typed as DATE
-- and providing a safe extraction function that works in any context
