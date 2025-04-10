-- Fix script for PostgreSQL EXTRACT function error
-- Handles dependencies by altering the column type directly instead of dropping it

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
        
        -- If column is not proper date type, let's alter it directly
        IF column_type != 'date' THEN
            -- Create a backup of the affected table first
            EXECUTE 'CREATE TABLE IF NOT EXISTS invoices_backup AS SELECT * FROM invoices';
            RAISE NOTICE 'Created backup table: invoices_backup';
            
            -- Try to alter the column type directly (this preserves dependencies)
            BEGIN
                -- First, make sure the data is in a format that can be converted to DATE
                EXECUTE 'UPDATE invoices SET due_date = NULL WHERE due_date IS NOT NULL AND due_date !~ ''^[0-9]{4}-[0-9]{2}-[0-9]{2}''';
                EXECUTE 'ALTER TABLE invoices ALTER COLUMN due_date TYPE DATE USING due_date::DATE';
                RAISE NOTICE 'Successfully altered due_date column to DATE type';
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Error altering column type: %', SQLERRM;
                
                -- If direct conversion fails, we need to identify dependent objects
                RAISE NOTICE 'The column has dependencies. You may need to drop and recreate the dependent views.';
                RAISE NOTICE 'Dependent objects include: user_sales_report, user_outstanding_invoices';
                
                -- Recommend next steps
                RAISE NOTICE 'Recommended steps:';
                RAISE NOTICE '1. Back up the definitions of dependent views';
                RAISE NOTICE '2. Drop the dependent views with DROP VIEW user_sales_report, user_outstanding_invoices CASCADE;';
                RAISE NOTICE '3. Alter the column type';
                RAISE NOTICE '4. Recreate the views';
            END;
        ELSE
            RAISE NOTICE 'due_date column is already DATE type, no fix needed';
        END IF;
    ELSE
        RAISE NOTICE 'due_date column does not exist, creating it';
        EXECUTE 'ALTER TABLE invoices ADD COLUMN due_date DATE';
    END IF;
END
$$;

-- Let's try a workaround solution by creating a cast function
DO $$
BEGIN
    -- Create a function to safely convert text to date
    CREATE OR REPLACE FUNCTION safe_to_date(text_date TEXT) 
    RETURNS DATE AS $$
    BEGIN
        IF text_date IS NULL THEN
            RETURN NULL;
        END IF;
        
        BEGIN
            RETURN text_date::DATE;
        EXCEPTION WHEN OTHERS THEN
            BEGIN
                RETURN to_date(text_date, 'YYYY-MM-DD');
            EXCEPTION WHEN OTHERS THEN
                RETURN NULL;
            END;
        END;
    END;
    $$ LANGUAGE plpgsql;
    
    RAISE NOTICE 'Created safe_to_date function to use instead of direct date casting';
    RAISE NOTICE 'Usage example: SELECT safe_to_date(due_date) FROM invoices';
END
$$;
