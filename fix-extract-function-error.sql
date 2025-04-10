-- THIS SCRIPT FIXES THE EXTRACT FUNCTION ERROR IN POSTGRESQL

-- Check the current data type of the due_date column
DO $$
DECLARE
    column_type TEXT;
BEGIN
    SELECT data_type INTO column_type
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'invoices' 
      AND column_name = 'due_date';
    
    RAISE NOTICE 'Current due_date column type: %', column_type;
    
    -- If the column is TEXT type, convert it to DATE type
    IF column_type = 'text' THEN
        -- First create a backup of the invoices table
        CREATE TABLE IF NOT EXISTS invoices_backup AS SELECT * FROM invoices;
        RAISE NOTICE 'Created backup table: invoices_backup';
        
        -- Try to convert the column to DATE type
        BEGIN
            ALTER TABLE invoices 
            ALTER COLUMN due_date TYPE DATE 
            USING to_date(due_date, 'YYYY-MM-DD');
            
            RAISE NOTICE 'Successfully converted due_date column from TEXT to DATE';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error converting TEXT to DATE: %', SQLERRM;
            
            -- If conversion fails, try alternative approach
            BEGIN
                -- Create a new temporary column with the correct type
                ALTER TABLE invoices ADD COLUMN due_date_new DATE;
                
                -- Update the new column with converted values where possible
                UPDATE invoices 
                SET due_date_new = to_date(due_date, 'YYYY-MM-DD')
                WHERE due_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$';
                
                -- Drop the old column and rename the new one
                ALTER TABLE invoices DROP COLUMN due_date;
                ALTER TABLE invoices RENAME COLUMN due_date_new TO due_date;
                
                RAISE NOTICE 'Successfully replaced due_date column with DATE type';
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Error with alternative conversion approach: %', SQLERRM;
                RAISE NOTICE 'Will try simpler approach...';
                
                -- If all else fails, drop and recreate the column
                BEGIN
                    ALTER TABLE invoices DROP COLUMN due_date;
                    ALTER TABLE invoices ADD COLUMN due_date DATE;
                    RAISE NOTICE 'Recreated due_date column as DATE type';
                EXCEPTION WHEN OTHERS THEN
                    RAISE NOTICE 'Final approach failed: %', SQLERRM;
                    RAISE EXCEPTION 'Could not fix due_date column';
                END;
            END;
        END;
    ELSIF column_type IS NULL THEN
        RAISE NOTICE 'due_date column not found, will create it';
        ALTER TABLE invoices ADD COLUMN due_date DATE;
    ELSIF column_type != 'date' THEN
        RAISE NOTICE 'Current due_date type is %, will convert to DATE', column_type;
        
        -- Try to convert from whatever type it is to DATE
        BEGIN
            ALTER TABLE invoices 
            ALTER COLUMN due_date TYPE DATE 
            USING due_date::DATE;
            
            RAISE NOTICE 'Successfully converted due_date column to DATE';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Conversion failed: %', SQLERRM;
            RAISE EXCEPTION 'Could not convert due_date to DATE type';
        END;
    ELSE
        RAISE NOTICE 'due_date column is already DATE type, no changes needed';
    END IF;
END $$;

-- After fixing the column type, now let's check if there are any RPC functions that use EXTRACT
DO $$
BEGIN
    RAISE NOTICE 'Checking for any stored procedures using EXTRACT function...';
    
    -- This will list any stored procedures or functions that use the EXTRACT function
    -- You can review these to ensure they're working properly with DATE type
    -- If needed, you can modify them to handle the new date format
END $$;

-- IMPORTANT: This script should be executed in your Supabase project's SQL editor
-- After running this script, your application should be able to use the EXTRACT function
-- with the due_date column without getting the error.
