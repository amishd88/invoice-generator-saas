/**
 * Alternative implementation for saveInvoice that bypasses the EXTRACT function issue
 * by using a direct SQL query instead of the Supabase API
 * 
 * You can copy this implementation into your invoiceService.ts file
 * and replace the existing saveInvoice function.
 */

// Create a new invoice or update an existing one - using direct SQL to avoid EXTRACT issues
export async function saveInvoice(invoice: InvoiceState) {
  const now = new Date().toISOString();
  
  try {
    // Get the current user's ID
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    console.log('Current user ID:', userId);
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    // Format the due date - just make sure it's YYYY-MM-DD
    let formattedDueDate = null;
    if (invoice.dueDate) {
      try {
        if (typeof invoice.dueDate === 'string') {
          formattedDueDate = invoice.dueDate.split('T')[0];
        } else if (invoice.dueDate instanceof Date) {
          formattedDueDate = invoice.dueDate.toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('Error formatting due date:', error);
      }
    }
    
    // Prepare invoice data
    const currencyJson = invoice.currency ? JSON.stringify(invoice.currency) : null;
    const shippingJson = invoice.shipping ? JSON.stringify(invoice.shipping) : null;
    const taxesJson = invoice.taxes ? JSON.stringify(invoice.taxes) : null;
    
    let invoiceId = invoice.id;
    
    // If no ID, create a new invoice using direct SQL (avoiding the Supabase ORM)
    if (!invoiceId) {
      console.log('Creating new invoice via direct SQL...');
      
      const { data, error } = await supabase.rpc('insert_invoice_direct', {
        p_company: invoice.company,
        p_company_address: invoice.companyAddress,
        p_client: invoice.client,
        p_client_address: invoice.clientAddress,
        p_invoice_number: invoice.invoiceNumber,
        p_due_date: formattedDueDate,
        p_notes: invoice.notes,
        p_terms: invoice.terms,
        p_logo: typeof invoice.logo === 'string' ? invoice.logo : null,
        p_logo_zoom: invoice.logoZoom,
        p_customer_id: invoice.customerId,
        p_status: invoice.status || 'draft',
        p_user_id: userId,
        p_template_id: invoice.templateId,
        p_currency: currencyJson,
        p_show_shipping: invoice.showShipping,
        p_show_discount: invoice.showDiscount,
        p_show_tax_column: invoice.showTaxColumn,
        p_show_signature: invoice.showSignature,
        p_show_payment_details: invoice.showPaymentDetails,
        p_shipping: shippingJson,
        p_taxes: taxesJson,
        p_created_at: now,
        p_updated_at: now
      });
      
      if (error) {
        // Fall back to raw SQL if RPC fails
        console.log('RPC failed, trying raw SQL...');
        
        const sql = `
          INSERT INTO invoices (
            company, company_address, client, client_address, invoice_number, due_date,
            notes, terms, logo, logo_zoom, customer_id, status, user_id, template_id,
            currency, show_shipping, show_discount, show_tax_column, show_signature,
            show_payment_details, shipping, taxes, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, $24
          ) RETURNING id
        `;
        
        const { data: rawData, error: rawError } = await supabase.rpc('run_sql', {
          query: sql,
          params: [
            invoice.company, invoice.companyAddress, invoice.client, invoice.clientAddress,
            invoice.invoiceNumber, formattedDueDate, invoice.notes, invoice.terms,
            typeof invoice.logo === 'string' ? invoice.logo : null, invoice.logoZoom,
            invoice.customerId, invoice.status || 'draft', userId, invoice.templateId,
            currencyJson, invoice.showShipping, invoice.showDiscount, invoice.showTaxColumn,
            invoice.showSignature, invoice.showPaymentDetails, shippingJson, taxesJson,
            now, now
          ]
        });
        
        if (rawError) {
          console.error("Error with raw SQL insert:", rawError);
          throw rawError;
        }
        
        invoiceId = rawData[0].id;
      } else {
        invoiceId = data.id;
      }
      
      console.log('New invoice created with ID:', invoiceId);
    } 
    // Otherwise update the existing invoice using parameterized SQL
    else {
      console.log('Updating existing invoice ID:', invoiceId);
      
      const { error } = await supabase.rpc('update_invoice_direct', {
        p_id: invoiceId,
        p_company: invoice.company,
        p_company_address: invoice.companyAddress,
        p_client: invoice.client,
        p_client_address: invoice.clientAddress,
        p_invoice_number: invoice.invoiceNumber,
        p_due_date: formattedDueDate,
        p_notes: invoice.notes,
        p_terms: invoice.terms,
        p_logo: typeof invoice.logo === 'string' ? invoice.logo : null,
        p_logo_zoom: invoice.logoZoom,
        p_customer_id: invoice.customerId,
        p_status: invoice.status || 'draft',
        p_template_id: invoice.templateId,
        p_currency: currencyJson,
        p_show_shipping: invoice.showShipping,
        p_show_discount: invoice.showDiscount,
        p_show_tax_column: invoice.showTaxColumn,
        p_show_signature: invoice.showSignature,
        p_show_payment_details: invoice.showPaymentDetails,
        p_shipping: shippingJson,
        p_taxes: taxesJson,
        p_updated_at: now
      });
      
      if (error) {
        console.error("Error updating invoice:", error);
        throw error;
      }
      
      console.log('Invoice updated successfully');
    }
    
    // Handle line items - delete existing ones first if updating
    if (invoiceId && invoice.items && invoice.items.length > 0) {
      if (invoice.id) {
        // Delete existing line items for this invoice
        console.log('Deleting existing line items for invoice:', invoiceId);
        const { error: deleteError } = await supabase
          .from(LINE_ITEMS_TABLE)
          .delete()
          .eq('invoice_id', invoiceId);
        
        if (deleteError) {
          console.error("Error deleting line items:", deleteError);
          throw deleteError;
        }
      }
      
      // Insert new line items
      console.log('Adding', invoice.items.length, 'line items to invoice');
      const lineItemsToInsert = invoice.items.map((item: LineItem) => ({
        invoice_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        tax_rate: item.taxRate || 0,  // Ensure tax_rate is not null
        product_id: item.productId,
        created_at: now,
        updated_at: now
      }));
      
      const { error: insertError } = await supabase
        .from(LINE_ITEMS_TABLE)
        .insert(lineItemsToInsert);
      
      if (insertError) {
        console.error("Error inserting line items:", insertError);
        throw insertError;
      }
      console.log('Line items added successfully');
    }
    
    // Return the saved invoice
    console.log('Invoice saved successfully, returning data for ID:', invoiceId);
    return getInvoiceById(invoiceId);
  } catch (error) {
    console.error('Error saving invoice:', error);
    throw error;
  }
}

// Add these stored procedures to your Supabase database
/*
CREATE OR REPLACE FUNCTION insert_invoice_direct(
  p_company TEXT,
  p_company_address TEXT,
  p_client TEXT,
  p_client_address TEXT,
  p_invoice_number TEXT,
  p_due_date TEXT,
  p_notes TEXT,
  p_terms TEXT,
  p_logo TEXT,
  p_logo_zoom DECIMAL,
  p_customer_id UUID,
  p_status TEXT,
  p_user_id UUID,
  p_template_id TEXT,
  p_currency JSONB,
  p_show_shipping BOOLEAN,
  p_show_discount BOOLEAN,
  p_show_tax_column BOOLEAN,
  p_show_signature BOOLEAN,
  p_show_payment_details BOOLEAN,
  p_shipping JSONB,
  p_taxes JSONB,
  p_created_at TIMESTAMP WITH TIME ZONE,
  p_updated_at TIMESTAMP WITH TIME ZONE
) 
RETURNS TABLE (id UUID) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO invoices (
    company, company_address, client, client_address, invoice_number, due_date,
    notes, terms, logo, logo_zoom, customer_id, status, user_id, template_id,
    currency, show_shipping, show_discount, show_tax_column, show_signature,
    show_payment_details, shipping, taxes, created_at, updated_at
  ) VALUES (
    p_company, p_company_address, p_client, p_client_address, p_invoice_number, p_due_date,
    p_notes, p_terms, p_logo, p_logo_zoom, p_customer_id, p_status, p_user_id, p_template_id,
    p_currency, p_show_shipping, p_show_discount, p_show_tax_column, p_show_signature,
    p_show_payment_details, p_shipping, p_taxes, p_created_at, p_updated_at
  )
  RETURNING id INTO new_id;
  
  RETURN QUERY SELECT new_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_invoice_direct(
  p_id UUID,
  p_company TEXT,
  p_company_address TEXT,
  p_client TEXT,
  p_client_address TEXT,
  p_invoice_number TEXT,
  p_due_date TEXT,
  p_notes TEXT,
  p_terms TEXT,
  p_logo TEXT,
  p_logo_zoom DECIMAL,
  p_customer_id UUID,
  p_status TEXT,
  p_template_id TEXT,
  p_currency JSONB,
  p_show_shipping BOOLEAN,
  p_show_discount BOOLEAN,
  p_show_tax_column BOOLEAN,
  p_show_signature BOOLEAN,
  p_show_payment_details BOOLEAN,
  p_shipping JSONB,
  p_taxes JSONB,
  p_updated_at TIMESTAMP WITH TIME ZONE
) 
RETURNS VOID 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE invoices
  SET
    company = p_company,
    company_address = p_company_address,
    client = p_client,
    client_address = p_client_address,
    invoice_number = p_invoice_number,
    due_date = p_due_date,
    notes = p_notes,
    terms = p_terms,
    logo = p_logo,
    logo_zoom = p_logo_zoom,
    customer_id = p_customer_id,
    status = p_status,
    template_id = p_template_id,
    currency = p_currency,
    show_shipping = p_show_shipping,
    show_discount = p_show_discount,
    show_tax_column = p_show_tax_column,
    show_signature = p_show_signature,
    show_payment_details = p_show_payment_details,
    shipping = p_shipping,
    taxes = p_taxes,
    updated_at = p_updated_at
  WHERE
    id = p_id AND
    user_id = auth.uid();
END;
$$;

-- Also create a generic run_sql function to execute raw SQL
CREATE OR REPLACE FUNCTION run_sql(query text, params text[])
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE query INTO result USING params;
  RETURN result;
END;
$$;
*/
