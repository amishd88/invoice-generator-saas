import { supabase } from '../lib/supabase'
import { Customer } from '../types'

// Table name in Supabase
const CUSTOMERS_TABLE = 'customers'

// Interface for pagination and filtering options
export interface CustomerListOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filterBy?: {
    name?: string;
    email?: string;
    phone?: string;
    vatNumber?: string;
    currency?: string;
  };
}

// Get paginated and filtered customers
export async function getCustomers(options: CustomerListOptions = {}) {
  try {
    console.log('customerService: getCustomers called with options:', options);
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      filterBy = {}
    } = options;

    // Calculate the range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Start building the query
    let query = supabase
      .from(CUSTOMERS_TABLE)
      .select('*', { count: 'exact' });

    // Apply filters if provided
    if (filterBy.name) {
      query = query.ilike('name', `%${filterBy.name}%`);
    }

    if (filterBy.email) {
      query = query.ilike('email', `%${filterBy.email}%`);
    }

    if (filterBy.phone) {
      query = query.ilike('phone', `%${filterBy.phone}%`);
    }

    if (filterBy.vatNumber) {
      query = query.ilike('vat_number', `%${filterBy.vatNumber}%`);
    }

    if (filterBy.currency) {
      query = query.eq('preferred_currency', filterBy.currency);
    }

    // Apply sorting and pagination
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }

    console.log('customerService: fetched customers:', data?.length || 0, 'of', count || 0, 'total');
    
    // Transform data to match our TypeScript model
    const transformedCustomers = (data || []).map(customer => ({
      id: customer.id,
      name: customer.name,
      address: customer.address,
      email: customer.email,
      phone: customer.phone,
      vatNumber: customer.vat_number,
      contactPerson: customer.contact_person,
      website: customer.website,
      preferredCurrency: customer.preferred_currency,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at
    })) as Customer[];

    // Return the transformed data with pagination information
    return {
      data: transformedCustomers,
      pagination: {
        page,
        pageSize,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    };
  } catch (error) {
    console.error('Error in getCustomers:', error);
    throw error;
  }
}

// Get a single customer by ID
export async function getCustomerById(id: string) {
  const { data, error } = await supabase
    .from(CUSTOMERS_TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
  
  if (!data) return null;

  // Transform data to match our TypeScript model
  return {
    id: data.id,
    name: data.name,
    address: data.address,
    email: data.email,
    phone: data.phone,
    vatNumber: data.vat_number,
    contactPerson: data.contact_person,
    website: data.website,
    preferredCurrency: data.preferred_currency,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  } as Customer;
}

// Create a new customer
export async function createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    // Get the current user's ID
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) {
      console.error("No authenticated user found");
      throw new Error("User not authenticated");
    }
    
    console.log("Creating customer with data:", customer);
    console.log("Current user ID:", userId);
    
    const now = new Date().toISOString();
    
    // Convert camelCase to snake_case and ensure all required fields are present
    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .insert({
        name: customer.name,
        address: customer.address || '', // Ensure address is never null
        email: customer.email || null,
        phone: customer.phone || null,
        vat_number: customer.vatNumber || null,
        contact_person: customer.contactPerson || null,
        website: customer.website || null,
        preferred_currency: customer.preferredCurrency || 'USD',
        created_at: now,
        updated_at: now,
        user_id: userId // Important: associate with current user
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      throw error;
    }

    console.log("Customer created successfully:", data);
    
    // Transform back to camelCase
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      email: data.email,
      phone: data.phone,
      vatNumber: data.vat_number,
      contactPerson: data.contact_person,
      website: data.website,
      preferredCurrency: data.preferred_currency,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Customer;
  } catch (error) {
    console.error('Error in createCustomer:', error);
    throw error;
  }
}

// Update an existing customer
export async function updateCustomer(id: string, customer: Partial<Customer>) {
  try {
    const now = new Date().toISOString();
    
    // Convert camelCase to snake_case for database
    const updateData: any = { updated_at: now };
    if (customer.name !== undefined) updateData.name = customer.name;
    if (customer.address !== undefined) updateData.address = customer.address || ''; // Ensure never null
    if (customer.email !== undefined) updateData.email = customer.email || null;
    if (customer.phone !== undefined) updateData.phone = customer.phone || null;
    if (customer.vatNumber !== undefined) updateData.vat_number = customer.vatNumber || null;
    if (customer.contactPerson !== undefined) updateData.contact_person = customer.contactPerson || null;
    if (customer.website !== undefined) updateData.website = customer.website || null;
    if (customer.preferredCurrency !== undefined) updateData.preferred_currency = customer.preferredCurrency || 'USD';
    
    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      throw error;
    }

    // Transform back to camelCase
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      email: data.email,
      phone: data.phone,
      vatNumber: data.vat_number,
      contactPerson: data.contact_person,
      website: data.website,
      preferredCurrency: data.preferred_currency,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Customer;
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    throw error;
  }
}

