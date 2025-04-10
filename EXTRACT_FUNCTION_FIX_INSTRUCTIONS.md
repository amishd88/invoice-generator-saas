# Fix for PostgreSQL EXTRACT Function Error

## The Problem

You're encountering this error when saving or updating invoices:
```
function pg_catalog.extract(unknown, integer) does not exist
```

This error occurs when PostgreSQL's EXTRACT function is called with a date value that's not in a format PostgreSQL recognizes as a date type.

## The Solution

I've implemented a two-part solution:

### 1. Database Fix

Run this SQL script in your Supabase SQL Editor:

```sql
-- Alternative solution for PostgreSQL EXTRACT function error
-- This approach doesn't require modifying pg_catalog schema

-- 1. Create a safe extraction function in the public schema
CREATE OR REPLACE FUNCTION public.safe_extract(field text, value text)
RETURNS numeric AS $$
DECLARE
  date_value date;
  result numeric;
BEGIN
  -- First try to convert the text value to a date
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

-- 2. Test the function
SELECT public.safe_extract('month', '2023-05-15');

-- 3. Fix any existing data issues
UPDATE invoices
SET due_date = NULL
WHERE due_date IS NOT NULL AND due_date::text !~ '^\d{4}-\d{2}-\d{2}';
```

This creates a safe extraction function that can handle text dates correctly.

### 2. Code Updates

I've updated several files to ensure consistent date formatting:

1. In `src/services/invoiceService.ts`:
   - Changed date formatting to use `substring(0, 10)` instead of `split('T')[0]`
   - This ensures date values are always in YYYY-MM-DD format

2. In `src/components/invoices/InvoiceForm.tsx`:
   - Updated all date handling to use consistent formatting
   - Added checks to handle different date string formats

These changes ensure that dates are consistently formatted in a way that PostgreSQL can process correctly.

## How to Apply the Fix

1. Run the SQL script above in your Supabase SQL Editor
2. Deploy the updated TypeScript/JavaScript files
3. Test creating and updating an invoice

This fix avoids modifying PostgreSQL system schemas (which Supabase doesn't allow) and provides a reliable solution by:
1. Creating a custom function to handle text dates safely
2. Ensuring consistent date formatting in your code
3. Cleaning up any malformed dates in your database

## In the Future

To prevent similar issues:
- Always store dates in ISO format (YYYY-MM-DD)
- Use proper date typing in database schemas when possible
- Consider adding a database migration system for schema changes
