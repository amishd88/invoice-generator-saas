import React, { useState, useEffect, useRef } from 'react'
import { User, Search, Plus, Check } from 'lucide-react'
import { Customer } from '../../types'
import { getCustomers, searchCustomers, createCustomer } from '../../services/customerService'

interface CustomerSelectorProps {
  currentCustomer: { name: string; address: string }
  onSelectCustomer: (customer: Customer) => void
  onSaveCurrentAsCustomer: () => void
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({ 
  currentCustomer, 
  onSelectCustomer,
  onSaveCurrentAsCustomer
}) => {
  console.log('CustomerSelector initialized with:', { currentCustomer, onSelectCustomer, onSaveCurrentAsCustomer })
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load customers on component mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('CustomerSelector: Loading customers...')
        const response = await getCustomers()
        console.log('CustomerSelector: Customers loaded:', response.data.length)
        setCustomers(response.data) // Extract the data array
      } catch (err) {
        console.error('CustomerSelector: Failed to load customers', err)
        setError('Failed to load customers')
      } finally {
        setIsLoading(false)
      }
    }

    loadCustomers()
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
        const results = await searchCustomers(query)
        setCustomers(results.data) // Extract the data array
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    } else if (query.length === 0) {
      // Reset to full list if search is cleared
      try {
        setIsLoading(true)
        const response = await getCustomers()
        setCustomers(response.data) // Extract the data array
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Handle selecting a customer
  const handleSelectCustomer = (customer: Customer) => {
    console.log('handleSelectCustomer called with customer:', customer)
    onSelectCustomer(customer)
    setIsDropdownOpen(false)
    setSearchQuery('')
  }

  // Handle saving current customer info as a new customer
  const handleSaveAsNewCustomer = async () => {
    try {
      setIsLoading(true)
      const newCustomer = await createCustomer({
        name: currentCustomer.name,
        address: currentCustomer.address,
      })
      
      // Refresh customer list
      const updatedCustomers = await getCustomers()
      setCustomers(updatedCustomers.data) // Extract the data array
      
      // Notify parent component
      onSaveCurrentAsCustomer()
      
      setIsDropdownOpen(false)
    } catch (err) {
      setError('Failed to save customer')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center mb-2">
        <label className="block text-sm font-medium text-gray-700 mr-2">Client</label>
        <button
          type="button"
          className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 flex items-center"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <User className="h-3 w-3 mr-1" />
          Select Customer
        </button>
      </div>

      {/* Customer dropdown */}
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
                placeholder="Search customers..."
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
            ) : customers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No customers found</div>
            ) : (
              <ul>
                {customers.map((customer) => (
                  <li key={customer.id} className="border-b last:border-b-0">
                    <button
                      type="button"
                      className="w-full text-left p-3 hover:bg-gray-50 flex items-start"
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-600 whitespace-pre-line">{customer.address}</div>
                        {customer.email && (
                          <div className="text-sm text-gray-600">{customer.email}</div>
                        )}
                      </div>
                      <Check className="h-4 w-4 ml-auto mt-1 text-blue-500 opacity-0 group-hover:opacity-100" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-3 border-t">
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center"
              onClick={handleSaveAsNewCustomer}
            >
              <Plus className="h-4 w-4 mr-2" />
              Save current client as new customer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerSelector
