-- This SQL workaround completely bypasses the need for the EXTRACT function
-- Run this in your Supabase SQL editor

-- 1. Create a safe date extraction function that handles text values
CREATE OR REPLACE FUNCTION safe_date_extract(field text, date_value text) 
RETURNS integer AS $$
DECLARE
  parsed_date date;
  result integer;
BEGIN
  -- Try to parse the text as a date
  BEGIN
    parsed_date := date_value::date;
  EXCEPTION WHEN OTHERS THEN
    -- If we can't parse it as a date, return NULL
    RETURN NULL;
  END;
  
  -- Now extract the requested field
  EXECUTE 'SELECT EXTRACT(' || field || ' FROM $1)' 
    INTO result
    USING parsed_date;
    
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Create a trigger function to ensure due_date is in date format
CREATE OR REPLACE FUNCTION ensure_date_format()
RETURNS trigger AS $$
BEGIN
  -- If due_date is not null, try to convert it to a valid date format
  IF NEW.due_date IS NOT NULL THEN
    BEGIN
      -- This will raise an exception if the date is invalid
      NEW.due_date := NEW.due_date::date::text;
    EXCEPTION WHEN OTHERS THEN
      -- If conversion fails, keep the original value
      -- The safe_date_extract function will handle it
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Add a trigger to invoices table to format dates on insert/update
DROP TRIGGER IF EXISTS ensure_date_format_trigger ON invoices;
CREATE TRIGGER ensure_date_format_trigger
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION ensure_date_format();

-- 4. Update any function that might be using EXTRACT directly
-- Check for any database functions that use EXTRACT on the due_date column
DO $$
DECLARE
  func_record record;
BEGIN
  FOR func_record IN 
    SELECT proname, prosrc 
    FROM pg_proc 
    WHERE prosrc ILIKE '%extract%' AND prosrc ILIKE '%due_date%'
  LOOP
    RAISE NOTICE 'Function % might need updating to use safe_date_extract', func_record.proname;
  END LOOP;
END $$;

-- Test the function with sample data
SELECT safe_date_extract('year', '2023-04-15');
SELECT safe_date_extract('month', '2023-04-15');
SELECT safe_date_extract('day', '2023-04-15');

-- Usage examples in queries:
-- Instead of EXTRACT(MONTH FROM due_date)
-- Use: safe_date_extract('month', due_date)
