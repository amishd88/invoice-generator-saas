import { supabase } from '../../lib/supabaseClient';
import { Product } from '../../types';

export const getAllProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching products:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
  
  // Transform data to match our TypeScript model
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    defaultPrice: item.default_price,
    defaultTaxRate: item.default_tax_rate,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    throw new Error(`Failed to fetch product: ${error.message}`);
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
  };
};

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  try {
    // Get the current user's ID
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    console.log('Creating product with data:', product);
    console.log('Current user ID:', userId);
    
    // Create the product with user_id field
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: product.name,
        description: product.description || '',
        default_price: product.defaultPrice,
        default_tax_rate: product.defaultTaxRate,
        user_id: userId // Important: associate with current user
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
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
    };
  } catch (error) {
    console.error('Product creation failed with exception:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  const updateData: any = {};
  
  // Only include fields that are provided in the updates
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.defaultPrice !== undefined) updateData.default_price = updates.defaultPrice;
  if (updates.defaultTaxRate !== undefined) updateData.default_tax_rate = updates.defaultTaxRate;
  
  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating product:', error);
    throw new Error(`Failed to update product: ${error.message}`);
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
  };
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting product:', error);
    throw new Error(`Failed to delete product: ${error.message}`);
  }
};
