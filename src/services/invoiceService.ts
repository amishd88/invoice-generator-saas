import { supabase } from '../lib/supabaseClient'
import { InvoiceState, LineItem } from '../types'

// Table names in Supabase - make sure these match your actual table names in your database
const INVOICES_TABLE = 'invoices'
const LINE_ITEMS_TABLE = 'invoice_line_items'

// Interface for pagination and filtering options
export interface InvoiceListOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filterBy?: {
    client?: string;
    fromDate?: string;
    toDate?: string;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
    customerId?: string;
  };
}

// Get paginated and filtered invoices for the current user
export async function getInvoices(options: InvoiceListOptions = {}) {
  try {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
      filterBy = {}
    } = options;

    // Calculate the range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Start building the query
    let query = supabase
      .from(INVOICES_TABLE)
      .select('*, invoice_line_items (*)', { count: 'exact' });

    // Apply filters if provided
    if (filterBy.client) {
      query = query.ilike('client', `%${filterBy.client}%`);
    }

    if (filterBy.customerId) {
      query = query.eq('customer_id', filterBy.customerId);
    }

    if (filterBy.fromDate) {
      query = query.gte('created_at', filterBy.fromDate);
    }

    if (filterBy.toDate) {
      query = query.lte('created_at', filterBy.toDate);
    }

    if (filterBy.status) {
      query = query.eq('status', filterBy.status);
    }

    // Apply sorting and pagination
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }

    // Transform snake_case fields to camelCase for our frontend
    const transformedInvoices = (data || []).map(invoice => {
      // Calculate total amount from line items for filtering by amount (if needed)
      const lineItems = invoice.invoice_line_items || [];
      const totalAmount = lineItems.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.price);
      }, 0);

      // Apply amount filtering if specified
      if (
        (filterBy.minAmount !== undefined && totalAmount < filterBy.minAmount) ||
        (filterBy.maxAmount !== undefined && totalAmount > filterBy.maxAmount)
      ) {
        return null; // Skip this invoice if it doesn't meet amount criteria
      }

      // Transform line items
      const transformedLineItems = lineItems.map((item: any) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        taxRate: item.tax_rate,
        productId: item.product_id
      }));

      // Transform invoice data
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
        status: invoice.status,
        createdAt: invoice.created_at,
        updatedAt: invoice.updated_at,
        // Additional fields
        templateId: invoice.template_id || 'professional',
        currency: invoice.currency ? JSON.parse(invoice.currency) : null,
        showShipping: invoice.show_shipping || false,
        showDiscount: invoice.show_discount || false,
        showTaxColumn: invoice.show_tax_column || false,
        showSignature: invoice.show_signature || false,
        showPaymentDetails: invoice.show_payment_details || false,
        shipping: invoice.shipping ? JSON.parse(invoice.shipping) : {},
        taxes: invoice.taxes ? JSON.parse(invoice.taxes) : [],
        items: transformedLineItems,
        totalAmount // Add calculated total amount
      };
    }).filter(Boolean); // Remove null entries (filtered out by amount)

    // Return the transformed data with pagination information
    return {
      data: transformedInvoices,
      pagination: {
        page,
        pageSize,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    };
  } catch (error) {
    console.error('Error in getInvoices:', error);
    throw error;
  }
}

