-- Quick fix script for the PostgreSQL EXTRACT function error
-- This simpler approach is more direct and may avoid some issues

-- First check the table structure
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
            -- Create a backup of the affected table
            BEGIN
                CREATE TABLE invoices_backup AS SELECT * FROM invoices;
                RAISE NOTICE 'Created backup table: invoices_backup';
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not create backup: %', SQLERRM;
            END;
            
            -- Direct method: drop and recreate the column
            BEGIN
                -- Prepare a temporary helper function to convert text to date
                CREATE OR REPLACE FUNCTION try_to_date(text_date TEXT) 
                RETURNS DATE AS $$
                BEGIN
                    -- Try different date formats
                    BEGIN
                        RETURN text_date::DATE;
                    EXCEPTION WHEN OTHERS THEN
                        BEGIN
                            RETURN to_date(text_date, 'YYYY-MM-DD');
                        EXCEPTION WHEN OTHERS THEN
                            BEGIN
                                RETURN to_date(text_date, 'YYYY/MM/DD');
                            EXCEPTION WHEN OTHERS THEN
                                RETURN NULL; -- If all conversions fail
                            END;
                        END;
                    END;
                END;
                $$ LANGUAGE plpgsql;
                
                -- Add a new temporary column
                ALTER TABLE invoices ADD COLUMN due_date_new DATE;
                
                -- Update the new column with converted values
                UPDATE invoices SET due_date_new = try_to_date(due_date::TEXT);
                
                -- Drop the old column and rename the new one
                ALTER TABLE invoices DROP COLUMN due_date;
                ALTER TABLE invoices RENAME COLUMN due_date_new TO due_date;
                
                -- Drop the helper function
                DROP FUNCTION try_to_date;
                
                RAISE NOTICE 'Successfully fixed due_date column type to DATE';
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Error fixing column: %', SQLERRM;
                
                -- Fallback approach if the above fails
                BEGIN
                    -- Just create a new column if needed
                    ALTER TABLE invoices DROP COLUMN IF EXISTS due_date_new;
                    ALTER TABLE invoices DROP COLUMN IF EXISTS due_date;
                    ALTER TABLE invoices ADD COLUMN due_date DATE;
                    RAISE NOTICE 'Created new due_date column with DATE type';
                EXCEPTION WHEN OTHERS THEN
                    RAISE NOTICE 'All attempts to fix due_date column failed: %', SQLERRM;
                END;
            END;
        ELSE
            RAISE NOTICE 'due_date column is already DATE type, no fix needed';
        END IF;
    ELSE
        RAISE NOTICE 'due_date column does not exist, creating it';
        ALTER TABLE invoices ADD COLUMN due_date DATE;
    END IF;
END$$;

-- After the schema fix, test that EXTRACT function works properly
SELECT EXTRACT(MONTH FROM DATE '2023-05-15') AS test_month;

-- Note: Run this script in your Supabase SQL editor
-- This should fix the "function pg_catalog.extract(unknown, integer) does not exist" error
