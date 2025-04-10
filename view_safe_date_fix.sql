-- Fix for EXTRACT function error that handles view dependencies
-- Run this in your Supabase SQL editor

-- 1. First, let's drop the dependent view
DROP VIEW IF EXISTS user_sales_report;

-- 2. Now we can alter the column type
ALTER TABLE invoices 
ALTER COLUMN due_date TYPE DATE USING CASE 
  WHEN due_date IS NULL THEN NULL 
  WHEN due_date::TEXT ~ '^\d{4}-\d{2}-\d{2}' THEN due_date::DATE
  ELSE NULL
END;

-- 3. Recreate the view (you'll need to modify this with the actual view definition)
-- The following is just an example - you need to replace it with the actual view definition
CREATE VIEW user_sales_report AS
SELECT 
  invoices.id,
  invoices.client,
  invoices.invoice_number,
  invoices.due_date,
  invoices.status,
  invoices.user_id,
  SUM(invoice_line_items.quantity * invoice_line_items.price) as total_amount
FROM 
  invoices
JOIN 
  invoice_line_items ON invoice_line_items.invoice_id = invoices.id
GROUP BY 
  invoices.id, invoices.client, invoices.invoice_number, invoices.due_date, 
  invoices.status, invoices.user_id;
