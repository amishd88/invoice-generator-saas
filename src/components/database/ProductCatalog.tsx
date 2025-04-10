import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { Product } from '../../types'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService'

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    defaultPrice: 0,
    defaultTaxRate: 10
  })

  // Load products on component mount
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const data = await getProducts()
      setProducts(data)
    } catch (err) {
      setError('Failed to load products')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    productId?: string
  ) => {
    const { name, value } = e.target
    
    // If productId is provided, we're editing an existing product
    if (productId) {
      setProducts(products.map(product => 
        product.id === productId
          ? {
              ...product,
              [name]: name === 'defaultPrice' || name === 'defaultTaxRate'
                ? parseFloat(value)
                : value
            }
          : product
      ))
    } 
    // Otherwise, updating the new product form
    else {
      setNewProduct(prev => ({
        ...prev,
        [name]: name === 'defaultPrice' || name === 'defaultTaxRate'
          ? parseFloat(value)
          : value
      }))
    }
  }

  // Handle creating a new product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      await createProduct(newProduct)
      
      // Show success message
      setMessage('Product created successfully')
      setTimeout(() => setMessage(null), 3000)
      
      // Reset form and state
      setNewProduct({
        name: '',
        description: '',
        defaultPrice: 0,
        defaultTaxRate: 10
      })
      setIsAddFormOpen(false)
      
      // Refresh product list
      await loadProducts()
    } catch (err) {
      setError('Failed to create product')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle updating an existing product
  const handleUpdateProduct = async (productId: string) => {
    try {
      setIsLoading(true)
      
      // Find the product to update
      const productToUpdate = products.find(p => p.id === productId)
      if (!productToUpdate) {
        throw new Error('Product not found')
      }
      
      // Update the product
      await updateProduct(productId, {
        name: productToUpdate.name,
        description: productToUpdate.description,
        defaultPrice: productToUpdate.defaultPrice,
        defaultTaxRate: productToUpdate.defaultTaxRate
      })
      
      // Show success message
      setMessage('Product updated successfully')
      setTimeout(() => setMessage(null), 3000)
      
      // Exit edit mode
      setEditingProductId(null)
      
      // Refresh product list
      await loadProducts()
    } catch (err) {
      setError('Failed to update product')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle deleting a product
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }
    
    try {
      setIsLoading(true)
      await deleteProduct(productId)
      
      // Show success message
      setMessage('Product deleted successfully')
      setTimeout(() => setMessage(null), 3000)
      
      // Refresh product list
      await loadProducts()
    } catch (err) {
      setError('Failed to delete product')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle canceling edit mode
  const handleCancelEdit = async (productId: string) => {
    // Reset the product data to its original state
    await loadProducts()
    setEditingProductId(null)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Product Catalog</h2>
        <button
          className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => setIsAddFormOpen(!isAddFormOpen)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Product
        </button>
      </div>
      
      {/* Status messages */}
      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
      
      {message && (
        <div className="p-3 mb-4 bg-green-100 text-green-800 rounded">
          {message}
        </div>
      )}
      
      {/* Add product form */}
      {isAddFormOpen && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h3 className="font-medium mb-3">Add New Product</h3>
          <form onSubmit={handleCreateProduct}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows={1}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  name="defaultPrice"
                  value={newProduct.defaultPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  name="defaultTaxRate"
                  value={newProduct.defaultTaxRate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-3 py-2 border text-gray-700 rounded hover:bg-gray-100"
                onClick={() => setIsAddFormOpen(false)}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Products list */}
      {isLoading && !products.length ? (
        <div className="text-center py-8 text-gray-500">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No products found. Add your first product to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingProductId === product.id ? (
                      <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={(e) => handleInputChange(e, product.id)}
                        required
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      <div className="font-medium">{product.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingProductId === product.id ? (
                      <textarea
                        name="description"
                        value={product.description}
                        onChange={(e) => handleInputChange(e, product.id)}
                        className="w-full p-1 border rounded"
                        rows={1}
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{product.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingProductId === product.id ? (
                      <input
                        type="number"
                        name="defaultPrice"
                        value={product.defaultPrice}
                        onChange={(e) => handleInputChange(e, product.id)}
                        min="0"
                        step="0.01"
                        required
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">${product.defaultPrice.toFixed(2)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingProductId === product.id ? (
                      <input
                        type="number"
                        name="defaultTaxRate"
                        value={product.defaultTaxRate}
                        onChange={(e) => handleInputChange(e, product.id)}
                        min="0"
                        step="0.1"
                        required
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{product.defaultTaxRate}%</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {editingProductId === product.id ? (
                      <>
                        <button
                          className="text-green-600 hover:text-green-900 mr-3"
                          onClick={() => handleUpdateProduct(product.id)}
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => handleCancelEdit(product.id)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          onClick={() => setEditingProductId(product.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ProductCatalog