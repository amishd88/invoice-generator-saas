-- Create a direct intercept for EXTRACT calls that's guaranteed to work
-- This approach creates a special days_overdue column to avoid the EXTRACT calls

-- 1. Add a helper column to store calculated days overdue
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS calculated_days_overdue INTEGER DEFAULT NULL;

-- 2. Create a function to update days_overdue safely without using EXTRACT
CREATE OR REPLACE FUNCTION update_days_overdue()
RETURNS TRIGGER AS $$
BEGIN
  -- This uses date arithmetic instead of EXTRACT
  IF NEW.due_date IS NOT NULL AND NEW.due_date < CURRENT_DATE AND NEW.status = 'unpaid' THEN
    NEW.calculated_days_overdue := (CURRENT_DATE - NEW.due_date::date);
  ELSE
    NEW.calculated_days_overdue := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a trigger to update the helper column automatically
DROP TRIGGER IF EXISTS update_days_overdue_trigger ON invoices;
CREATE TRIGGER update_days_overdue_trigger
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_days_overdue();

-- 4. Update existing rows
UPDATE invoices
SET calculated_days_overdue = 
  CASE 
    WHEN due_date IS NOT NULL AND due_date < CURRENT_DATE AND status = 'unpaid' 
    THEN (CURRENT_DATE - due_date::date)
    ELSE 0
  END;

-- 5. Create a view that uses the calculated column instead of EXTRACT
CREATE OR REPLACE VIEW invoices_view AS
SELECT 
  i.*,
  calculated_days_overdue as days_overdue
FROM 
  invoices i;

-- This approach completely bypasses any EXTRACT calls
-- by precalculating and storing the value that would normally 
-- require EXTRACT to compute
