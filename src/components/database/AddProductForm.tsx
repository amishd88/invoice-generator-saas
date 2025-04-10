import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { LineItem, Product } from '../../types'
import { createProduct } from '../../services/productService'

interface AddProductFormProps {
  lineItem?: LineItem
  onProductAdded: (product: Product) => void
  onClose: () => void
}

const AddProductForm: React.FC<AddProductFormProps> = ({ 
  lineItem, 
  onProductAdded, 
  onClose 
}) => {
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({
    name: lineItem?.description || '',
    description: '',
    defaultPrice: lineItem?.price || 0,
    defaultTaxRate: lineItem?.taxRate || 0
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'defaultPrice' || name === 'defaultTaxRate' 
        ? parseFloat(value) || 0 
        : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      setError('Product name is required')
      return
    }
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      const newProduct = await createProduct(formData)
      onProductAdded(newProduct)
      onClose()
    } catch (err) {
      setError('Failed to add product')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">Add New Product</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Product Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="defaultPrice" className="block text-sm font-medium text-gray-700">
                  Default Price
                </label>
                <input
                  type="number"
                  id="defaultPrice"
                  name="defaultPrice"
                  value={formData.defaultPrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <div>
                <label htmlFor="defaultTaxRate" className="block text-sm font-medium text-gray-700">
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  id="defaultTaxRate"
                  name="defaultTaxRate"
                  value={formData.defaultTaxRate}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
            
            {error && (
              <div className="text-sm text-red-600">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {isSubmitting ? 'Adding...' : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddProductForm
