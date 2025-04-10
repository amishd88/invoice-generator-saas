-- Consolidated Schema for Invoice Generator SaaS
-- Includes base schema, RLS, reporting features, and all necessary fixes
-- Created: April 10, 2025

-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables with relationships and user_id for Row Level Security

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  contact_person TEXT,
  vat_number TEXT,
  website TEXT,
  preferred_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  default_price DECIMAL(10, 2) NOT NULL,
  default_tax_rate DECIMAL(5, 2) NOT NULL,
  unit TEXT DEFAULT 'item',
  sku TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  company_address TEXT NOT NULL,
  client TEXT NOT NULL,
  client_address TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  due_date DATE NOT NULL,
  notes TEXT,
  terms TEXT,
  logo TEXT, -- Store base64 or URL
  logo_zoom DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  -- Reporting fields
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  payment_due_amount DECIMAL(12, 2) DEFAULT 0,
  payment_status TEXT,
  sent_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  days_overdue INTEGER DEFAULT 0,
  -- UI configuration
  template_id TEXT,
  currency JSONB DEFAULT '{"code":"USD","symbol":"$"}',
  show_shipping BOOLEAN DEFAULT false,
  show_discount BOOLEAN DEFAULT false,
  total_amount DECIMAL(15, 2) DEFAULT 0,
  total_paid DECIMAL(15, 2) DEFAULT 0,
  shipping JSONB DEFAULT '{}',
  shipping_tax_rate DECIMAL(5, 2) DEFAULT 0,
  discount DECIMAL(15, 2) DEFAULT 0,
  discount_type TEXT DEFAULT 'fixed',
  show_payment_details BOOLEAN DEFAULT false,
  show_signature BOOLEAN DEFAULT false,
  show_tax_column BOOLEAN DEFAULT true,
  show_tax_summary BOOLEAN DEFAULT true,
  show_line_item_tax BOOLEAN DEFAULT true,
  show_subtotal BOOLEAN DEFAULT true,
  show_item_description BOOLEAN DEFAULT true,
  show_item_quantity BOOLEAN DEFAULT true,
  show_payment_terms BOOLEAN DEFAULT true,
  taxes JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice line items table
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoice payments table (for reporting)
CREATE TABLE invoice_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  payment_method TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics summary table (for reporting)
CREATE TABLE analytics_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_type TEXT NOT NULL,
  summary_period TEXT NOT NULL,
  summary_date DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, summary_type, summary_period, summary_date)
);

-- Create helper table for date functions to avoid EXTRACT issues
CREATE TABLE invoices_dates_helper (
  invoice_id UUID PRIMARY KEY,
  due_date_year INTEGER,
  due_date_month INTEGER,
  due_date_day INTEGER,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX idx_analytics_summaries_user_lookup ON analytics_summaries(user_id, summary_type, summary_period);

-- Enable RLS on tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices_dates_helper ENABLE ROW LEVEL SECURITY;

-- Create security policies that restrict access to user's own data
-- Customers policies
CREATE POLICY "Users can manage their own customers" ON customers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Users can manage their own products" ON products FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "Users can manage their own invoices" ON invoices FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Helper table policies
CREATE POLICY "Users can manage their date helper data" ON invoices_dates_helper FOR ALL USING (
  EXISTS (
    SELECT 1 FROM invoices WHERE invoices.id = invoices_dates_helper.invoice_id AND invoices.user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM invoices WHERE invoices.id = invoices_dates_helper.invoice_id AND invoices.user_id = auth.uid()
  )
);

-- Invoice line items policies (security through invoice relationship)
CREATE POLICY "Users can manage items on their own invoices" ON invoice_line_items FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = invoice_line_items.invoice_id AND invoices.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = invoice_line_items.invoice_id AND invoices.user_id = auth.uid()
    )
  );

-- Invoice payments policies (security through invoice relationship)
CREATE POLICY "Users can manage payments on their own invoices" ON invoice_payments FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = invoice_payments.invoice_id AND invoices.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = invoice_payments.invoice_id AND invoices.user_id = auth.uid()
    )
  );

