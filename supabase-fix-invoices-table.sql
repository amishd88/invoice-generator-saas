-- Check if invoices table exists and create it if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invoices') THEN
        -- Create the invoices table
        CREATE TABLE invoices (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            company TEXT NOT NULL,
            company_address TEXT NOT NULL,
            client TEXT NOT NULL,
            client_address TEXT NOT NULL,
            invoice_number TEXT NOT NULL,
            due_date DATE NOT NULL,
            notes TEXT,
            terms TEXT,
            logo TEXT,
            logo_zoom DECIMAL(5, 2) DEFAULT 1.0,
            customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
            status TEXT DEFAULT 'draft',
            template_id TEXT,
            currency JSONB,
            show_shipping BOOLEAN DEFAULT FALSE,
            show_discount BOOLEAN DEFAULT FALSE,
            show_tax_column BOOLEAN DEFAULT FALSE,
            show_signature BOOLEAN DEFAULT FALSE,
            show_payment_details BOOLEAN DEFAULT FALSE,
            shipping JSONB,
            taxes JSONB,
            total_amount DECIMAL(12, 2),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Invoices table created.';
        
        -- Create RLS policies
        ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
        
        -- Users can see their own invoices
        CREATE POLICY "Users can only see their own invoices" 
            ON invoices FOR SELECT 
            USING (auth.uid() = user_id);
            
        -- Users can insert their own invoices
        CREATE POLICY "Users can only insert their own invoices" 
            ON invoices FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
            
        -- Users can update their own invoices
        CREATE POLICY "Users can only update their own invoices" 
            ON invoices FOR UPDATE 
            USING (auth.uid() = user_id) 
            WITH CHECK (auth.uid() = user_id);
            
        -- Users can delete their own invoices
        CREATE POLICY "Users can only delete their own invoices" 
            ON invoices FOR DELETE 
            USING (auth.uid() = user_id);
            
        RAISE NOTICE 'Invoice RLS policies created.';
    ELSE
        -- Check if the due_date column is TEXT and update it to DATE if needed
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'invoices' 
              AND column_name = 'due_date' 
              AND data_type = 'text'
        ) THEN
            -- Create a backup of the table first
            CREATE TABLE invoices_backup AS SELECT * FROM invoices;
            
            -- Alter the column type to DATE
            BEGIN
                ALTER TABLE invoices 
                ALTER COLUMN due_date TYPE DATE USING due_date::DATE;
                RAISE NOTICE 'Due date column changed from TEXT to DATE.';
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Error converting due_date column: %', SQLERRM;
                -- If conversion fails, keep as TEXT
                RAISE NOTICE 'Due date column remains as TEXT.';
            END;
        END IF;
        
        -- Add any missing columns
        BEGIN
            ALTER TABLE invoices 
            ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
            ADD COLUMN IF NOT EXISTS template_id TEXT,
            ADD COLUMN IF NOT EXISTS currency JSONB,
            ADD COLUMN IF NOT EXISTS show_shipping BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS show_discount BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS show_tax_column BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS show_signature BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS show_payment_details BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS shipping JSONB,
            ADD COLUMN IF NOT EXISTS taxes JSONB,
            ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12, 2);
            
            RAISE NOTICE 'Missing columns added to invoices table.';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error adding columns: %', SQLERRM;
        END;
        
        -- Make sure RLS is enabled and policies exist
        IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'invoices' 
            AND schemaname = 'public'
        ) THEN
            ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
            
            -- Create basic policies
            CREATE POLICY "Users can only see their own invoices" 
                ON invoices FOR SELECT 
                USING (auth.uid() = user_id);
                
            CREATE POLICY "Users can only insert their own invoices" 
                ON invoices FOR INSERT 
                WITH CHECK (auth.uid() = user_id);
                
            CREATE POLICY "Users can only update their own invoices" 
                ON invoices FOR UPDATE 
                USING (auth.uid() = user_id) 
                WITH CHECK (auth.uid() = user_id);
                
            CREATE POLICY "Users can only delete their own invoices" 
                ON invoices FOR DELETE 
                USING (auth.uid() = user_id);
                
            RAISE NOTICE 'Invoice RLS policies created.';
        END IF;
    END IF;
    
    -- Check if invoice_line_items table exists and create it if not
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invoice_line_items') THEN
        -- Create the invoice_line_items table
        CREATE TABLE invoice_line_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
            description TEXT NOT NULL,
            quantity DECIMAL(10, 2) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            tax_rate DECIMAL(5, 2),
            product_id UUID REFERENCES products(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Invoice line items table created.';
        
        -- Create RLS policies
        ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
        
        -- Users can see line items through invoices
        CREATE POLICY "Users can only see invoice items through invoices" 
            ON invoice_line_items FOR SELECT 
            USING (
                EXISTS (
                    SELECT 1 FROM invoices
                    WHERE invoices.id = invoice_line_items.invoice_id
                    AND invoices.user_id = auth.uid()
                )
            );
            
        -- Users can insert line items to their invoices
        CREATE POLICY "Users can only insert invoice items to their invoices" 
            ON invoice_line_items FOR INSERT 
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM invoices
                    WHERE invoices.id = invoice_line_items.invoice_id
                    AND invoices.user_id = auth.uid()
                )
            );
            
        -- Users can update line items on their invoices
        CREATE POLICY "Users can only update items on their invoices" 
            ON invoice_line_items FOR UPDATE 
            USING (
                EXISTS (
                    SELECT 1 FROM invoices
                    WHERE invoices.id = invoice_line_items.invoice_id
                    AND invoices.user_id = auth.uid()
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM invoices
                    WHERE invoices.id = invoice_line_items.invoice_id
                    AND invoices.user_id = auth.uid()
                )
            );
            
        -- Users can delete line items on their invoices
        CREATE POLICY "Users can only delete items on their invoices" 
            ON invoice_line_items FOR DELETE 
            USING (
                EXISTS (
                    SELECT 1 FROM invoices
                    WHERE invoices.id = invoice_line_items.invoice_id
                    AND invoices.user_id = auth.uid()
                )
            );
            
        RAISE NOTICE 'Invoice line items RLS policies created.';
    END IF;
END
$$;