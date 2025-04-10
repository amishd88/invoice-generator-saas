import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { InvoiceState } from '../../types';
import { getInvoiceById, saveInvoice } from '../../services/invoiceService';

const InvoiceFormNew: React.FC = () => {
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
    currency: { code: 'USD', symbol: '
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Make a copy of the invoice data and ensure proper date format
      const formData = { ...invoiceData };
      
      // Explicitly format the date as YYYY-MM-DD to avoid PostgreSQL EXTRACT issues
      if (formData.dueDate) {
        // Handle different potential date formats
        if (typeof formData.dueDate === 'string') {
          if (formData.dueDate.includes('T')) {
            // Remove time component if present
            formData.dueDate = formData.dueDate.split('T')[0];
          } else if (!formData.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // If not in YYYY-MM-DD format, try to convert
            try {
              const dateObj = new Date(formData.dueDate);
              if (!isNaN(dateObj.getTime())) {
                formData.dueDate = dateObj.toISOString().split('T')[0];
              } else {
                console.warn('Invalid date:', formData.dueDate);
                formData.dueDate = new Date().toISOString().split('T')[0]; // Use today as fallback
              }
            } catch (err) {
              console.error('Error parsing date:', err);
              formData.dueDate = new Date().toISOString().split('T')[0]; // Use today as fallback
            }
          }
          // If already in YYYY-MM-DD format, keep as is
        } else if (formData.dueDate instanceof Date) {
          // Convert Date object to YYYY-MM-DD string
          formData.dueDate = formData.dueDate.toISOString().split('T')[0];
        } else {
          // Unknown type, use today as fallback
          console.warn('Unknown date type:', typeof formData.dueDate);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{isEditMode ? 'Edit Invoice' : 'Create New Invoice'}</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              id="invoiceNumber"
              value={invoiceData.invoiceNumber}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={typeof invoiceData.dueDate === 'string' ? (invoiceData.dueDate.includes('T') ? invoiceData.dueDate.split('T')[0] : invoiceData.dueDate) : ''}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-4 py-2 border border-gray-300 rounded-md mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Update Invoice' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceFormNew; },
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Make a copy of the invoice data and ensure proper date format
      const formData = { ...invoiceData };
      
      // Explicitly format the date as YYYY-MM-DD to avoid PostgreSQL EXTRACT issues
      if (formData.dueDate) {
        // Handle different potential date formats
        if (typeof formData.dueDate === 'string') {
          if (formData.dueDate.includes('T')) {
            // Remove time component if present
            formData.dueDate = formData.dueDate.split('T')[0];
          } else if (!formData.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // If not in YYYY-MM-DD format, try to convert
            try {
              const dateObj = new Date(formData.dueDate);
              if (!isNaN(dateObj.getTime())) {
                formData.dueDate = dateObj.toISOString().split('T')[0];
              } else {
                console.warn('Invalid date:', formData.dueDate);
                formData.dueDate = new Date().toISOString().split('T')[0]; // Use today as fallback
              }
            } catch (err) {
              console.error('Error parsing date:', err);
              formData.dueDate = new Date().toISOString().split('T')[0]; // Use today as fallback
            }
          }
          // If already in YYYY-MM-DD format, keep as is
        } else if (formData.dueDate instanceof Date) {
          // Convert Date object to YYYY-MM-DD string
          formData.dueDate = formData.dueDate.toISOString().split('T')[0];
        } else {
          // Unknown type, use today as fallback
          console.warn('Unknown date type:', typeof formData.dueDate);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{isEditMode ? 'Edit Invoice' : 'Create New Invoice'}</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              id="invoiceNumber"
              value={invoiceData.invoiceNumber}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={typeof invoiceData.dueDate === 'string' ? (invoiceData.dueDate.includes('T') ? invoiceData.dueDate.split('T')[0] : invoiceData.dueDate) : ''}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-4 py-2 border border-gray-300 rounded-md mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Update Invoice' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceFormNew;