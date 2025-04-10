-- This SQL script creates a PostgreSQL EXTRACT function that handles unknown types
-- Run this in your Supabase SQL editor

-- Create a function that handles the EXTRACT operation for text values
CREATE OR REPLACE FUNCTION pg_catalog.extract(field text, value unknown)
RETURNS numeric AS $$
DECLARE
  date_value date;
  result numeric;
BEGIN
  -- First try to convert the unknown value to a date
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

-- Test that the function works
SELECT pg_catalog.extract('month', '2023-05-15');
