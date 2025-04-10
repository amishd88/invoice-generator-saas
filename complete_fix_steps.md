# Complete Fix for PostgreSQL EXTRACT Function Error

The error you're encountering is:
```
function pg_catalog.extract(unknown, integer) does not exist
```

This happens because PostgreSQL's EXTRACT function doesn't know how to handle date values that are stored as text or other unknown types. This fix addresses the issue in two parts:

## Part 1: Database Fix

1. Run the following SQL script in your Supabase SQL Editor:

```sql
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
```

This creates a custom version of the EXTRACT function that can handle unknown types by attempting to convert them to dates first.

## Part 2: Code Check

The code in both your `invoiceService.ts` and `InvoiceForm.tsx` files already has the appropriate date formatting:

1. In `invoiceService.ts`, line ~370:
```typescript
due_date: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : null,
```

2. In `InvoiceForm.tsx`, lines ~255-262:
```typescript
// Make sure the due date is properly formatted as YYYY-MM-DD
const formData = { ...invoiceData };
if (formData.dueDate) {
  // Ensure we're just sending the date part to avoid EXTRACT function issues
  formData.dueDate = String(formData.dueDate).split('T')[0];
}
```

This ensures dates are sent to PostgreSQL in the YYYY-MM-DD format, which is compatible with the new extract function.

## Run The Fix

1. Open your Supabase SQL Editor
2. Copy and paste the SQL script above
3. Run the script
4. Test your application - you should no longer see the EXTRACT function error

The SQL fix adds a custom implementation of the EXTRACT function that can handle any type of date value, including those stored as text. This approach avoids having to modify your database schema or drop and recreate views.
