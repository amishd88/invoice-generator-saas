import { supabase } from '../lib/supabase'
import { Product } from '../types'

// Table name in Supabase
const PRODUCTS_TABLE = 'products'

// Interface for pagination and filtering options
export interface ProductListOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filterBy?: {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    taxRate?: number;
  };
}

// Get paginated and filtered products
export async function getProducts(options: ProductListOptions = {}) {
  try {
    console.log('productService: getProducts called with options:', options);
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
      .from(PRODUCTS_TABLE)
      .select('*', { count: 'exact' });

    // Apply filters if provided
    if (filterBy.name) {
      query = query.ilike('name', `%${filterBy.name}%`);
    }

    if (filterBy.minPrice !== undefined) {
      query = query.gte('default_price', filterBy.minPrice);
    }

    if (filterBy.maxPrice !== undefined) {
      query = query.lte('default_price', filterBy.maxPrice);
    }

    if (filterBy.taxRate !== undefined) {
      query = query.eq('default_tax_rate', filterBy.taxRate);
    }

    // Apply sorting and pagination
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    console.log('productService: fetched products:', data?.length || 0, 'of', count || 0, 'total');
    
    // Transform data to match our TypeScript model
    const transformedProducts = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      defaultPrice: item.default_price,
      defaultTaxRate: item.default_tax_rate,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) as Product[];

    // Return the transformed data with pagination information
    return {
      data: transformedProducts,
      pagination: {
        page,
        pageSize,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    };
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw error;
  }
}

// Get a single product by ID
export async function getProductById(id: string) {
  try {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    if (!data) return null;

    // Transform data to match our TypeScript model
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      defaultPrice: data.default_price,
      defaultTaxRate: data.default_tax_rate,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Product;
  } catch (error) {
    console.error('Error in getProductById:', error);
    throw error;
  }
}

// Create a new product
export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    // Get the current user's ID
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    const now = new Date().toISOString();
    
    console.log('Creating product with data:', product);
    console.log('Current user ID:', userId);
    
    // Convert camelCase to snake_case for database
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .insert({
        name: product.name,
        description: product.description || '',
        default_price: product.defaultPrice,
        default_tax_rate: product.defaultTaxRate,
        created_at: now,
        updated_at: now,
        user_id: userId // Associate with the current user
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    console.log('Product created successfully:', data);
    
    // Transform data to match our TypeScript model
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      defaultPrice: data.default_price,
      defaultTaxRate: data.default_tax_rate,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Product;
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
}

// Update an existing product
export async function updateProduct(id: string, product: Partial<Product>) {
  try {
    const now = new Date().toISOString();
    
    // Convert camelCase to snake_case for database
    const updateData: any = { updated_at: now };
    if (product.name !== undefined) updateData.name = product.name;
    if (product.description !== undefined) updateData.description = product.description;
    if (product.defaultPrice !== undefined) updateData.default_price = product.defaultPrice;
    if (product.defaultTaxRate !== undefined) updateData.default_tax_rate = product.defaultTaxRate;
    
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    // Transform data to match our TypeScript model
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      defaultPrice: data.default_price,
      defaultTaxRate: data.default_tax_rate,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Product;
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
}

// Delete a product
export async function deleteProduct(id: string) {
  try {
    // Check if product is used in any invoice line items
    const { data: lineItems, error: checkError } = await supabase
      .from('invoice_line_items')
      .select('id')
      .eq('product_id', id)
      .limit(1);
    
    if (checkError) {
      console.error('Error checking product references:', checkError);
      throw checkError;
    }
    
    // If product is used in invoices, prevent deletion
    if (lineItems && lineItems.length > 0) {
      throw new Error('Cannot delete product that is used in invoices');
    }
    
    // Delete the product
    const { error } = await supabase
      .from(PRODUCTS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
}

// Search products by name or description
export async function searchProducts(query: string, options: ProductListOptions = {}) {
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
      .from(PRODUCTS_TABLE)
      .select('*', { count: 'exact' })
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) {
      console.error('Error searching products:', error);
      throw error;
    }

    // Transform data to match our TypeScript model
    const transformedProducts = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      defaultPrice: item.default_price,
      defaultTaxRate: item.default_tax_rate,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) as Product[];

    // Return the transformed data with pagination information
    return {
      data: transformedProducts,
      pagination: {
        page,
        pageSize,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    };
  } catch (error) {
    console.error('Error in searchProducts:', error);
    throw error;
  }
}

// Bulk import products from CSV or JSON data
export async function bulkImportProducts(products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]) {
  try {
    // Get the current user's ID
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    const now = new Date().toISOString();
    
    // Prepare data for insertion
    const productsToInsert = products.map(product => ({
      name: product.name,
      description: product.description || '',
      default_price: product.defaultPrice,
      default_tax_rate: product.defaultTaxRate,
      created_at: now,
      updated_at: now,
      user_id: userId
    }));
    
    // Insert in batches to avoid hitting limits
    const batchSize = 100;
    const results = [];
    
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from(PRODUCTS_TABLE)
        .insert(batch)
        .select('*');
      
      if (error) {
        console.error(`Error importing products batch ${i / batchSize + 1}:`, error);
        throw error;
      }
      
      results.push(...data);
    }
    
    console.log(`Successfully imported ${results.length} products`);
    
    // Return the number of imported products
    return {
      count: results.length,
      success: true
    };
  } catch (error) {
    console.error('Error in bulkImportProducts:', error);
    throw error;
  }
}

// Get product categories (using Supabase functions or custom queries if needed)
export async function getProductCategories() {
  try {
    // This is a placeholder for implementing product categories
    // If you have a separate categories table, you'd query that
    // Alternatively, you could extract categories from the products table
    
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .select('category')
      .not('category', 'is', null)
      .order('category')
      .distinct();
    
    if (error) {
      console.error('Error fetching product categories:', error);
      throw error;
    }
    
    return data.map(item => item.category);
  } catch (error) {
    console.error('Error in getProductCategories:', error);
    throw error;
  }
}

// Get product statistics
export async function getProductStats() {
  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from(PRODUCTS_TABLE)
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error getting product count:', countError);
      throw countError;
    }
    
    // Get recently added products
    const { data: recentProducts, error: recentError } = await supabase
      .from(PRODUCTS_TABLE)
      .select('id, name, default_price, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentError) {
      console.error('Error getting recent products:', recentError);
      throw recentError;
    }
    
    // Get price ranges
    const { data: priceStats, error: priceError } = await supabase
      .rpc('get_product_price_stats');
    
    if (priceError) {
      console.error('Error getting product price stats:', priceError);
      throw priceError;
    }
    
    // Transform recent products data
    const transformedRecent = (recentProducts || []).map(product => ({
      id: product.id,
      name: product.name,
      defaultPrice: product.default_price,
      createdAt: product.created_at
    }));
    
    return {
      totalCount: count || 0,
      recentProducts: transformedRecent,
      priceStats: priceStats && priceStats.length > 0 ? priceStats[0] : {
        avg_price: 0,
        min_price: 0,
        max_price: 0
      }
    };
  } catch (error) {
    console.error('Error in getProductStats:', error);
    throw error;
  }
}
