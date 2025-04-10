-- Add missing columns to the invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS template_id TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency JSONB;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS show_shipping BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS show_discount BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS show_tax_column BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS show_signature BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS show_payment_details BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shipping JSONB;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS taxes JSONB;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12, 2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total_paid DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_date TIMESTAMP WITH TIME ZONE;

-- Add missing columns to the customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS vat_number TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'USD';

-- Add missing columns to the products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;

-- Create a function to calculate invoice total
CREATE OR REPLACE FUNCTION calculate_invoice_total() 
RETURNS TRIGGER AS $$
DECLARE
    total DECIMAL(12, 2);
BEGIN
    -- Calculate total from line items
    SELECT COALESCE(SUM(quantity * price), 0) INTO total
    FROM invoice_line_items
    WHERE invoice_id = NEW.id;
    
    -- Update the invoice total
    NEW.total_amount := total;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update total_amount whenever an invoice is updated
CREATE OR REPLACE TRIGGER update_invoice_total
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION calculate_invoice_total();

-- Create or replace function to get monthly invoice totals
CREATE OR REPLACE FUNCTION get_monthly_invoice_totals(months_back integer DEFAULT 6)
RETURNS TABLE (
    month_date timestamp with time zone,
    total_amount numeric,
    total_count bigint
) AS $$
DECLARE
    start_date timestamp with time zone;
BEGIN
    -- Calculate the start date based on months_back
    start_date := date_trunc('month', now()) - (months_back || ' months')::interval;
    
    RETURN QUERY
    SELECT 
        date_trunc('month', i.created_at) as month_date,
        COALESCE(SUM(i.total_amount), 0) as total_amount,
        COUNT(i.id) as total_count
    FROM 
        invoices i
    WHERE 
        i.created_at >= start_date
        AND i.user_id = auth.uid()
    GROUP BY 
        date_trunc('month', i.created_at)
    ORDER BY 
        month_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to get product price statistics
CREATE OR REPLACE FUNCTION get_product_price_stats()
RETURNS TABLE (
    avg_price numeric,
    min_price numeric,
    max_price numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(AVG(default_price), 0) as avg_price,
        COALESCE(MIN(default_price), 0) as min_price,
        COALESCE(MAX(default_price), 0) as max_price
    FROM 
        products
    WHERE
        user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing invoices to calculate total_amount based on line items
DO $$
DECLARE
    inv_record RECORD;
    line_total DECIMAL(12, 2);
BEGIN
    FOR inv_record IN SELECT id FROM invoices LOOP
        -- Calculate total from line items
        SELECT COALESCE(SUM(quantity * price), 0) INTO line_total
        FROM invoice_line_items
        WHERE invoice_id = inv_record.id;
        
        -- Update the invoice
        UPDATE invoices
        SET total_amount = line_total
        WHERE id = inv_record.id;
    END LOOP;
END $$;

-- Create indexes for optimizing queries with the new columns
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_total_amount ON invoices(total_amount);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
