import React, { useState, useEffect, useRef } from 'react'
import { Package, Search, Plus, Check } from 'lucide-react'
import { Product } from '../../types'
import { getProducts, searchProducts, createProduct } from '../../services/productService'

interface ProductSelectorProps {
  onSelectProduct: (product: Product) => void
  onAddItemFromProduct: (product: Product) => void
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ 
  onSelectProduct,
  onAddItemFromProduct
}) => {
  console.log('ProductSelector initialized with:', { onSelectProduct, onAddItemFromProduct })
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    defaultPrice: 0,
    defaultTaxRate: 10
  })
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('ProductSelector: Loading products...')
        const response = await getProducts()
        console.log('ProductSelector: Products loaded:', response.data.length)
        setProducts(response.data) // Extract the data array
      } catch (err) {
        console.error('ProductSelector: Failed to load products', err)
        setError('Failed to load products')
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle search input change
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.length > 2) {
      try {
        setIsLoading(true)
        const results = await searchProducts(query)
        setProducts(results.data) // Extract the data array
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    } else if (query.length === 0) {
      // Reset to full list if search is cleared
      try {
        setIsLoading(true)
        const response = await getProducts()
        setProducts(response.data) // Extract the data array
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Handle adding a product to the invoice
  const handleAddToInvoice = (product: Product) => {
    console.log('handleAddToInvoice called with product:', product)
    onAddItemFromProduct(product)
    setIsDropdownOpen(false)
  }

  // Handle creating a new product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      const createdProduct = await createProduct(newProduct)
      
      // Refresh product list
      const updatedProducts = await getProducts()
      setProducts(updatedProducts.data) // Extract the data array
      
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        defaultPrice: 0,
        defaultTaxRate: 10
      })
      
      setShowAddForm(false)
    } catch (err) {
      setError('Failed to create product')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'defaultPrice' || name === 'defaultTaxRate' 
        ? parseFloat(value) 
        : value
    }))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <Package className="h-4 w-4 mr-2" />
        Add Item from Catalog
      </button>

      {/* Product dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 w-96 bg-white border rounded shadow-xl z-10">
          <div className="p-3 border-b">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : products.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No products found</div>
            ) : (
              <ul>
                {products.map((product) => (
                  <li key={product.id} className="border-b last:border-b-0">
                    <button
                      type="button"
                      className="w-full text-left p-3 hover:bg-gray-50"
                      onClick={() => handleAddToInvoice(product)}
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">{product.name}</div>
                        <div className="font-medium">${product.defaultPrice.toFixed(2)}</div>
                      </div>
                      <div className="text-sm text-gray-600">{product.description}</div>
                      <div className="text-xs text-gray-500 mt-1">Tax Rate: {product.defaultTaxRate}%</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-3 border-t">
            {showAddForm ? (
              <form onSubmit={handleCreateProduct}>
                <h3 className="font-medium mb-2">Add New Product</h3>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-sm"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
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
                      className="w-full p-2 border rounded text-sm"
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
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded flex items-center"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductSelector
