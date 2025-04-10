import { supabase } from '../../lib/supabaseClient';
import { InvoiceState, LineItem } from '../../types';

export const getAllInvoices = async (): Promise<InvoiceState[]> => {
  // Check if database tables exist first
  try {
    const { count, error: tableCheckError } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });
      
    if (tableCheckError) {
      console.error('Table check error:', tableCheckError.message);
      if (tableCheckError.code === '42P01') { // Table doesn't exist
        throw new Error('The invoices table does not exist in your Supabase database. Please run the setup-database.js script.');
      }
    }
  } catch (err) {
    console.error('Unexpected error checking tables:', err);
  }

  // If we get here, the table exists, so continue with the query
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching invoices:', error);
    throw new Error(`Failed to fetch invoices: ${error.message}`);
  }
  
  // Convert database format to application format
  const invoices = await Promise.all((data || []).map(async (invoice) => {
    // Fetch line items for each invoice
    const { data: lineItems, error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .select('*')
      .eq('invoice_id', invoice.id);
    
    if (lineItemsError) {
      console.error('Error fetching line items:', lineItemsError);
      throw new Error(`Failed to fetch line items: ${lineItemsError.message}`);
    }
    
    return {
      id: invoice.id,
      company: invoice.company,
      companyAddress: invoice.company_address,
      client: invoice.client,
      clientAddress: invoice.client_address,
      invoiceNumber: invoice.invoice_number,
      dueDate: invoice.due_date,
      notes: invoice.notes || '',
      terms: invoice.terms || '',
      logo: invoice.logo,
      logoZoom: invoice.logo_zoom,
      customerId: invoice.customer_id,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
      // Populate other fields
      templateId: invoice.template_id || 'professional',
      currency: invoice.currency ? JSON.parse(invoice.currency) : null,
      showShipping: invoice.show_shipping || false,
      showDiscount: invoice.show_discount || false,
      showTaxColumn: invoice.show_tax_column || false,
      showSignature: invoice.show_signature || false,
      showPaymentDetails: invoice.show_payment_details || false,
      shipping: invoice.shipping ? JSON.parse(invoice.shipping) : {},
      taxes: invoice.taxes ? JSON.parse(invoice.taxes) : [],
      // Convert line items
      items: (lineItems || []).map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        taxRate: item.tax_rate,
        productId: item.product_id
      }))
    } as InvoiceState;
  }));
  
  return invoices;
};

export const getInvoiceById = async (id: string): Promise<InvoiceState | null> => {
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching invoice:', error);
    throw new Error(`Failed to fetch invoice: ${error.message}`);
  }
  
  if (!invoice) {
    return null;
  }
  
  // Fetch line items
  const { data: lineItems, error: lineItemsError } = await supabase
    .from('invoice_line_items')
    .select('*')
    .eq('invoice_id', invoice.id);
  
  if (lineItemsError) {
    console.error('Error fetching line items:', lineItemsError);
    throw new Error(`Failed to fetch line items: ${lineItemsError.message}`);
  }
  
  return {
    id: invoice.id,
    company: invoice.company,
    companyAddress: invoice.company_address,
    client: invoice.client,
    clientAddress: invoice.client_address,
    invoiceNumber: invoice.invoice_number,
    dueDate: invoice.due_date,
    notes: invoice.notes || '',
    terms: invoice.terms || '',
    logo: invoice.logo,
    logoZoom: invoice.logo_zoom,
    customerId: invoice.customer_id,
    createdAt: invoice.created_at,
    updatedAt: invoice.updated_at,
    // Populate other fields
    templateId: invoice.template_id || 'professional',
    currency: invoice.currency ? JSON.parse(invoice.currency) : null,
    showShipping: invoice.show_shipping || false,
    showDiscount: invoice.show_discount || false,
    showTaxColumn: invoice.show_tax_column || false,
    showSignature: invoice.show_signature || false,
    showPaymentDetails: invoice.show_payment_details || false,
    shipping: invoice.shipping ? JSON.parse(invoice.shipping) : {},
    taxes: invoice.taxes ? JSON.parse(invoice.taxes) : [],
    // Convert line items
    items: (lineItems || []).map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      taxRate: item.tax_rate,
      productId: item.product_id
    }))
  } as InvoiceState;
};

