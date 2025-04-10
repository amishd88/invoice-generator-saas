# Final Fix for PostgreSQL EXTRACT Function Error

## The Problem

You're encountering this error when working with dates in your invoice application:

```
function pg_catalog.extract(unknown, integer) does not exist
```

This happens because PostgreSQL's EXTRACT function doesn't know how to handle dates that aren't properly typed, and our recent fix attempt with `::date` didn't work either:

```
invalid input syntax for type date: "2025-05-02::date"
```

## The Solution

I've created a two-part solution that's simpler and more direct:

### 1. Updated TypeScript Code

I've modified `invoiceService.ts` to simply send the date as a plain ISO-formatted date string without any type casting attempts:

```typescript
// Format date as YYYY-MM-DD without any type casting
due_date: invoice.dueDate ? new Date(invoice.dueDate).toISOString().substring(0, 10) : null,
```

This ensures we're sending a clean date string like `"2025-05-02"` to PostgreSQL.

### 2. Database Fix with Custom Function

I've created a minimal SQL fix (`minimal_fix.sql`) that:

1. Fixes any invalid date values in your database
2. Creates a custom `safe_extract_from_text` function that works with text dates 
3. Identifies any views that might be using EXTRACT on due_date

The custom function safely extracts date parts using string operations instead of relying on PostgreSQL's EXTRACT function, avoiding the type errors.

## How to Apply the Fix

1. First, run the `minimal_fix.sql` script in your Supabase SQL Editor
2. The code changes have already been applied to your TypeScript files
3. Test your application by creating or updating an invoice

## Why This Approach Works

This approach:
- Doesn't require schema modifications
- Works with any date format stored in the database 
- Provides a custom function to replace EXTRACT where needed
- Avoids the type casting issues entirely

If you need to use EXTRACT functionality on due_date in SQL queries or views, use our new `safe_extract_from_text` function instead:

```sql
-- Instead of:
EXTRACT(month FROM due_date)

-- Use:
safe_extract_from_text('month', due_date::TEXT)
```

This solution should resolve the error while working within Supabase's permission constraints.
