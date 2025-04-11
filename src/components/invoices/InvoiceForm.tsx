import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import CustomerSelector from '../database/CustomerSelector';
import ProductSelector from '../database/ProductSelector';
import TemplateSelector from '../TemplateSelector';
import { Customer, Product, InvoiceState, LineItem } from '../../types';
import { getInvoiceById, saveInvoice } from '../../services/invoiceService';
import { invoiceTemplates } from '../../templates/invoiceTemplates';
import { INVOICE_STATUSES } from './InvoiceStatusManager';

// Invoice Form Component
const InvoiceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const isEditMode = id !== undefined;
  
  // Form state
  const [invoiceData, setInvoiceData] = useState<InvoiceState>({
    id: '',
    invoiceNumber: '',
    company: '',
    companyAddress: '',
    client: '',
    clientAddress: '',
    // Ensure date is in YYYY-MM-DD format without time component
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    terms: '',
    items: [{ id: '1', description: '', quantity: 1, price: 0, taxRate: 0 }],
    templateId: 'professional',
    logo: null,
    logoZoom: 1,
    customerId: null,
    currency: { code: 'USD', symbol: '$' },
    showShipping: false,
    showDiscount: false,
    showTaxColumn: false,
    showSignature: false,
    showPaymentDetails: false,
    shipping: {},
    taxes: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  // State for current customer (used by CustomerSelector)
  const [currentCustomer, setCurrentCustomer] = useState({
    name: invoiceData.client || '',
    address: invoiceData.clientAddress || ''
  });

  // Load invoice data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      setIsLoading(true);
      
      getInvoiceById(id)
        .then(data => {
          // Ensure due_date is in the right format
          if (data.dueDate) {
            try {
              // Make sure it's a simple YYYY-MM-DD string
              const formattedDate = typeof data.dueDate === 'string' 
                ? data.dueDate.includes('T') ? data.dueDate.split('T')[0] : data.dueDate 
                : new Date(data.dueDate).toISOString().split('T')[0];
              
              data.dueDate = formattedDate;
            } catch (error) {
              console.error('Error formatting loaded date:', error);
            }
          }
          
          setInvoiceData(data);
          setCurrentCustomer({
            name: data.client || '',
            address: data.clientAddress || ''
          });
          
          // Check if invoice is paid or cancelled (both are read-only)
          if (data.status === INVOICE_STATUSES.PAID || data.status === INVOICE_STATUSES.CANCELLED) {
            setIsReadOnly(true);
            const statusText = data.status === INVOICE_STATUSES.PAID ? 'paid' : 'cancelled';
            addNotification(`This invoice has been ${statusText} and cannot be edited.`, 'info');
          }
        })
        .catch(error => {
          console.error('Error loading invoice:', error);
          addNotification('Failed to load invoice data', 'error');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Generate a new invoice number for new invoices
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      }));
    }
  }, [isEditMode, id, addNotification]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Also update currentCustomer if client fields change
    if (name === 'client' || name === 'clientAddress') {
      setCurrentCustomer(prev => ({
        ...prev,
        name: name === 'client' ? value : prev.name,
        address: name === 'clientAddress' ? value : prev.address
      }));
    }
    
    setInvoiceData(prev => ({ ...prev, [name]: value }));
  };

  // Handle line item changes
  const handleItemChange = (itemId: string, field: string, value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, [field]: field === 'description' ? value : Number(value) }
          : item
      ),
    }));
  };

  // Add a new line item
  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { 
        id: Date.now().toString(), 
        description: '', 
        quantity: 1, 
        price: 0, 
        taxRate: 0 
      }],
    }));
  };

  // Remove a line item
  const removeItem = (itemId: string) => {
    if (invoiceData.items.length === 1) {
      addNotification('Cannot remove all line items', 'error');
      return;
    }
    
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  };

  // Calculate invoice totals
  const calculateSubtotal = () => {
    return (invoiceData.items || []).reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTax = () => {
    return (invoiceData.items || []).reduce((sum, item) => {
      const itemTotal = item.quantity * item.price;
      return sum + (itemTotal * (item.taxRate / 100));
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // Handler for customer selection
  const handleSelectCustomer = (customer: Customer) => {
    console.log('Selected customer:', customer);
    setInvoiceData(prev => ({
      ...prev,
      client: customer.name,
      clientAddress: customer.address,
      customerId: customer.id,
      currency: customer.preferredCurrency ? { code: customer.preferredCurrency, symbol: getCurrencySymbol(customer.preferredCurrency) } : prev.currency
    }));
    setCurrentCustomer({
      name: customer.name,
      address: customer.address
    });
    addNotification(`Customer ${customer.name} selected`, 'success');
  };

  // Get currency symbol based on currency code
  const getCurrencySymbol = (currencyCode: string) => {
    const symbols: {[key: string]: string} = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'INR': '₹',
      'CNY': '¥',
      'BRL': 'R$'
    };
    return symbols[currencyCode] || currencyCode;
  };

  // Handler for saving current customer
  const handleSaveCurrentAsCustomer = () => {
    addNotification('Customer saved successfully', 'success');
    // The actual saving is handled by the CustomerSelector component
  };

  // Handler for product selection and adding to invoice
  const handleAddProductToInvoice = (product: Product) => {
    // Create a new line item from product
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: product.name,
      quantity: 1,
      price: product.defaultPrice,
      taxRate: product.defaultTaxRate,
      productId: product.id
    };
    
    // Add to invoice items
    setInvoiceData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
    
    addNotification(`Added ${product.name} to invoice`, 'success');
  };

  // Handler for template selection
  const handleSelectTemplate = (templateId: string) => {
    setInvoiceData(prev => ({
      ...prev,
      templateId: templateId
    }));
    const selectedTemplateName = invoiceTemplates.find(t => t.id === templateId)?.name || templateId;
    addNotification(`Template changed to ${selectedTemplateName}`, 'success');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Make a copy of the invoice data and ensure proper date format
      const formData = { ...invoiceData };
      
      // Make sure due date is in proper format YYYY-MM-DD
      if (formData.dueDate) {
        // Ensure it's a string in YYYY-MM-DD format
        if (typeof formData.dueDate !== 'string' || !formData.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          try {
            const dateValue = typeof formData.dueDate === 'string' && formData.dueDate.includes('T')
              ? formData.dueDate.split('T')[0]  // Remove time component
              : new Date(formData.dueDate).toISOString().split('T')[0];
            
            formData.dueDate = dateValue;
          } catch (err) {
            console.error('Error formatting date:', err);
            formData.dueDate = new Date().toISOString().split('T')[0]; // Default to today
          }
        }
        
        // Double-check that the format is valid
        if (!formData.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          console.warn('Date still not in correct format, using today');
          formData.dueDate = new Date().toISOString().split('T')[0];
        }
      }
      
      console.log('Submitting with due date:', formData.dueDate);
      
      // Save the invoice using the service
      const savedInvoice = await saveInvoice(formData);
      addNotification(isEditMode ? 'Invoice updated successfully' : 'Invoice created successfully', 'success');
      navigate('/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      addNotification('Failed to save invoice', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    const currencyCode = invoiceData.currency?.code || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  // If the invoice is paid or cancelled, show a read-only view
  if (isReadOnly) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 font-lexend">
            Invoice ({invoiceData.status?.charAt(0).toUpperCase() + invoiceData.status?.slice(1)})
          </h1>
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-md">
            This invoice cannot be edited
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Invoice Details</h3>
              <p><strong>Invoice Number:</strong> {invoiceData.invoiceNumber}</p>
              <p><strong>Date:</strong> {invoiceData.dueDate}</p>
              <p><strong>Total:</strong> {formatCurrency(calculateTotal())}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Client Information</h3>
              <p><strong>Client:</strong> {invoiceData.client}</p>
              <p><strong>Address:</strong> {invoiceData.clientAddress}</p>
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-2">Items</h3>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax (%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(invoiceData.items || []).map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(item.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.taxRate}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(item.quantity * item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 max-w-md ml-auto">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Subtotal:</span>
                <span className="text-sm text-gray-900">{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Tax:</span>
                <span className="text-sm text-gray-900">{formatCurrency(calculateTax())}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-base font-medium text-gray-900">Total:</span>
                <span className="text-base font-medium text-gray-900">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/invoices')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Back to Invoices
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 font-lexend">
          {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
        </h1>
        
        <TemplateSelector 
          selectedTemplate={invoiceData.templateId || 'professional'}
          onSelectTemplate={handleSelectTemplate}
        />
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow overflow-hidden">
        {/* Invoice Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="invoiceNumber" className="form-label">
                Invoice Number
              </label>
              <input
                type="text"
                id="invoiceNumber"
                name="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dueDate" className="form-label">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={typeof invoiceData.dueDate === 'string' ? (invoiceData.dueDate.includes('T') ? invoiceData.dueDate.split('T')[0] : invoiceData.dueDate) : ''}
                  onChange={(e) => {
                    // Store date as simple string to avoid type issues
                    setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }));
                  }}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="currency" className="form-label">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={invoiceData.currency?.code || 'USD'}
                  onChange={(e) => {
                    const currencyCode = e.target.value;
                    setInvoiceData(prev => ({
                      ...prev,
                      currency: {
                        code: currencyCode,
                        symbol: getCurrencySymbol(currencyCode)
                      }
                    }));
                  }}
                  className="form-input"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CNY">CNY (¥)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Company and Client Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 font-lexend">Your Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="company" className="form-label">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={invoiceData.company}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="companyAddress" className="form-label">
                    Company Address
                  </label>
                  <textarea
                    id="companyAddress"
                    name="companyAddress"
                    value={invoiceData.companyAddress}
                    onChange={handleChange}
                    rows={3}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 font-lexend">Client Information</h3>
                <CustomerSelector 
                  currentCustomer={currentCustomer}
                  onSelectCustomer={handleSelectCustomer}
                  onSaveCurrentAsCustomer={handleSaveCurrentAsCustomer}
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="client" className="form-label">
                    Client Name
                  </label>
                  <input
                    type="text"
                    id="client"
                    name="client"
                    value={invoiceData.client}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="clientAddress" className="form-label">
                    Client Address
                  </label>
                  <textarea
                    id="clientAddress"
                    name="clientAddress"
                    value={invoiceData.clientAddress}
                    onChange={handleChange}
                    rows={3}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Invoice Items */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 font-lexend">Items</h3>
            <ProductSelector 
              onSelectProduct={() => {}}
              onAddItemFromProduct={handleAddProductToInvoice}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider font-lexend">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider font-lexend">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider font-lexend">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider font-lexend">
                    Tax (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider font-lexend">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider font-lexend">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(invoiceData.items || []).map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        className="form-input"
                        placeholder="Description"
                        required
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        className="form-input"
                        min="1"
                        step="1"
                        required
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                        className="form-input"
                        min="0"
                        step="0.01"
                        required
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={item.taxRate}
                        onChange={(e) => handleItemChange(item.id, 'taxRate', e.target.value)}
                        className="form-input"
                        min="0"
                        step="0.1"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.quantity * item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4">
            <button
              type="button"
              onClick={addItem}
              className="btn-secondary inline-flex items-center"
            >
              Add Item
            </button>
          </div>
          
          <div className="mt-6 max-w-md ml-auto">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-text-secondary">Subtotal:</span>
                <span className="text-sm text-text-primary">{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-text-secondary">Tax:</span>
                <span className="text-sm text-text-primary">{formatCurrency(calculateTax())}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-base font-medium text-text-primary">Total:</span>
                <span className="text-base font-medium text-text-primary">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notes and Terms */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="notes" className="form-label">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={invoiceData.notes}
                onChange={handleChange}
                rows={3}
                className="form-input"
                placeholder="Additional notes to client..."
              />
            </div>
            <div>
              <label htmlFor="terms" className="form-label">
                Terms
              </label>
              <textarea
                id="terms"
                name="terms"
                value={invoiceData.terms}
                onChange={handleChange}
                rows={3}
                className="form-input"
                placeholder="Payment terms..."
              />
            </div>
          </div>
        </div>
        
        {/* Submit Buttons */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="btn-secondary mr-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={`btn-primary ${
              isSaving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Update Invoice' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;