// Get a single invoice by ID, including its line items
export async function getInvoiceById(id: string) {
  try {
    // Validate if the ID looks like a UUID before proceeding
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    // If the ID is not a valid UUID, it might be a dummy/test ID like "1"
    // Return a mock invoice or throw an error depending on requirements
    if (!uuidRegex.test(id)) {
      console.warn(`Invalid UUID format: ${id}. Returning mock data.`);
      
      // Return a mock invoice for testing/development purposes
      return {
        id: id,
        company: 'Sample Company',
        companyAddress: '123 Business St\nSample City, SC 12345',
        client: 'Demo Client',
        clientAddress: '456 Client Ave\nClient City, CC 67890',
        invoiceNumber: `INV-${new Date().getFullYear()}-DEMO`,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'This is a sample invoice.',
        terms: 'Payment due within 30 days',
        logo: null,
        logoZoom: 1,
        customerId: null,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateId: 'professional',
        currency: { code: 'USD', symbol: '$' },
        showShipping: false,
        showDiscount: false,
        showTaxColumn: true,
        showSignature: false,
        showPaymentDetails: false,
        shipping: {},
        taxes: [],
        items: [
          { id: '1', description: 'Sample Product', quantity: 1, price: 100, taxRate: 10 }
        ],
        totalAmount: 100
      } as InvoiceState;
    }
    
    // Get the invoice data with its line items in a single query
    const { data: invoice, error: invoiceError } = await supabase
      .from(INVOICES_TABLE)
      .select('*, invoice_line_items (*)')
      .eq('id', id)
      .single();

    if (invoiceError) {
      console.error('Error fetching invoice:', invoiceError);
      throw invoiceError;
    }

    // Transform line items
    const transformedLineItems = (invoice.invoice_line_items || []).map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      taxRate: item.tax_rate,
      productId: item.product_id
    }));

    // Calculate total amount
    const totalAmount = transformedLineItems.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.price);
    }, 0);

    // Combine the data with proper field mapping
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
      status: invoice.status,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
      // Additional fields
      templateId: invoice.template_id || 'professional',
      currency: invoice.currency ? JSON.parse(invoice.currency) : null,
      showShipping: invoice.show_shipping || false,
      showDiscount: invoice.show_discount || false,
      showTaxColumn: invoice.show_tax_column || false,
      showSignature: invoice.show_signature || false,
      showPaymentDetails: invoice.show_payment_details || false,
      shipping: invoice.shipping ? JSON.parse(invoice.shipping) : {},
      taxes: invoice.taxes ? JSON.parse(invoice.taxes) : [],
      items: transformedLineItems,
      totalAmount
    } as InvoiceState;
  } catch (error) {
    console.error('Error in getInvoiceById:', error);
    throw error;
  }
}