-- Analytics summaries policies
CREATE POLICY "Users can manage their own analytics summaries" ON analytics_summaries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- Functions and Triggers for Reporting Features

-- Function to update invoice date parts in helper table
CREATE OR REPLACE FUNCTION update_invoice_date_parts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.due_date IS NOT NULL THEN
    -- Insert or update date parts in the helper table
    INSERT INTO invoices_dates_helper (
      invoice_id, 
      due_date_year, 
      due_date_month, 
      due_date_day
    ) 
    VALUES (
      NEW.id,
      CAST(SUBSTRING(CAST(NEW.due_date AS TEXT), 1, 4) AS INTEGER),
      CAST(SUBSTRING(CAST(NEW.due_date AS TEXT), 6, 2) AS INTEGER),
      CAST(SUBSTRING(CAST(NEW.due_date AS TEXT), 9, 2) AS INTEGER)
    )
    ON CONFLICT (invoice_id) 
    DO UPDATE SET
      due_date_year = CAST(SUBSTRING(CAST(NEW.due_date AS TEXT), 1, 4) AS INTEGER),
      due_date_month = CAST(SUBSTRING(CAST(NEW.due_date AS TEXT), 6, 2) AS INTEGER),
      due_date_day = CAST(SUBSTRING(CAST(NEW.due_date AS TEXT), 9, 2) AS INTEGER);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for the invoices table
DROP TRIGGER IF EXISTS update_invoice_date_parts_trigger ON invoices;
CREATE TRIGGER update_invoice_date_parts_trigger
AFTER INSERT OR UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_invoice_date_parts();

