import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { Product } from '../../types';
import { createProduct, getProductById, updateProduct } from '../../services/productService';

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const isEditMode = id !== undefined;

  // Form state
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    defaultPrice: 0,
    defaultTaxRate: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load product data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const loadProduct = async () => {
        try {
          setIsLoading(true);
          const data = await getProductById(id);
          if (data) {
            setProduct(data);
          } else {
            addNotification('Product not found', 'error');
            navigate('/products');
          }
        } catch (error) {
          console.error('Error loading product:', error);
          addNotification('Failed to load product', 'error');
        } finally {
          setIsLoading(false);
        }
      };

      loadProduct();
    }
  }, [id, isEditMode, navigate, addNotification]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ 
      ...prev, 
      [name]: name === 'defaultPrice' || name === 'defaultTaxRate' 
        ? parseFloat(value) || 0 
        : value 
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isEditMode && id) {
        await updateProduct(id, product);
        addNotification('Product updated successfully', 'success');
      } else {
        await createProduct(product as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>);
        addNotification('Product created successfully', 'success');
      }
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      addNotification('Failed to save product', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {isEditMode ? 'Edit Product' : 'Create New Product'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow overflow-hidden">
        {/* Product Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product/Service Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={product.name || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-700 focus:ring-purple-700"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={product.description || ''}
                onChange={handleChange}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-700 focus:ring-purple-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="defaultPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Default Price <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="defaultPrice"
                    name="defaultPrice"
                    value={product.defaultPrice || 0}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="block w-full pl-7 pr-12 border-gray-300 rounded-md shadow-sm focus:border-purple-700 focus:ring-purple-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="defaultTaxRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Default Tax Rate (%)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="defaultTaxRate"
                    name="defaultTaxRate"
                    value={product.defaultTaxRate || 0}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className="block w-full pr-12 border-gray-300 rounded-md shadow-sm focus:border-purple-700 focus:ring-purple-700"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
              isSaving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