export const createInvoice = async (invoice: Omit<InvoiceState, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  // First, create the invoice record
  const { data: newInvoice, error } = await supabase
    .from('invoices')
    .insert([{
      company: invoice.company,
      company_address: invoice.companyAddress,
      client: invoice.client,
      client_address: invoice.clientAddress,
      invoice_number: invoice.invoiceNumber,
      due_date: invoice.dueDate,
      notes: invoice.notes,
      terms: invoice.terms,
      logo: invoice.logo,
      logo_zoom: invoice.logoZoom,
      customer_id: invoice.customerId,
      // Additional fields
      template_id: invoice.templateId,
      currency: invoice.currency ? JSON.stringify(invoice.currency) : null,
      show_shipping: invoice.showShipping,
      show_discount: invoice.showDiscount,
      show_tax_column: invoice.showTaxColumn,
      show_signature: invoice.showSignature,
      show_payment_details: invoice.showPaymentDetails,
      shipping: invoice.shipping ? JSON.stringify(invoice.shipping) : null,
      taxes: invoice.taxes ? JSON.stringify(invoice.taxes) : null
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating invoice:', error);
    throw new Error(`Failed to create invoice: ${error.message}`);
  }
  
  // Now create line items
  if (invoice.items && invoice.items.length > 0) {
    const lineItems = invoice.items.map(item => ({
      invoice_id: newInvoice.id,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      tax_rate: item.taxRate,
      product_id: item.productId
    }));
    
    const { error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .insert(lineItems);
    
    if (lineItemsError) {
      console.error('Error creating line items:', lineItemsError);
      // Consider rolling back the invoice creation here
      throw new Error(`Failed to create line items: ${lineItemsError.message}`);
    }
  }
  
  return newInvoice.id;
};

export const updateInvoice = async (id: string, updates: Partial<InvoiceState>): Promise<void> => {
  // Update the invoice record
  const { error } = await supabase
    .from('invoices')
    .update({
      company: updates.company,
      company_address: updates.companyAddress,
      client: updates.client,
      client_address: updates.clientAddress,
      invoice_number: updates.invoiceNumber,
      due_date: updates.dueDate,
      notes: updates.notes,
      terms: updates.terms,
      logo: updates.logo,
      logo_zoom: updates.logoZoom,
      customer_id: updates.customerId,
      updated_at: new Date().toISOString(),
      // Additional fields
      template_id: updates.templateId,
      currency: updates.currency ? JSON.stringify(updates.currency) : undefined,
      show_shipping: updates.showShipping,
      show_discount: updates.showDiscount,
      show_tax_column: updates.showTaxColumn,
      show_signature: updates.showSignature,
      show_payment_details: updates.showPaymentDetails,
      shipping: updates.shipping ? JSON.stringify(updates.shipping) : undefined,
      taxes: updates.taxes ? JSON.stringify(updates.taxes) : undefined
    })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating invoice:', error);
    throw new Error(`Failed to update invoice: ${error.message}`);
  }
  
  // Handle line items if provided
  if (updates.items) {
    // Delete existing line items
    const { error: deleteError } = await supabase
      .from('invoice_line_items')
      .delete()
      .eq('invoice_id', id);
    
    if (deleteError) {
      console.error('Error deleting existing line items:', deleteError);
      throw new Error(`Failed to update line items: ${deleteError.message}`);
    }
    
    // Insert new line items
    if (updates.items.length > 0) {
      const lineItems = updates.items.map(item => ({
        invoice_id: id,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        tax_rate: item.taxRate,
        product_id: item.productId
      }));
      
      const { error: insertError } = await supabase
        .from('invoice_line_items')
        .insert(lineItems);
      
      if (insertError) {
        console.error('Error inserting new line items:', insertError);
        throw new Error(`Failed to update line items: ${insertError.message}`);
      }
    }
  }
};

export const deleteInvoice = async (id: string): Promise<void> => {
  // Line items will be deleted automatically due to CASCADE constraint
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting invoice:', error);
    throw new Error(`Failed to delete invoice: ${error.message}`);
  }
};
