import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getOutstandingInvoices,
  getDefaultDateRange,
  type DateRange,
  type ReportFilter,
  type OutstandingInvoiceItem
} from '../../services/reporting/reportingService';
import { updateInvoiceStatus } from '../../services/invoiceService';
import { INVOICE_STATUSES } from '../invoices/InvoiceStatusManager';
import { useNotification } from '../../contexts/NotificationContext';

const OutstandingInvoicesReport: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<OutstandingInvoiceItem[]>([]);
  const [sortBy, setSortBy] = useState<string>('daysOverdue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedAging, setSelectedAging] = useState<string[]>([]);
  const [processingInvoice, setProcessingInvoice] = useState<string | null>(null);
  const { showNotification } = useNotification();

  // Load data on component mount and when sort changes
  useEffect(() => {
    loadOutstandingInvoices();
  }, [sortBy, sortDirection, selectedAging]);

  const loadOutstandingInvoices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filter: ReportFilter = {
        dateRange: getDefaultDateRange(),
        sortBy,
        sortDirection
      };

      const data = await getOutstandingInvoices(filter);
      
      // Apply aging filter if selected
      const filteredData = selectedAging.length > 0
        ? data.filter(invoice => selectedAging.includes(invoice.agingBucket))
        : data;
        
      setInvoices(filteredData);
    } catch (err) {
      console.error('Error loading outstanding invoices:', err);
      setError('Failed to load outstanding invoices. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle aging bucket filter
  const toggleAgingFilter = (bucket: string) => {
    if (selectedAging.includes(bucket)) {
      setSelectedAging(selectedAging.filter(b => b !== bucket));
    } else {
      setSelectedAging([...selectedAging, bucket]);
    }
  };

  // Handle sort change
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date values
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Handler for marking an invoice as paid
  const handleMarkPaid = async (invoiceId: string) => {
    setProcessingInvoice(invoiceId);
    setError(null);
    
    try {
      await updateInvoiceStatus(invoiceId, INVOICE_STATUSES.PAID);
      // Remove the invoice from the list
      setInvoices(invoices.filter(inv => inv.invoiceId !== invoiceId));
      
      // Show success notification if function is available
      if (typeof showNotification === 'function') {
        showNotification('success', 'Invoice marked as paid');
      }
    } catch (err) {
      console.error('Error marking invoice as paid:', err);
      setError('Failed to update invoice status. Please try again.');
    } finally {
      setProcessingInvoice(null);
    }
  };

  // Helper for sort icons
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Calculate totals
  const calculateTotal = () => {
    return invoices.reduce((sum, invoice) => sum + invoice.invoiceTotal, 0);
  };

  // Group invoices by aging bucket for summary
  const getAgingSummary = () => {
    const summary: { [key: string]: { count: number, total: number } } = {};
    
    invoices.forEach(invoice => {
      if (!summary[invoice.agingBucket]) {
        summary[invoice.agingBucket] = { count: 0, total: 0 };
      }
      summary[invoice.agingBucket].count++;
      summary[invoice.agingBucket].total += invoice.invoiceTotal;
    });
    
    return summary;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  const agingSummary = getAgingSummary();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Outstanding Invoices</h1>

      {/* No Data Message */}
      {invoices.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="text-center py-4">
            <p className="text-gray-600 mb-2">No outstanding invoices found. When you have unpaid invoices, they will appear here.</p>
            <Link to="/invoices/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              Create New Invoice
            </Link>
          </div>
        </div>
      )}

      {invoices.length > 0 && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-3">Filter by Aging</h2>
            <div className="flex flex-wrap gap-3">
              <button
                className={`px-3 py-1 rounded ${
                  selectedAging.length === 0
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setSelectedAging([])}
              >
                All
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  selectedAging.includes('current')
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => toggleAgingFilter('current')}
              >
                Current
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  selectedAging.includes('0-30')
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => toggleAgingFilter('0-30')}
              >
                1-30 Days
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  selectedAging.includes('31-60')
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => toggleAgingFilter('31-60')}
              >
                31-60 Days
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  selectedAging.includes('61-90')
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => toggleAgingFilter('61-90')}
              >
                61-90 Days
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  selectedAging.includes('90+')
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => toggleAgingFilter('90+')}
              >
                90+ Days
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500">Total Outstanding</h3>
              <p className="text-2xl font-bold">{formatCurrency(calculateTotal())}</p>
              <p className="text-sm text-gray-500">{invoices.length} invoices</p>
            </div>
            
            {Object.entries(agingSummary).map(([bucket, data], index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm text-gray-500">{bucket === 'current' ? 'Current' : `${bucket} Days`}</h3>
                <p className="text-2xl font-bold">{formatCurrency(data.total)}</p>
                <p className="text-sm text-gray-500">{data.count} invoices</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={loadOutstandingInvoices}
          >
            Retry
          </button>
        </div>
      )}

      {/* Outstanding Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('invoiceNumber')}
                >
                  Invoice # {getSortIcon('invoiceNumber')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('customerName')}
                >
                  Client {getSortIcon('customerName')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('dueDate')}
                >
                  Due Date {getSortIcon('dueDate')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('invoiceTotal')}
                >
                  Amount {getSortIcon('invoiceTotal')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('daysOverdue')}
                >
                  Days Overdue {getSortIcon('daysOverdue')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('agingBucket')}
                >
                  Aging {getSortIcon('agingBucket')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No outstanding invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.invoiceId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      <Link to={`/invoices/${invoice.invoiceId}`}>{invoice.invoiceNumber}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.customerName || invoice.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.invoiceTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.daysOverdue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${invoice.agingBucket === 'current' ? 'bg-green-100 text-green-800' : ''}
                        ${invoice.agingBucket === '0-30' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${invoice.agingBucket === '31-60' ? 'bg-orange-100 text-orange-800' : ''}
                        ${invoice.agingBucket === '61-90' ? 'bg-red-100 text-red-800' : ''}
                        ${invoice.agingBucket === '90+' ? 'bg-red-200 text-red-900' : ''}
                      `}>
                        {invoice.agingBucket === 'current' ? 'Current' : `${invoice.agingBucket} Days`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/invoices/${invoice.invoiceId}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                        View
                      </Link>
                      <button 
                        className="text-purple-600 hover:text-purple-900"
                        disabled={processingInvoice === invoice.invoiceId}
                        onClick={() => handleMarkPaid(invoice.invoiceId)}
                      >
                        {processingInvoice === invoice.invoiceId ? 'Processing...' : 'Mark Paid'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OutstandingInvoicesReport;
