-- This SQL file contains fixes for the EXTRACT function issue with invoice dates

-- 1. First, ensure the due_date column is properly defined as a timestamp or date type
ALTER TABLE invoices 
ALTER COLUMN due_date TYPE TIMESTAMP USING due_date::TIMESTAMP;

-- 2. Create a function to handle date extraction safely
CREATE OR REPLACE FUNCTION safe_extract_date(date_value TIMESTAMP) 
RETURNS INTEGER AS $$
BEGIN
    IF date_value IS NULL THEN
        RETURN NULL;
    ELSE
        RETURN EXTRACT(DAY FROM date_value);
    END IF;
EXCEPTION
    WHEN others THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Update any stored procedures that might be using EXTRACT incorrectly
-- Example (modify based on your actual stored procedures):
CREATE OR REPLACE FUNCTION get_monthly_invoice_totals(months_back INTEGER)
RETURNS TABLE (
    month TEXT,
    total NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'Month YYYY') as month,
        COALESCE(SUM(
            (SELECT SUM(quantity * price) 
             FROM invoice_line_items 
             WHERE invoice_id = invoices.id)
        ), 0) as total
    FROM invoices
    WHERE created_at >= CURRENT_DATE - (months_back || ' months')::INTERVAL
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at) DESC;
END;
$$ LANGUAGE plpgsql;
