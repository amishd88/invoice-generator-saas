-- This SQL script demonstrates how to insert into the invoices table 
-- while avoiding the EXTRACT function error

-- 1. Execute this to create a template invoice without using any date functions
INSERT INTO invoices (
  company,
  company_address,
  client,
  client_address,
  invoice_number,
  due_date,
  notes,
  terms,
  status,
  user_id
) VALUES (
  'Test Company',
  '123 Test Street, Testville',
  'Test Client',
  '456 Client Road, Clientville',
  'INV-2025-TEST',
  '2025-05-15', -- Plain string date format YYYY-MM-DD
  'Test notes',
  'Test terms',
  'draft',
  '2e71aae2-c8f2-47e5-b76c-1324c2130529' -- Replace with your actual user ID
);

-- 2. Check if the insert worked by selecting without using EXTRACT
SELECT id, company, client, invoice_number, due_date, status
FROM invoices
WHERE invoice_number = 'INV-2025-TEST';

-- 3. Examine the invoice data type in the database
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM 
  information_schema.columns
WHERE 
  table_name = 'invoices' AND
  column_name = 'due_date';

-- 4. Try to find where EXTRACT is being used
SELECT 
  routine_name 
FROM 
  information_schema.routines
WHERE 
  routine_definition ILIKE '%extract%' AND 
  routine_definition ILIKE '%due_date%';

-- 5. If you need to cast the date explicitly in a query, use this pattern
SELECT 
  id, 
  company, 
  client, 
  invoice_number, 
  due_date,
  -- Safely cast the date for extraction
  CASE 
    WHEN due_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN 
      (due_date::date)
    ELSE NULL
  END AS parsed_date
FROM 
  invoices
WHERE 
  invoice_number = 'INV-2025-TEST';