-- Function to calculate invoice payment due amount based on line items
CREATE OR REPLACE FUNCTION calculate_invoice_payment_due_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Add a guard to prevent recursive updates
  IF (TG_OP = 'UPDATE' AND 
      NEW.payment_due_amount = OLD.payment_due_amount) THEN
    RETURN NEW;
  END IF;

  NEW.payment_due_amount = (
    SELECT COALESCE(SUM(quantity * price * (1 + tax_rate/100)), 0)
    FROM invoice_line_items
    WHERE invoice_line_items.invoice_id = NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update payment due amount before invoice insert/update
CREATE TRIGGER update_invoice_payment_due_amount
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION calculate_invoice_payment_due_amount();

-- Function to update payment status and days_overdue
CREATE OR REPLACE FUNCTION update_invoice_status_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Add a guard to prevent recursive updates
  IF (TG_OP = 'UPDATE' AND 
      NEW.payment_status = OLD.payment_status AND
      NEW.days_overdue = OLD.days_overdue) THEN
    RETURN NEW;
  END IF;

  -- Update payment_status based on other fields
  NEW.payment_status := 
    CASE
      WHEN NEW.status = 'paid' THEN 'paid'
      WHEN NEW.status = 'draft' THEN 'draft'
      WHEN NEW.status = 'cancelled' THEN 'cancelled'
      WHEN NEW.status = 'sent' AND NEW.due_date >= CURRENT_DATE THEN 'outstanding'
      WHEN NEW.status = 'overdue' OR (NEW.status = 'sent' AND NEW.due_date < CURRENT_DATE) THEN 'overdue'
      ELSE 'unknown'
    END;
  
  -- Update days_overdue - Direct date subtraction gives days as integer
  NEW.days_overdue := 
    CASE 
      WHEN NEW.status IN ('paid', 'draft', 'cancelled') THEN 0
      WHEN NEW.due_date < CURRENT_DATE THEN 
        (CURRENT_DATE - NEW.due_date)
      ELSE 0
    END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update status fields before insert or update
CREATE TRIGGER update_invoice_status_fields_trigger
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_invoice_status_fields();

-- Function to update invoice amount when line items change
CREATE OR REPLACE FUNCTION update_invoice_amount_on_line_item_change()
RETURNS TRIGGER AS $$
DECLARE
  invoice_to_update_id UUID;
  current_amount DECIMAL(12, 2);
  new_amount DECIMAL(12, 2);
BEGIN
  invoice_to_update_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.invoice_id ELSE NEW.invoice_id END;
  
  -- Calculate new amount
  SELECT COALESCE(SUM(quantity * price * (1 + tax_rate/100)), 0) INTO new_amount
  FROM invoice_line_items
  WHERE invoice_line_items.invoice_id = invoice_to_update_id;
  
  -- Get current amount
  SELECT payment_due_amount INTO current_amount
  FROM invoices
  WHERE id = invoice_to_update_id;
  
  -- Only update if amount has changed
  IF new_amount != current_amount THEN
    UPDATE invoices
    SET payment_due_amount = new_amount
    WHERE id = invoice_to_update_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for line item changes
CREATE TRIGGER update_invoice_amount_on_line_item_insert
AFTER INSERT ON invoice_line_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_amount_on_line_item_change();

CREATE TRIGGER update_invoice_amount_on_line_item_update
AFTER UPDATE ON invoice_line_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_amount_on_line_item_change();

CREATE TRIGGER update_invoice_amount_on_line_item_delete
AFTER DELETE ON invoice_line_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_amount_on_line_item_change();

-- Function to update invoice status based on payment amount
CREATE OR REPLACE FUNCTION update_invoice_status_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  total_payments DECIMAL(12, 2);
  invoice_amount DECIMAL(12, 2);
  invoice_to_update_id UUID;
  current_status TEXT;
BEGIN
  invoice_to_update_id := NEW.invoice_id;
  
  -- Check current status to avoid unnecessary updates
  SELECT status INTO current_status
  FROM invoices
  WHERE id = invoice_to_update_id;
  
  -- Skip if already paid
  IF current_status = 'paid' THEN
    RETURN NULL;
  END IF;
  
  -- Calculate total payments for this invoice
  SELECT COALESCE(SUM(amount), 0) INTO total_payments
  FROM invoice_payments
  WHERE invoice_id = invoice_to_update_id;
  
  -- Get invoice amount
  SELECT payment_due_amount INTO invoice_amount
  FROM invoices
  WHERE id = invoice_to_update_id;
  
  -- Update invoice status if fully paid
  IF total_payments >= invoice_amount THEN
    UPDATE invoices
    SET status = 'paid', paid_date = CURRENT_TIMESTAMP
    WHERE id = invoice_to_update_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for invoice status update after payment
CREATE TRIGGER update_invoice_status_trigger
AFTER INSERT OR UPDATE ON invoice_payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_status_on_payment();

-- Function to auto-update invoice status to overdue
CREATE OR REPLACE FUNCTION update_overdue_invoices()
RETURNS void AS $$
BEGIN
  UPDATE invoices
  SET status = 'overdue'
  WHERE 
    status = 'sent' AND 
    due_date < CURRENT_DATE;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;


-- Views for Reporting

-- View for sales reports
CREATE OR REPLACE VIEW user_sales_report AS
SELECT 
  i.id AS invoice_id,
  i.user_id,
  i.invoice_number,
  i.company,
  i.client,
  c.name AS customer_name,
  i.created_at,
  i.sent_date,
  i.due_date,
  i.paid_date,
  i.status,
  i.payment_status,
  i.payment_due_amount AS invoice_total,
  COALESCE(SUM(ip.amount), 0) AS total_paid,
  (i.payment_due_amount - COALESCE(SUM(ip.amount), 0)) AS balance_due,
  i.days_overdue
FROM 
  invoices i
LEFT JOIN 
  customers c ON i.customer_id = c.id
LEFT JOIN 
  invoice_payments ip ON i.id = ip.invoice_id
WHERE i.user_id = auth.uid() -- Enforce RLS at view level
GROUP BY 
  i.id, i.user_id, i.invoice_number, i.company, i.client, c.name, 
  i.created_at, i.sent_date, i.due_date, i.paid_date, i.status, 
  i.payment_status, i.payment_due_amount, i.days_overdue;

-- View for outstanding invoices report
CREATE OR REPLACE VIEW user_outstanding_invoices AS
SELECT 
  i.id AS invoice_id,
  i.user_id,
  i.invoice_number,
  i.company,
  i.client,
  c.name AS customer_name,
  i.due_date,
  i.payment_due_amount AS invoice_total,
  i.days_overdue,
  CASE 
    WHEN i.days_overdue BETWEEN 0 AND 30 THEN '0-30'
    WHEN i.days_overdue BETWEEN 31 AND 60 THEN '31-60'
    WHEN i.days_overdue BETWEEN 61 AND 90 THEN '61-90'
    WHEN i.days_overdue > 90 THEN '90+'
    ELSE 'current'
  END AS aging_bucket
FROM 
  invoices i
LEFT JOIN 
  customers c ON i.customer_id = c.id
WHERE 
  i.user_id = auth.uid() AND -- Enforce RLS at view level
  i.payment_status IN ('outstanding', 'overdue')
GROUP BY 
  i.id, i.user_id, i.invoice_number, i.company, i.client, c.name, 
  i.due_date, i.payment_due_amount, i.days_overdue;

-- View for customer payment history
CREATE OR REPLACE VIEW user_customer_payment_history AS
SELECT 
  c.id AS customer_id,
  i.user_id,
  c.name AS customer_name,
  COUNT(i.id) AS total_invoices,
  SUM(CASE WHEN i.status = 'paid' THEN 1 ELSE 0 END) AS paid_invoices,
  SUM(i.payment_due_amount) AS total_billed,
  SUM(CASE WHEN i.status = 'paid' THEN i.payment_due_amount ELSE 0 END) AS total_paid,
  SUM(CASE WHEN i.payment_status IN ('outstanding', 'overdue') THEN i.payment_due_amount ELSE 0 END) AS total_outstanding,
  AVG(i.days_overdue) AS avg_days_overdue,
  MAX(i.created_at) AS latest_invoice_date
FROM 
  customers c
LEFT JOIN 
  invoices i ON c.id = i.customer_id
WHERE c.user_id = auth.uid() -- Enforce RLS at view level
GROUP BY 
  c.id, i.user_id, c.name;

-- View for top products report
CREATE OR REPLACE VIEW user_product_sales_report AS
SELECT 
  p.id AS product_id,
  p.user_id,
  p.name AS product_name,
  COUNT(ili.id) AS times_sold,
  SUM(ili.quantity) AS total_quantity,
  SUM(ili.quantity * ili.price) AS total_revenue,
  AVG(ili.price) AS average_price
FROM 
  products p
LEFT JOIN 
  invoice_line_items ili ON p.id = ili.product_id
LEFT JOIN 
  invoices i ON ili.invoice_id = i.id AND i.status != 'cancelled' AND i.status != 'draft'
WHERE 
  p.user_id = auth.uid() AND -- Enforce RLS at view level
  ili.id IS NOT NULL
GROUP BY 
  p.id, p.user_id, p.name;

-- Initialize helper table with existing data
DO $$
BEGIN
  INSERT INTO invoices_dates_helper (
    invoice_id,
    due_date_year,
    due_date_month,
    due_date_day
  )
  SELECT 
    id,
    CAST(SUBSTRING(CAST(due_date AS TEXT), 1, 4) AS INTEGER),
    CAST(SUBSTRING(CAST(due_date AS TEXT), 6, 2) AS INTEGER),
    CAST(SUBSTRING(CAST(due_date AS TEXT), 9, 2) AS INTEGER)
  FROM 
    invoices
  ON CONFLICT (invoice_id) 
  DO NOTHING;
  
  RAISE NOTICE 'Initialized date helper table';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error initializing date helper table: %', SQLERRM;
END
$$;

-- Create a safe casting function for EXTRACT operations if needed
CREATE OR REPLACE FUNCTION safe_date_cast(value anyelement) 
RETURNS date AS $$
BEGIN
  -- Try to convert to date
  IF value IS NULL THEN
    RETURN NULL;
  END IF;
  
  BEGIN
    RETURN value::date;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Final notification
SELECT 'Consolidated schema applied successfully' as status;

-- Notify Supabase to reload schema
NOTIFY pgrst, 'reload schema';
