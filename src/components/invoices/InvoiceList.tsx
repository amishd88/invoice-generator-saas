import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useNotification } from '../../contexts/NotificationContext';
import { getInvoices, deleteInvoice } from '../../services/invoiceService';
import { InvoiceState } from '../../types';
import InvoiceStatusManager, { INVOICE_STATUSES } from './InvoiceStatusManager';

const InvoiceList: React.FC = () => {
  const { canCreateInvoice, openUpgradeModal } = useSubscription();
  const { showNotification } = useNotification();
  const [invoices, setInvoices] = useState<InvoiceState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await getInvoices();
      setInvoices(response.data); // Extract the data array
    } catch (error) {
      console.error('Failed to load invoices:', error);
      showNotification('error', 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setIsDeleting(id);
      try {
        await deleteInvoice(id);
        setInvoices(invoices.filter(invoice => invoice.id !== id));
        showNotification('success', 'Invoice deleted successfully');
      } catch (error) {
        console.error('Failed to delete invoice:', error);
        showNotification('error', 'Failed to delete invoice');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Calculate total amount for an invoice based on its items
  const calculateTotal = (invoice: InvoiceState) => {
    if (!invoice.items || invoice.items.length === 0) return 0;
    return invoice.items.reduce((total, item) => {
      const itemTotal = item.quantity * item.price;
      const taxAmount = (item.taxRate / 100) * itemTotal;
      return total + itemTotal + taxAmount;
    }, 0);
  };

  const formatCurrency = (amount: number, currencyCode = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  };

  // Get invoice status based on database value or due date
  const getInvoiceStatus = (invoice: InvoiceState) => {
    // If status is explicitly set in the database, use that
    if (invoice.status) return invoice.status;
    
    // Otherwise, determine based on due date if a sent invoice is overdue
    if (invoice.dueDate && invoice.status === INVOICE_STATUSES.SENT) {
      const now = new Date();
      const dueDate = new Date(invoice.dueDate);
      if (dueDate < now) {
        return INVOICE_STATUSES.OVERDUE;
      }
    }
    
    // Default to draft if no status is set
    return INVOICE_STATUSES.DRAFT;
  };

  // Add a handler for status updates
  const handleStatusUpdate = async (invoiceId: string, newStatus: string) => {
    // Update the local state after a status change
    setInvoices(prevInvoices => 
      prevInvoices.map(inv => 
        inv.id === invoiceId ? { ...inv, status: newStatus } : inv
      )
    );
    
    try {
      // Show success notification if function is available
      if (typeof showNotification === 'function') {
        showNotification('success', `Invoice status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link 
          to="/invoices/new"
          className={`px-4 py-2 rounded-md shadow-sm font-medium ${
            canCreateInvoice
              ? 'bg-purple-700 text-white hover:bg-purple-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={(e) => {
            if (!canCreateInvoice) {
              e.preventDefault();
              openUpgradeModal();
            }
          }}
        >
          Create New Invoice
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No invoices found. Create your first invoice to get started.</p>
            {canCreateInvoice ? (
              <Link 
                to="/invoices/new"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Create New Invoice
              </Link>
            ) : (
              <button
                onClick={openUpgradeModal}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Upgrade to Create Invoices
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => {
                  const status = getInvoiceStatus(invoice);
                  const total = calculateTotal(invoice);
                  const currencyCode = invoice.currency?.code || 'USD';
                  
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        <Link to={`/invoices/${invoice.id}`}>{invoice.invoiceNumber}</Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.client}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(total, currencyCode)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <InvoiceStatusManager
                          invoiceId={invoice.id}
                          currentStatus={status}
                          dueDate={invoice.dueDate}
                          onStatusUpdated={(newStatus) => handleStatusUpdate(invoice.id, newStatus)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/invoices/${invoice.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                          View
                        </Link>
                        {status !== INVOICE_STATUSES.PAID && status !== INVOICE_STATUSES.CANCELLED && (
                          <Link to={`/invoices/${invoice.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                            Edit
                          </Link>
                        )}
                        {status !== INVOICE_STATUSES.PAID && status !== INVOICE_STATUSES.CANCELLED && (
                          <button
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            disabled={isDeleting === invoice.id}
                            onClick={() => handleDeleteInvoice(invoice.id)}
                          >
                            {isDeleting === invoice.id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;
