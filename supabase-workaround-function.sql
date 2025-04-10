-- Create a custom function to safely use date operations with the invoices table
-- This workaround allows us to continue using the table without altering the schema

-- First, let's create a helper function to safely convert text to date
CREATE OR REPLACE FUNCTION safe_to_date(text_date TEXT) 
RETURNS DATE AS $$
BEGIN
    IF text_date IS NULL THEN
        RETURN NULL;
    END IF;
    
    BEGIN
        RETURN text_date::DATE;
    EXCEPTION WHEN OTHERS THEN
        BEGIN
            RETURN to_date(text_date, 'YYYY-MM-DD');
        EXCEPTION WHEN OTHERS THEN
            RETURN NULL;
        END;
    END;
END;
$$ LANGUAGE plpgsql;

-- Now let's create a safe version of the extract function for the invoices table
CREATE OR REPLACE FUNCTION safe_extract_from_due_date(field TEXT, invoice_id UUID) 
RETURNS INTEGER AS $$
DECLARE
    due_date_value TEXT;
    date_value DATE;
    extract_result INTEGER;
BEGIN
    -- Get the due_date value for the specified invoice
    SELECT due_date INTO due_date_value 
    FROM invoices 
    WHERE id = invoice_id;
    
    -- Convert to date safely
    date_value := safe_to_date(due_date_value);
    
    -- Return 0 if we couldn't convert to a valid date
    IF date_value IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Extract the requested field
    CASE field
        WHEN 'year' THEN
            extract_result := EXTRACT(YEAR FROM date_value);
        WHEN 'month' THEN
            extract_result := EXTRACT(MONTH FROM date_value);
        WHEN 'day' THEN
            extract_result := EXTRACT(DAY FROM date_value);
        ELSE
            extract_result := 0;
    END CASE;
    
    RETURN extract_result;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get invoices that avoids using EXTRACT directly on due_date
CREATE OR REPLACE FUNCTION get_invoices_safely(
    user_id_param UUID,
    from_date_param TEXT DEFAULT NULL,
    to_date_param TEXT DEFAULT NULL,
    status_param TEXT DEFAULT NULL
) 
RETURNS TABLE (
    id UUID,
    company TEXT,
    client TEXT,
    invoice_number TEXT,
    due_date TEXT,
    status TEXT,
    total_amount DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.company,
        i.client,
        i.invoice_number,
        i.due_date,
        i.status,
        i.total_amount,
        i.created_at
    FROM 
        invoices i
    WHERE 
        i.user_id = user_id_param
        AND (from_date_param IS NULL OR safe_to_date(i.due_date) >= safe_to_date(from_date_param))
        AND (to_date_param IS NULL OR safe_to_date(i.due_date) <= safe_to_date(to_date_param))
        AND (status_param IS NULL OR i.status = status_param)
    ORDER BY 
        i.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM get_invoices_safely('your-user-id-here');
-- SELECT * FROM get_invoices_safely('your-user-id-here', '2023-01-01', '2023-12-31', 'draft');

COMMENT ON FUNCTION safe_to_date(TEXT) IS 'Safely converts a text string to a date, returning NULL if conversion fails';
COMMENT ON FUNCTION safe_extract_from_due_date(TEXT, UUID) IS 'Safely extracts a date part from the due_date of an invoice';
COMMENT ON FUNCTION get_invoices_safely(UUID, TEXT, TEXT, TEXT) IS 'Gets invoices for a user with optional date and status filters, avoiding EXTRACT function issues';
