-- Simple fix for the EXTRACT function error
-- Run this in your Supabase SQL editor

-- 1. Alter the due_date column to be a proper date type
ALTER TABLE invoices 
ALTER COLUMN due_date TYPE DATE USING due_date::DATE;

-- That's it! This changes the column type to DATE,
-- which will work properly with PostgreSQL's EXTRACT function.
