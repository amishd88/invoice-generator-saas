-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables with relationships

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  default_price DECIMAL(10, 2) NOT NULL,
  default_tax_rate DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company TEXT NOT NULL,
  company_address TEXT NOT NULL,
  client TEXT NOT NULL,
  client_address TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  due_date TEXT NOT NULL,
  notes TEXT,
  terms TEXT,
  logo TEXT, -- Store base64 or URL
  logo_zoom DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
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

-- Create indexes for performance
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);

-- Enable RLS on tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

-- Create default policies that allow authenticated users to manage their own data
-- (When you implement authentication, you'll update these with user_id column)

-- For now, allowing all operations for development
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations on invoices" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow all operations on invoice_line_items" ON invoice_line_items FOR ALL USING (true);

-- Insert sample customers
INSERT INTO customers (name, address, email, phone)
VALUES 
  ('Acme Corporation', '123 Business St, Business City, BC 12345', 'contact@acme.com', '555-123-4567'),
  ('TechStart Inc.', '456 Innovation Ave, Tech Town, TT 67890', 'info@techstart.com', '555-987-6543'),
  ('Design Masters', '789 Creative Blvd, Artistic City, AC 54321', 'hello@designmasters.com', '555-456-7890');

-- Insert sample products
INSERT INTO products (name, description, default_price, default_tax_rate)
VALUES 
  ('Web Development', 'Professional web development services per hour', 125.00, 10.00),
  ('Logo Design', 'Custom logo design with multiple revisions', 450.00, 8.50),
  ('UI/UX Consultation', 'Expert UI/UX advice per hour', 150.00, 10.00),
  ('Server Maintenance', 'Monthly server maintenance and updates', 200.00, 7.50),
  ('Content Creation', 'Professional content writing per 1000 words', 120.00, 5.00);