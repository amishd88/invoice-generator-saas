import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getCustomerPaymentHistory,
  getDefaultDateRange,
  type ReportFilter,
  type CustomerPaymentHistory as CustomerPaymentHistoryType
} from '../../services/reporting/reportingService';

const CustomerPaymentHistory: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<CustomerPaymentHistoryType[]>([]);
  const [sortBy, setSortBy] = useState<string>('totalBilled');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load data on component mount and when sort changes
  useEffect(() => {
    loadCustomerPaymentHistory();
  }, [sortBy, sortDirection]);

  const loadCustomerPaymentHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filter: ReportFilter = {
        dateRange: getDefaultDateRange(),
        sortBy,
        sortDirection
      };

      const data = await getCustomerPaymentHistory(filter);
      setCustomers(data);
    } catch (err) {
      console.error('Error loading customer payment history:', err);
      setError('Failed to load customer payment history. Please try again later.');
    } finally {
      setIsLoading(false);
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

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter customers by search query
  const filteredCustomers = searchQuery
    ? customers.filter(customer => 
        customer.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : customers;

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

  // Helper for sort icons
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Calculate average payment percentage
  const calculateAveragePaymentPercentage = (customer: CustomerPaymentHistoryType) => {
    if (customer.totalBilled === 0) return 0;
    return (customer.totalPaid / customer.totalBilled) * 100;
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
      <h1 className="text-2xl font-bold mb-6">Customer Payment History</h1>

      {/* No Data Message */}
      {customers.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="text-center py-4">
            <p className="text-gray-600 mb-2">No customer payment history available yet. Add customers and create invoices to see payment history.</p>
            <div className="flex justify-center space-x-4 mt-4">
              <Link to="/customers/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                Add New Customer
              </Link>
              <Link to="/invoices/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                Create New Invoice
              </Link>
            </div>
          </div>
        </div>
      )}

      {customers.length > 0 && (
        <>
          {/* Search Box */}
          <div className="bg-white rounded-lg shadow p-4 mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-700 focus:border-purple-700 sm:text-sm"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500">Total Customers</h3>
              <p className="text-2xl font-bold">{customers.length}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500">Total Billed</h3>
              <p className="text-2xl font-bold">
                {formatCurrency(customers.reduce((sum, customer) => sum + customer.totalBilled, 0))}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500">Total Paid</h3>
              <p className="text-2xl font-bold">
                {formatCurrency(customers.reduce((sum, customer) => sum + customer.totalPaid, 0))}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500">Outstanding</h3>
              <p className="text-2xl font-bold">
                {formatCurrency(customers.reduce((sum, customer) => sum + customer.totalOutstanding, 0))}
              </p>
            </div>
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
            onClick={loadCustomerPaymentHistory}
          >
            Retry
          </button>
        </div>
      )}

      {/* Customer Payment History Table - Only show if we have customers */}
      {customers.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('customerName')}
                  >
                    Customer {getSortIcon('customerName')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('totalInvoices')}
                  >
                    Total Invoices {getSortIcon('totalInvoices')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('paidInvoices')}
                  >
                    Paid Invoices {getSortIcon('paidInvoices')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('totalBilled')}
                  >
                    Total Billed {getSortIcon('totalBilled')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('totalPaid')}
                  >
                    Total Paid {getSortIcon('totalPaid')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('totalOutstanding')}
                  >
                    Outstanding {getSortIcon('totalOutstanding')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('avgDaysOverdue')}
                  >
                    Avg. Days Late {getSortIcon('avgDaysOverdue')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('latestInvoiceDate')}
                  >
                    Latest Invoice {getSortIcon('latestInvoiceDate')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      No customer payment history found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.customerId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        <Link to={`/customers/${customer.customerId}`}>{customer.customerName}</Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.totalInvoices}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.paidInvoices} 
                        ({customer.totalInvoices > 0 
                          ? `${(customer.paidInvoices / customer.totalInvoices * 100).toFixed(0)}%` 
                          : '0%'})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(customer.totalBilled)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(customer.totalPaid)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(customer.totalOutstanding)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.avgDaysOverdue.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(customer.latestInvoiceDate)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPaymentHistory;
