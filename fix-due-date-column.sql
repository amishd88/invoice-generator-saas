-- Fix script for PostgreSQL EXTRACT function error
-- Corrected syntax to avoid the BEGIN/END block issues

DO $$
DECLARE
    column_exists BOOLEAN;
    column_type TEXT;
BEGIN
    -- Check if due_date column exists
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'invoices' 
          AND column_name = 'due_date'
    ) INTO column_exists;
    
    IF column_exists THEN
        -- Get column type
        SELECT data_type INTO column_type
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'invoices' 
          AND column_name = 'due_date';
        
        RAISE NOTICE 'due_date column exists with type: %', column_type;
        
        -- If column is not proper date type, let's fix it
        IF column_type != 'date' THEN
            -- Create a backup of the affected table first
            EXECUTE 'CREATE TABLE IF NOT EXISTS invoices_backup AS SELECT * FROM invoices';
            RAISE NOTICE 'Created backup table: invoices_backup';
            
            -- Create a temporary column
            EXECUTE 'ALTER TABLE invoices ADD COLUMN IF NOT EXISTS due_date_new DATE';
            
            -- Try to convert existing values to dates
            EXECUTE 'UPDATE invoices SET due_date_new = due_date::DATE WHERE due_date IS NOT NULL';
            RAISE NOTICE 'Updated due_date_new column with converted values';
            
            -- Drop the old column and rename the new one
            EXECUTE 'ALTER TABLE invoices DROP COLUMN due_date';
            EXECUTE 'ALTER TABLE invoices RENAME COLUMN due_date_new TO due_date';
            RAISE NOTICE 'Renamed column to due_date';
        ELSE
            RAISE NOTICE 'due_date column is already DATE type, no fix needed';
        END IF;
    ELSE
        RAISE NOTICE 'due_date column does not exist, creating it';
        EXECUTE 'ALTER TABLE invoices ADD COLUMN due_date DATE';
    END IF;
END
$$;

-- Add a check to see if the fix worked
DO $$
BEGIN
    RAISE NOTICE 'Testing EXTRACT function with a sample date';
    
    -- This should succeed now that the column is fixed
    PERFORM EXTRACT(MONTH FROM DATE '2023-05-15');
    
    RAISE NOTICE 'EXTRACT function test successful';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'EXTRACT function test failed: %', SQLERRM;
END
$$;

-- Note: Run this script in your Supabase SQL editor
-- This should fix the "function pg_catalog.extract(unknown, integer) does not exist" error
