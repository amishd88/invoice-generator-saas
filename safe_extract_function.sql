-- Create a safe extract function that handles various date formats
-- This approach doesn't require modifying the table structure

-- Create a function that safely handles date extraction
CREATE OR REPLACE FUNCTION safe_extract(field text, value anyelement) 
RETURNS integer AS $$
DECLARE
  result integer;
  date_value date;
BEGIN
  -- Try to convert to date if not already a date
  IF pg_typeof(value) = 'date'::regtype THEN
    date_value := value;
  ELSIF pg_typeof(value) = 'timestamp without time zone'::regtype THEN
    date_value := value::date;
  ELSIF pg_typeof(value) = 'timestamp with time zone'::regtype THEN
    date_value := value::date;
  ELSIF pg_typeof(value) = 'text'::regtype OR pg_typeof(value) = 'varchar'::regtype THEN
    -- For text, try different common date formats
    BEGIN
      date_value := value::date;
    EXCEPTION WHEN OTHERS THEN
      -- If conversion fails, return null
      RETURN NULL;
    END;
  ELSE
    -- For other types, return null
    RETURN NULL;
  END IF;

  -- Now extract the field using the converted date
  EXECUTE 'SELECT EXTRACT(' || field || ' FROM $1)' 
    INTO result 
    USING date_value;
    
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Example usage:
-- SELECT safe_extract('month', due_date) FROM invoices;
-- This will work regardless of the due_date column's type

-- Optionally, you can create a view that uses this function if needed
DO $$
BEGIN
  -- Check if the view exists
  IF EXISTS (SELECT FROM pg_views WHERE viewname = 'user_sales_report') THEN
    -- Get the definition of the view to see if it uses EXTRACT
    PERFORM pg_get_viewdef('user_sales_report'::regclass);
    
    -- If you need to recreate the view with the safe_extract function,
    -- you would do so here after examining its definition
  END IF;
END $$;
