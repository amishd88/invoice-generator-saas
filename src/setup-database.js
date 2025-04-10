// Set up database tables in Supabase
import { supabase } from './lib/supabaseClient.js';

async function setupDatabase() {
  console.log('Setting up database tables...');
  
  try {
    // Create invoices table if it doesn't exist
    // Note: This is SQL that would need to be run in the Supabase SQL editor
    // We can't create tables directly through the JavaScript API
    console.log(`
    -- Run this SQL in your Supabase SQL Editor:
    
    -- Create invoices table
    CREATE TABLE IF NOT EXISTS public.invoices (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      invoice_number TEXT NOT NULL,
      client TEXT NOT NULL,
      company TEXT NOT NULL,
      company_address TEXT,
      client_address TEXT,
      due_date DATE,  -- Stores date without time component
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      total_amount NUMERIC(10,2) DEFAULT 0,
      total_paid NUMERIC(10,2) DEFAULT 0,
      status TEXT DEFAULT 'draft',
      paid_date DATE,
      template_id TEXT,
      currency JSONB,
      show_shipping BOOLEAN DEFAULT false,
      show_discount BOOLEAN DEFAULT false,
      show_tax_column BOOLEAN DEFAULT false,
      show_signature BOOLEAN DEFAULT false,
      show_payment_details BOOLEAN DEFAULT false,
      shipping JSONB,
      taxes JSONB,
      notes TEXT,
      terms TEXT,
      logo TEXT,
      logo_zoom NUMERIC(5,2) DEFAULT 1.0,
      customer_id UUID,
      user_id UUID
    );

    -- Create invoice line items table
    CREATE TABLE IF NOT EXISTS public.invoice_line_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
      price NUMERIC(10,2) NOT NULL DEFAULT 0,
      tax_rate NUMERIC(5,2) DEFAULT 0,
      product_id UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Create customers table
    CREATE TABLE IF NOT EXISTS public.customers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Create products table
    CREATE TABLE IF NOT EXISTS public.products (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      default_price NUMERIC(10,2) DEFAULT 0,
      default_tax_rate NUMERIC(5,2) DEFAULT 0,
      user_id UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Create RLS policies
    ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for authenticated users
    CREATE POLICY "Authenticated users can view their own invoices" ON public.invoices
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Authenticated users can insert their own invoices" ON public.invoices
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Authenticated users can update their own invoices" ON public.invoices
      FOR UPDATE TO authenticated
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Authenticated users can delete their own invoices" ON public.invoices
      FOR DELETE TO authenticated
      USING (auth.uid() = user_id);
    `);
    
    console.log('You need to run the above SQL in your Supabase SQL Editor to create the missing tables.');
    console.log('Additionally, make sure your table has a user_id column linked to the authenticated user.');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the setup
setupDatabase();
