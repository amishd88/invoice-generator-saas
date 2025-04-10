import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { Customer } from '../../types';
import { createCustomer, getCustomerById, updateCustomer } from '../../services/customerService';

const CustomerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const isEditMode = id !== undefined;

  // Form state
  const [customer, setCustomer] = useState<Partial<Customer>>({
    name: '',
    address: '',
    email: '',
    phone: '',
    vatNumber: '',
    contactPerson: '',
    website: '',
    preferredCurrency: 'USD'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load customer data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const loadCustomer = async () => {
        try {
          setIsLoading(true);
          const data = await getCustomerById(id);
          if (data) {
            setCustomer(data);
          } else {
            addNotification('Customer not found', 'error');
            navigate('/customers');
          }
        } catch (error) {
          console.error('Error loading customer:', error);
          addNotification('Error loading customer', 'error');
        } finally {
          setIsLoading(false);
        }
      };

      loadCustomer();
    }
  }, [id, isEditMode, navigate, addNotification]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isEditMode && id) {
        await updateCustomer(id, customer);
        addNotification('Customer updated successfully', 'success');
      } else {
        await createCustomer(customer as Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>);
        addNotification('Customer created successfully', 'success');
      }
      navigate('/customers');
    } catch (error) {
      console.error('Error saving customer:', error);
      addNotification('Error saving customer', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {isEditMode ? 'Edit Customer' : 'Create New Customer'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow overflow-hidden">
        {/* Customer Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={customer.name || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-700 focus:ring-purple-700"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={customer.email || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-700 focus:ring-purple-700"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={customer.phone || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-700 focus:ring-purple-700"
              />
            </div>

            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={customer.contactPerson || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-700 focus:ring-purple-700"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={customer.address || ''}
                onChange={handleChange}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-700 focus:ring-purple-700"
                required
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={customer.website || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-700 focus:ring-purple-700"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700 mb-1">
                VAT/Tax Number
              </label>
              <input
                type="text"
                id="vatNumber"
                name="vatNumber"
                value={customer.vatNumber || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-700 focus:ring-purple-700"
              />
            </div>

            <div>
              <label htmlFor="preferredCurrency" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Currency
              </label>
              <select
                id="preferredCurrency"
                name="preferredCurrency"
                value={customer.preferredCurrency || 'USD'}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-700 focus:ring-purple-700"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="CNY">CNY - Chinese Yuan</option>
                <option value="INR">INR - Indian Rupee</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
              isSaving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Update Customer' : 'Create Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
