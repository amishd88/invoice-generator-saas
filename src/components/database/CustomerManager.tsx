import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, User, Mail, Phone } from 'lucide-react'
import { Customer } from '../../types'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../services/customerService'

const CustomerManager: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null)
  
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    address: '',
    email: '',
    phone: ''
  })

  // Load customers on component mount
  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setIsLoading(true)
      const data = await getCustomers()
      setCustomers(data)
    } catch (err) {
      setError('Failed to load customers')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    customerId?: string
  ) => {
    const { name, value } = e.target
    
    // If customerId is provided, we're editing an existing customer
    if (customerId) {
      setCustomers(customers.map(customer => 
        customer.id === customerId
          ? { ...customer, [name]: value }
          : customer
      ))
    } 
    // Otherwise, updating the new customer form
    else {
      setNewCustomer(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Handle creating a new customer
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      await createCustomer(newCustomer)
      
      // Show success message
      setMessage('Customer created successfully')
      setTimeout(() => setMessage(null), 3000)
      
      // Reset form and state
      setNewCustomer({
        name: '',
        address: '',
        email: '',
        phone: ''
      })
      setIsAddFormOpen(false)
      
      // Refresh customer list
      await loadCustomers()
    } catch (err) {
      setError('Failed to create customer')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle updating an existing customer
  const handleUpdateCustomer = async (customerId: string) => {
    try {
      setIsLoading(true)
      
      // Find the customer to update
      const customerToUpdate = customers.find(c => c.id === customerId)
      if (!customerToUpdate) {
        throw new Error('Customer not found')
      }
      
      // Update the customer
      await updateCustomer(customerId, {
        name: customerToUpdate.name,
        address: customerToUpdate.address,
        email: customerToUpdate.email,
        phone: customerToUpdate.phone
      })
      
      // Show success message
      setMessage('Customer updated successfully')
      setTimeout(() => setMessage(null), 3000)
      
      // Exit edit mode
      setEditingCustomerId(null)
      
      // Refresh customer list
      await loadCustomers()
    } catch (err) {
      setError('Failed to update customer')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle deleting a customer
  const handleDeleteCustomer = async (customerId: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return
    }
    
    try {
      setIsLoading(true)
      await deleteCustomer(customerId)
      
      // Show success message
      setMessage('Customer deleted successfully')
      setTimeout(() => setMessage(null), 3000)
      
      // Refresh customer list
      await loadCustomers()
    } catch (err) {
      setError('Failed to delete customer')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle canceling edit mode
  const handleCancelEdit = async (customerId: string) => {
    // Reset the customer data to its original state
    await loadCustomers()
    setEditingCustomerId(null)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Customer Management</h2>
        <button
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setIsAddFormOpen(!isAddFormOpen)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Customer
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
      
      {/* Add customer form */}
      {isAddFormOpen && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h3 className="font-medium mb-3">Add New Customer</h3>
          <form onSubmit={handleCreateCustomer}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="h-4 w-4 inline mr-1" />
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newCustomer.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newCustomer.email || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={newCustomer.address}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={newCustomer.phone || ''}
                  onChange={handleInputChange}
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
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Customer'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Customers list */}
      {isLoading && !customers.length ? (
        <div className="text-center py-8 text-gray-500">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No customers found. Add your first customer to get started.
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
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingCustomerId === customer.id ? (
                      <input
                        type="text"
                        name="name"
                        value={customer.name}
                        onChange={(e) => handleInputChange(e, customer.id)}
                        required
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      <div className="font-medium">{customer.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingCustomerId === customer.id ? (
                      <textarea
                        name="address"
                        value={customer.address}
                        onChange={(e) => handleInputChange(e, customer.id)}
                        required
                        className="w-full p-1 border rounded"
                        rows={2}
                      />
                    ) : (
                      <div className="text-sm text-gray-900 whitespace-pre-line">{customer.address}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingCustomerId === customer.id ? (
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={customer.email || ''}
                            onChange={(e) => handleInputChange(e, customer.id)}
                            className="w-full p-1 border rounded"
                            placeholder="Email"
                          />
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-gray-400" />
                          <input
                            type="text"
                            name="phone"
                            value={customer.phone || ''}
                            onChange={(e) => handleInputChange(e, customer.id)}
                            className="w-full p-1 border rounded"
                            placeholder="Phone"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-900">
                        {customer.email && (
                          <div className="flex items-center mb-1">
                            <Mail className="h-4 w-4 mr-1 text-gray-400" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1 text-gray-400" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {editingCustomerId === customer.id ? (
                      <>
                        <button
                          className="text-green-600 hover:text-green-900 mr-3"
                          onClick={() => handleUpdateCustomer(customer.id)}
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => handleCancelEdit(customer.id)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          onClick={() => setEditingCustomerId(customer.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteCustomer(customer.id)}
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

export default CustomerManager