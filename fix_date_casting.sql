-- Simple fix for the PostgreSQL EXTRACT function error
-- This handles the due_date column being TEXT instead of DATE

-- Create a safe extract function that can handle TEXT dates
CREATE OR REPLACE FUNCTION safe_extract(field text, date_value text) 
RETURNS integer AS $$
BEGIN
  -- Cast to date first to avoid the EXTRACT error
  RETURN EXTRACT(field::text::regclass FROM date_value::date);
EXCEPTION WHEN OTHERS THEN
  -- Return null if the extraction fails
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to use the function
GRANT EXECUTE ON FUNCTION safe_extract TO authenticated;
GRANT EXECUTE ON FUNCTION safe_extract TO service_role;

-- Create a version of the function that works with invoice IDs
CREATE OR REPLACE FUNCTION invoice_extract(field text, invoice_id uuid) 
RETURNS integer AS $$
DECLARE
  date_value text;
BEGIN
  -- Get the due_date for the specified invoice
  SELECT due_date INTO date_value 
  FROM invoices 
  WHERE id = invoice_id;
  
  -- Call the safe_extract function
  RETURN safe_extract(field, date_value);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to use the function
GRANT EXECUTE ON FUNCTION invoice_extract TO authenticated;
GRANT EXECUTE ON FUNCTION invoice_extract TO service_role;

-- Test the functions
SELECT safe_extract('year', '2023-05-15');
SELECT safe_extract('month', '2023-05-15');
SELECT safe_extract('day', '2023-05-15');