// Delete a customer
export async function deleteCustomer(id: string) {
  try {
    // Check if customer has any associated invoices
    const { data: invoices, error: checkError } = await supabase
      .from('invoices')
      .select('id')
      .eq('customer_id', id)
      .limit(1);
    
    if (checkError) {
      console.error('Error checking customer references:', checkError);
      throw checkError;
    }
    
    // If customer has invoices, prevent deletion
    if (invoices && invoices.length > 0) {
      throw new Error('Cannot delete customer with associated invoices');
    }
    
    // Delete the customer
    const { error } = await supabase
      .from(CUSTOMERS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    throw error;
  }
}

// Search customers by name, email, or contact person
export async function searchCustomers(query: string, options: CustomerListOptions = {}) {
  try {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    // Calculate the range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Search in multiple columns
    const { data, error, count } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('*', { count: 'exact' })
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,contact_person.ilike.%${query}%,phone.ilike.%${query}%`)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) {
      console.error('Error searching customers:', error);
      throw error;
    }

    // Transform data to match our TypeScript model
    const transformedCustomers = (data || []).map(customer => ({
      id: customer.id,
      name: customer.name,
      address: customer.address,
      email: customer.email,
      phone: customer.phone,
      vatNumber: customer.vat_number,
      contactPerson: customer.contact_person,
      website: customer.website,
      preferredCurrency: customer.preferred_currency,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at
    })) as Customer[];

    // Return the transformed data with pagination information
    return {
      data: transformedCustomers,
      pagination: {
        page,
        pageSize,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    };
  } catch (error) {
    console.error('Error in searchCustomers:', error);
    throw error;
  }
}

// Bulk import customers from CSV or JSON data
export async function bulkImportCustomers(customers: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>[]) {
  try {
    // Get the current user's ID
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    const now = new Date().toISOString();
    
    // Prepare data for insertion
    const customersToInsert = customers.map(customer => ({
      name: customer.name,
      address: customer.address || '',
      email: customer.email || null,
      phone: customer.phone || null,
      vat_number: customer.vatNumber || null,
      contact_person: customer.contactPerson || null,
      website: customer.website || null,
      preferred_currency: customer.preferredCurrency || 'USD',
      created_at: now,
      updated_at: now,
      user_id: userId
    }));
    
    // Insert in batches to avoid hitting limits
    const batchSize = 100;
    const results = [];
    
    for (let i = 0; i < customersToInsert.length; i += batchSize) {
      const batch = customersToInsert.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from(CUSTOMERS_TABLE)
        .insert(batch)
        .select('*');
      
      if (error) {
        console.error(`Error importing customers batch ${i / batchSize + 1}:`, error);
        throw error;
      }
      
      results.push(...data);
    }
    
    console.log(`Successfully imported ${results.length} customers`);
    
    // Return the number of imported customers
    return {
      count: results.length,
      success: true
    };
  } catch (error) {
    console.error('Error in bulkImportCustomers:', error);
    throw error;
  }
}

// Get customer statistics
export async function getCustomerStats() {
  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error getting customer count:', countError);
      throw countError;
    }
    
    // Get recently added customers
    const { data: recentCustomers, error: recentError } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentError) {
      console.error('Error getting recent customers:', recentError);
      throw recentError;
    }
    
    // Get customers by currency
    const { data: currencyData, error: currencyError } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('preferred_currency, count')
      .group('preferred_currency');
    
    if (currencyError) {
      console.error('Error getting customers by currency:', currencyError);
      throw currencyError;
    }
    
    // Transform recent customers data
    const transformedRecent = (recentCustomers || []).map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      createdAt: customer.created_at
    }));
    
    return {
      totalCount: count || 0,
      recentCustomers: transformedRecent,
      byCurrency: currencyData || []
    };
  } catch (error) {
    console.error('Error in getCustomerStats:', error);
    throw error;
  }
}