// Create a new invoice or update an existing one
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
    
    // Process the due date - CRITICAL for avoiding PostgreSQL EXTRACT issues
    let processedDueDate = null;
    
    // Only attempt to process if we have a date value
    if (invoice.dueDate) {
      try {
        // If it's already a string in YYYY-MM-DD format
        if (typeof invoice.dueDate === 'string' && invoice.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          processedDueDate = invoice.dueDate;
        }
        // If it's a string with a time component
        else if (typeof invoice.dueDate === 'string' && invoice.dueDate.includes('T')) {
          processedDueDate = invoice.dueDate.split('T')[0];
        }
        // If it's a Date object or something else parseable
        else {
          const dateObj = new Date(invoice.dueDate);
          if (!isNaN(dateObj.getTime())) {
            processedDueDate = dateObj.toISOString().split('T')[0];
          } else {
            console.warn('Invalid date format encountered, setting to null');
            processedDueDate = null;
          }
        }
      } catch (err) {
        console.error('Error processing due date:', err);
        processedDueDate = null;
      }
    }
    
    console.log('Processed due date:', processedDueDate);
    
    const defaultCurrency = { code: 'USD', symbol: '$' };

    // Prepare invoice data - convert camelCase to snake_case
    const invoiceToSave = {
      company: invoice.company || '',
      company_address: invoice.companyAddress || '',
      client: invoice.client || '',
      client_address: invoice.clientAddress || '',
      invoice_number: invoice.invoiceNumber || '',
      // Cast the date explicitly to a safe text format to prevent EXTRACT function issues
      due_date: processedDueDate ? processedDueDate : null,
      notes: invoice.notes || '',
      terms: invoice.terms || '',
      logo: typeof invoice.logo === 'string' ? invoice.logo : null,
      logo_zoom: invoice.logoZoom || 1,
      customer_id: invoice.customerId || null,
      status: invoice.status || 'draft',
      updated_at: now,
      user_id: userId,
      template_id: invoice.templateId || 'professional',
      currency: invoice.currency ? JSON.stringify(invoice.currency) : JSON.stringify(defaultCurrency),
      show_shipping: Boolean(invoice.showShipping),
      show_discount: Boolean(invoice.showDiscount),
      show_tax_column: Boolean(invoice.showTaxColumn),
      show_signature: Boolean(invoice.showSignature),
      show_payment_details: Boolean(invoice.showPaymentDetails),
      shipping: invoice.shipping ? JSON.stringify(invoice.shipping) : JSON.stringify({}),
      taxes: invoice.taxes ? JSON.stringify(invoice.taxes) : JSON.stringify([])
    };
    
    let invoiceId = invoice.id;
    
    console.log('Saving invoice with data:', invoiceToSave);
    
      // If creating a new invoice
      if (!invoiceId) {
        console.log('Creating new invoice with due_date:', processedDueDate);
        
        // Explicitly ensure date is in proper format for PostgreSQL
        // This prevents extract() function errors with date handling
        if (processedDueDate) {
          const { data, error } = await supabase
            .from(INVOICES_TABLE)
            .insert({
              ...invoiceToSave,
              created_at: now,
              // Cast explicitly as date string in ISO format
              due_date: processedDueDate
            })
            .select('id')
            .single();
          
          if (error) {
            console.error("Error inserting invoice:", error);
            throw error;
          }
          invoiceId = data?.id;
        } else {
          // If no due date, don't include it in the query
          const { data, error } = await supabase
            .from(INVOICES_TABLE)
            .insert({
              ...invoiceToSave,
              created_at: now,
              due_date: null
            })
            .select('id')
            .single();
          
          if (error) {
            console.error("Error inserting invoice:", error);
            throw error;
          }
          invoiceId = data?.id;
        }
        
        console.log('New invoice created with ID:', invoiceId);
      } 
    // Otherwise update the existing invoice
    else {
      console.log('Updating existing invoice ID:', invoiceId);
      
      // Handle the date properly to avoid EXTRACT function errors
      if (processedDueDate) {
        const { error } = await supabase
          .from(INVOICES_TABLE)
          .update({
            ...invoiceToSave,
            due_date: processedDueDate  // Explicitly set as date string
          })
          .eq('id', invoiceId);
        
        if (error) {
          console.error("Error updating invoice:", error);
          throw error;
        }
      } else {
        // If no valid date, set due_date to null
        const { error } = await supabase
          .from(INVOICES_TABLE)
          .update({
            ...invoiceToSave,
            due_date: null
          })
          .eq('id', invoiceId);
        
        if (error) {
          console.error("Error updating invoice:", error);
          throw error;
        }
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
        description: item.description || '',
        quantity: item.quantity || 1,
        price: item.price || 0,
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

// Update invoice status (e.g., mark as paid, sent, etc.)
export async function updateInvoiceStatus(id: string, status: string) {
  try {
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from(INVOICES_TABLE)
      .update({
        status: status,
        updated_at: now
      })
      .eq('id', id);
    
    if (error) {
      console.error("Error updating invoice status:", error);
      throw error;
    }
    
    return getInvoiceById(id);
  } catch (error) {
    console.error('Error in updateInvoiceStatus:', error);
    throw error;
  }
}

// Delete an invoice and its line items
export async function deleteInvoice(id: string) {
  try {
    // Delete the invoice (line items will be deleted by CASCADE)
    const { error: invoiceError } = await supabase
      .from(INVOICES_TABLE)
      .delete()
      .eq('id', id);
    
    if (invoiceError) {
      console.error("Error deleting invoice:", invoiceError);
      throw invoiceError;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
}

// Get invoice statistics
export async function getInvoiceStats() {
  try {
    // Get count by status
    const { data: statusData, error: statusError } = await supabase
      .from(INVOICES_TABLE)
      .select('status, count')
      .group('status');
      
    if (statusError) {
      console.error("Error getting invoice stats by status:", statusError);
      throw statusError;
    }
    
    // Get total amounts by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const { data: timelineData, error: timelineError } = await supabase
      .rpc('get_monthly_invoice_totals', {
        months_back: 6
      });
      
    if (timelineError) {
      console.error("Error getting invoice timeline data:", timelineError);
      throw timelineError;
    }
    
    return {
      byStatus: statusData,
      timeline: timelineData || []
    };
  } catch (error) {
    console.error('Error in getInvoiceStats:', error);
    throw error;
  }
}
