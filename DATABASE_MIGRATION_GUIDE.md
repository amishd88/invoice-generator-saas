# Database Migration Guide

## Resolving the "column invoices.total_amount does not exist" Error

This guide provides instructions for updating your database schema to fix the errors you're encountering with missing columns, particularly the `total_amount` column in the invoices table.

## Problem Description

You're encountering the following error:
```
Error fetching invoices for dashboard:
Object { code: "42703", details: null, hint: null, message: "column invoices.total_amount does not exist" }
```

This is happening because our enhanced API services are expecting several columns that don't exist in your current database schema, including:

1. `total_amount` in the invoices table
2. Status-related fields in the invoices table
3. Additional fields for customers and products

## Solution

### 1. Apply the Database Migration Script

The file `database-update-migration.sql` contains all the SQL statements needed to update your schema. You can apply it in one of two ways:

#### Option A: Using the Supabase Web Interface
1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `database-update-migration.sql`
4. Run the script

#### Option B: Using the Supabase CLI
If you have the Supabase CLI installed:

```bash
supabase db execute --project-ref YOUR_PROJECT_REF -f database-update-migration.sql
```

### 2. Test the Updated Schema

After applying the migration, test that the previously missing columns are now available:

```sql
-- Run this query in Supabase SQL Editor
SELECT 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_name = 'invoices' 
  AND column_name IN ('total_amount', 'status', 'total_paid', 'paid_date');
```

You should see results confirming that these columns now exist.

### 3. Update Your Data

The migration script includes a procedure to calculate `total_amount` for existing invoices based on their line items. This happens automatically when you run the script.

## What Was Added

### 1. New Columns on Invoices Table

- `template_id`: The ID of the invoice template being used
- `currency`: JSON data for currency configuration
- Various display flags (`show_shipping`, `show_discount`, etc.)
- `status`: Invoice status (draft, sent, paid, overdue)
- `total_amount`: Calculated total amount of the invoice
- `total_paid`: Amount that has been paid
- `paid_date`: When the invoice was paid

### 2. New Columns on Customers Table

- `vat_number`: Tax/VAT identification number
- `contact_person`: Primary contact at the customer
- `website`: Customer's website
- `preferred_currency`: Customer's preferred currency

### 3. New Columns on Products Table

- `unit`: Unit of measure (hour, item, etc.)
- `sku`: Stock keeping unit identifier
- `category`: Product category

### 4. New Database Functions

- `calculate_invoice_total()`: Automatically calculates invoice totals
- `get_monthly_invoice_totals()`: Gets monthly invoice totals for reporting
- `get_product_price_stats()`: Gets price statistics for products

### 5. New Triggers

- `update_invoice_total`: Updates invoice totals when line items change

### 6. New Indexes

Indexes were added to optimize queries on the new columns.

## Troubleshooting

If you continue to experience issues after applying the migration:

1. **Check for Errors**: Review any error messages from the SQL execution
2. **Verify Column Existence**: Make sure the columns were actually created
3. **Restart Application**: Restart your application to ensure it recognizes the schema changes
4. **Check Permissions**: Ensure your application's database user has the necessary permissions to access the new columns and functions
5. **Check RLS Policies**: If you're using Row Level Security, ensure the policies allow access to the new columns
6. **Update Triggers**: If you have custom triggers, they might need modification to handle the new columns

## Manual Data Update (If Needed)

If for some reason the automatic total calculation doesn't work for existing invoices, you can run this SQL to update them manually:

```sql
UPDATE invoices i
SET total_amount = (
  SELECT COALESCE(SUM(quantity * price), 0)
  FROM invoice_line_items li
  WHERE li.invoice_id = i.id
)
WHERE i.total_amount IS NULL OR i.total_amount = 0;
```

## Adapting Your Application Code

If you've created custom queries in your application, you may need to update them to:

1. Include the new columns in SELECT statements
2. Handle the new data types (especially JSONB fields)
3. Update any calculations that previously were done in-memory but now can use the database columns

## Dashboard and Reporting

The new reporting service (`reportingService.ts`) has been updated to work with the enhanced schema. It includes functions for:

1. Dashboard metrics
2. Invoice analytics
3. Customer analytics

These functions expect the new columns to exist, so make sure to run the database migration before using them.

## Conclusion

This database migration enhances your invoice generator application with additional fields and functions needed for more advanced features. After applying these changes, your application will be able to handle more complex reporting, filtering, and data visualization.

The updates are backward compatible with your existing data but add new capabilities that make the application more production-ready and scalable.
