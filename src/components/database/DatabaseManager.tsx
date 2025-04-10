import React, { useState } from 'react'
import { Database, Users, Package, FileText } from 'lucide-react'
import ProductCatalog from './ProductCatalog'
import CustomerManager from './CustomerManager'
import InvoiceManager from './InvoiceManager'
import { InvoiceState } from '../../types'

interface DatabaseManagerProps {
  currentInvoice: InvoiceState
  dispatch: React.Dispatch<any>
  validateInvoice?: () => boolean
}

const DatabaseManager: React.FC<DatabaseManagerProps> = ({ 
  currentInvoice, 
  dispatch,
  validateInvoice = () => true
}) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'customers' | 'products'>('invoices')

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`flex items-center px-4 py-3 text-sm font-medium ${
            activeTab === 'invoices'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('invoices')}
        >
          <FileText className="h-4 w-4 mr-2" />
          Invoices
        </button>
        
        <button
          className={`flex items-center px-4 py-3 text-sm font-medium ${
            activeTab === 'customers'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('customers')}
        >
          <Users className="h-4 w-4 mr-2" />
          Customers
        </button>
        
        <button
          className={`flex items-center px-4 py-3 text-sm font-medium ${
            activeTab === 'products'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('products')}
        >
          <Package className="h-4 w-4 mr-2" />
          Products
        </button>
      </div>
      
      {/* Tab content */}
      <div className="p-4">
        {activeTab === 'invoices' && (
          <InvoiceManager 
            currentInvoice={currentInvoice} 
            dispatch={dispatch}
            validateInvoice={validateInvoice}
          />
        )}
        
        {activeTab === 'customers' && (
          <CustomerManager />
        )}
        
        {activeTab === 'products' && (
          <ProductCatalog />
        )}
      </div>
    </div>
  )
}

export default DatabaseManager