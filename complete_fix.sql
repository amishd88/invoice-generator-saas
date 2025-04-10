-- Complete fix for PostgreSQL EXTRACT function error
-- This script handles all view dependencies properly

-- 1. Find all dependent views
DO $$
DECLARE
    view_record RECORD;
BEGIN
    RAISE NOTICE 'Checking all views that depend on invoices.due_date...';
    
    FOR view_record IN 
        SELECT 
            c.relname AS view_name,
            pg_get_viewdef(c.oid, true) AS view_definition
        FROM 
            pg_depend d
            JOIN pg_rewrite r ON r.oid = d.objid
            JOIN pg_class c ON c.oid = r.ev_class
            JOIN pg_namespace n ON n.oid = c.relnamespace
            JOIN pg_attribute a ON a.attrelid = d.refobjid AND a.attnum = d.refobjsubid
        WHERE 
            d.refobjid = 'invoices'::regclass AND 
            a.attname = 'due_date' AND
            c.relkind = 'v'
    LOOP
        RAISE NOTICE 'Found dependent view: % with definition: %', view_record.view_name, view_record.view_definition;
    END LOOP;
END $$;

-- 2. Drop all dependent views
DROP VIEW IF EXISTS user_sales_report;
DROP VIEW IF EXISTS user_outstanding_invoices;
-- Add any other views here if more are discovered

-- 3. Create a safe casting function for EXTRACT operations
CREATE OR REPLACE FUNCTION safe_date_cast(value anyelement) 
RETURNS date AS $$
BEGIN
  -- Try to convert to date
  IF value IS NULL THEN
    RETURN NULL;
  END IF;
  
  BEGIN
    RETURN value::date;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Now alter the due_date column to a proper DATE type
ALTER TABLE invoices 
ALTER COLUMN due_date TYPE DATE 
USING CASE 
  WHEN due_date IS NULL THEN NULL 
  WHEN due_date::TEXT ~ '^\d{4}-\d{2}-\d{2}' THEN due_date::DATE
  ELSE NULL
END;

-- 5. Recreate the user_sales_report view
CREATE VIEW user_sales_report AS
SELECT 
  i.id AS invoice_id,
  i.user_id,
  i.invoice_number,
  i.company,
  i.client,
  c.name AS customer_name,
  i.created_at,
  i.sent_date,
  i.due_date,
  i.paid_date,
  i.status,
  i.payment_status,
  i.payment_due_amount AS invoice_total,
  COALESCE(sum(ip.amount), 0::numeric) AS total_paid,
  i.payment_due_amount - COALESCE(sum(ip.amount), 0::numeric) AS balance_due,
  i.days_overdue
FROM 
  invoices i
  LEFT JOIN customers c ON i.customer_id = c.id
  LEFT JOIN invoice_payments ip ON i.id = ip.invoice_id
GROUP BY 
  i.id, i.user_id, i.invoice_number, i.company, i.client, c.name, i.created_at, 
  i.sent_date, i.due_date, i.paid_date, i.status, i.payment_status, 
  i.payment_due_amount, i.days_overdue;

-- 6. Get definition for the user_outstanding_invoices view
-- Run this query first to see the definition
-- Uncomment and modify the next CREATE VIEW statement based on the result
DO $$
BEGIN
  RAISE NOTICE 'You need to recreate the user_outstanding_invoices view';
  RAISE NOTICE 'Please modify this script with that view definition before running it';
END $$;

-- 7. Recreate the user_outstanding_invoices view (modify with actual definition)
-- CREATE VIEW user_outstanding_invoices AS
-- ... place the actual definition here based on query results ...;

-- 8. Verify the fix worked
SELECT pg_typeof(due_date) FROM invoices LIMIT 1;
