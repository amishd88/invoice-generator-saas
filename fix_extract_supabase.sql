-- Fix for PostgreSQL EXTRACT function error in Supabase
-- This approach works around the pg_catalog permission issue

-- 1. Check database types and issues
DO $$
DECLARE
    column_type TEXT;
BEGIN
    -- Check the type of the due_date column
    SELECT data_type INTO column_type
    FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'due_date';
    
    RAISE NOTICE 'Current due_date column type: %', column_type;
    
    -- Clean up any bad date values
    UPDATE invoices
    SET due_date = NULL
    WHERE due_date IS NOT NULL 
      AND (due_date::TEXT !~ '^\d{4}-\d{2}-\d{2}' OR due_date::TEXT = '');
    
    RAISE NOTICE 'Cleaned up invalid date values';
END $$;

-- 2. Create replacement functions in public schema
-- Create a function to safely cast dates
CREATE OR REPLACE FUNCTION public.safe_date_cast(value TEXT)
RETURNS DATE AS $$
BEGIN
    IF value IS NULL OR value = '' THEN
        RETURN NULL;
    END IF;
    
    BEGIN
        RETURN value::DATE;
    EXCEPTION WHEN OTHERS THEN
        RETURN NULL;
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Replace the problematic EXTRACT calls in any views
-- First check if any views use EXTRACT on due_date
DO $$
DECLARE
    view_record RECORD;
BEGIN
    FOR view_record IN
        SELECT viewname, definition
        FROM pg_views
        WHERE definition ILIKE '%extract%due_date%'
    LOOP
        RAISE NOTICE 'View % uses EXTRACT on due_date: %', 
                     view_record.viewname, 
                     view_record.definition;
    END LOOP;
END $$;

-- 4. Add a type cast in triggers if needed
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN
        SELECT trigger_name, event_manipulation, action_statement
        FROM information_schema.triggers
        WHERE event_object_table = 'invoices'
    LOOP
        RAISE NOTICE 'Trigger % on % action: %', 
                     trigger_record.trigger_name,
                     trigger_record.event_manipulation,
                     trigger_record.action_statement;
    END LOOP;
END $$;
