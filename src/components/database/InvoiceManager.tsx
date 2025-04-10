import React, { useState, useEffect } from 'react'
import { Save, Trash2, Download, List, AlertTriangle } from 'lucide-react'
import { InvoiceState } from '../../types'
import { getInvoices, saveInvoice, deleteInvoice, getInvoiceById } from '../../services/invoiceService'

interface InvoiceManagerProps {
  currentInvoice: InvoiceState
  dispatch: React.Dispatch<any>
  validateInvoice?: () => boolean
}

const InvoiceManager: React.FC<InvoiceManagerProps> = ({ 
  currentInvoice, 
  dispatch,
  validateInvoice = () => true 
}) => {
  const [invoices, setInvoices] = useState<InvoiceState[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isListOpen, setIsListOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Load invoices on component mount
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setIsLoading(true)
        const data = await getInvoices()
        setInvoices(data)
      } catch (err) {
        setError('Failed to load invoices')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadInvoices()
  }, [])

  // Handle saving the current invoice
  const handleSaveInvoice = async () => {
    // First, validate the invoice
    if (!validateInvoice()) {
      setError('Please fix validation errors before saving')
      return
    }
    
    try {
      setIsSaving(true)
      setError(null)
      
      const savedInvoice = await saveInvoice(currentInvoice)
      
      // Update the current invoice with the ID if it was a new invoice
      dispatch({ type: 'LOAD_INVOICE', invoice: savedInvoice })
      
      // Refresh the invoice list
      const updatedInvoices = await getInvoices()
      setInvoices(updatedInvoices)
      
      setMessage('Invoice saved successfully')
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setError('Failed to save invoice')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle loading an invoice
  const handleLoadInvoice = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const invoice = await getInvoiceById(id)
      dispatch({ type: 'LOAD_INVOICE', invoice })
      
      setIsListOpen(false)
    } catch (err) {
      setError('Failed to load invoice')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle deleting an invoice
  const handleDeleteInvoice = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      await deleteInvoice(id)
      
      // Refresh the invoice list
      const updatedInvoices = await getInvoices()
      setInvoices(updatedInvoices)
      
      // If the deleted invoice is the current one, reset the form
      if (currentInvoice.id === id) {
        dispatch({ type: 'RESET_INVOICE' })
      }
      
      setMessage('Invoice deleted successfully')
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setError('Failed to delete invoice')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Check if invoice has at least one line item
  const hasLineItems = currentInvoice.items && currentInvoice.items.length > 0

  return (
    <div className="relative">
      {/* Control buttons */}
      <div className="flex justify-end space-x-2 mb-4">
        <button 
          className={`flex items-center px-3 py-2 rounded 
            ${hasLineItems 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          onClick={handleSaveInvoice}
          disabled={isSaving || !hasLineItems}
          title={!hasLineItems ? 'Add at least one line item before saving' : ''}
        >
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? 'Saving...' : 'Save Invoice'}
        </button>
        
        <button 
          className="flex items-center px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          onClick={() => setIsListOpen(!isListOpen)}
        >
          <List className="h-4 w-4 mr-1" />
          My Invoices
        </button>
      </div>

      {/* Invoice validation notice */}
      {!hasLineItems && (
        <div className="p-3 mb-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
          <span className="text-sm text-yellow-700">
            Add at least one line item to save this invoice.
          </span>
        </div>
      )}

      {/* Status messages */}
      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-800 rounded flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      
      {message && (
        <div className="p-3 mb-4 bg-green-100 text-green-800 rounded">
          {message}
        </div>
      )}

      {/* Invoice list dropdown */}
      {isListOpen && (
        <div className="absolute right-0 top-12 w-96 max-h-96 overflow-y-auto bg-white border rounded shadow-xl z-10">
          <div className="p-3 border-b font-medium">My Invoices</div>
          
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : invoices.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No saved invoices found</div>
          ) : (
            <ul>
              {invoices.map((invoice) => (
                <li key={invoice.id} className="border-b last:border-b-0">
                  <div className="p-3 hover:bg-gray-50 flex justify-between items-center">
                    <div 
                      className="flex-grow cursor-pointer"
                      onClick={() => handleLoadInvoice(invoice.id!)}
                    >
                      <div className="font-medium">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-600">
                        {invoice.client} • {invoice.dueDate}
                      </div>
                    </div>
                    <button
                      className="p-1 text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteInvoice(invoice.id!)}
                      aria-label={`Delete invoice ${invoice.invoiceNumber}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default InvoiceManager