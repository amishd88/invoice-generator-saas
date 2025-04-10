# PostgreSQL EXTRACT Function Error Fix

## Problem
The application is experiencing errors when interacting with the database:
```
POSThttps://wjypayhcfesfopynzqed.supabase.co/rest/v1/invoices?select=id [HTTP/3 404 88ms]
Error inserting invoice:
Object { code: "42883", details: null, hint: "No function matches the given name and argument types. You might need to add explicit type casts.", message: "function pg_catalog.extract(unknown, integer) does not exist" }
```

This error occurs because the PostgreSQL `EXTRACT` function is being called with an incompatible data type. The `due_date` field is not being properly formatted or typed in the database.

## Solution

There are two parts to the solution:

### 1. Fix in the TypeScript Code

We've updated the code to properly format dates before sending them to the database:

- Created a utility function `formatDateForDB` in `src/utils/dateUtils.ts`
- Modified `invoiceService.ts` to use this utility function
- Ensures dates are properly formatted as ISO strings before being sent to the database

### 2. Fix the Database Schema

Run one of the SQL scripts in your Supabase SQL Editor:

1. **Option A: Use `fix-pg-extract-error.sql`** (recommended)
   - This script will examine your table structure
   - Convert the `due_date` column to a proper DATE type
   - Create a backup of your data before making changes
   - Test that the EXTRACT function works properly

2. **Option B: Use `bypass-extract-function.sql`**
   - Creates a custom function `safe_date_extract` that safely handles text dates
   - Adds triggers to ensure proper date formatting
   - Provides a workaround without modifying the column type

## Steps to Apply the Fix

1. **First, apply the code changes:**
   - The updated files are already in your codebase
   - Make sure to rebuild and deploy the application after these changes

2. **Then, fix the database:**
   - Log in to your Supabase dashboard
   - Navigate to the SQL Editor
   - Copy and paste the content of `fix-pg-extract-error.sql`
   - Run the script
   - Check for any errors in the output

3. **Test the application:**
   - Try creating and updating invoices
   - Verify that due dates are stored and retrieved correctly

## Preventive Measures

To prevent similar issues in the future:

1. Always use proper type casting when working with dates in PostgreSQL
2. Use parameterized queries where possible
3. Ensure database columns have explicit types (DATE, TIMESTAMP, etc.)
4. Consider using a database migration tool to manage schema changes

## Contact

If you encounter any issues with this fix, please contact the development team.
