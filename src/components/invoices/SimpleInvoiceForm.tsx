import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { saveInvoice } from '../../services/invoiceService';

// Simple invoice form that focuses on fixing the date handling issues
const SimpleInvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  
  // Create a simple invoice with just the essential fields
  const [invoice, setInvoice] = useState({
    id: '',
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    company: 'My Company',
    companyAddress: '123 Business St',
    client: 'Client Name',
    clientAddress: 'Client Address',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now in YYYY-MM-DD format
    items: [{ id: '1', description: 'Item 1', quantity: 1, price: 100, taxRate: 0 }],
    currency: { code: 'USD', symbol: '$' }
  });
  
  // Handle changes to form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoice(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Make a copy of the invoice data
      const formData = { ...invoice };
      
      // Process the due date to ensure proper PostgreSQL EXTRACT format
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
        }
      }
      
      console.log('Submitting with due date:', formData.dueDate);
      
      // Save the invoice
      await saveInvoice(formData);
      addNotification('Invoice created successfully', 'success');
      navigate('/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      addNotification('Failed to save invoice', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Simple Invoice Form</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Invoice Number
          </label>
          <input
            type="text"
            id="invoiceNumber"
            name="invoiceNumber"
            value={invoice.invoiceNumber}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={typeof invoice.dueDate === 'string' ? invoice.dueDate : ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={invoice.company}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
            Client Name
          </label>
          <input
            type="text"
            id="client"
            name="client"
            value={invoice.client}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
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
            {isSaving ? 'Saving...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimpleInvoiceForm;