import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getSalesReport,
  getDefaultDateRange,
  getMonthToDateRange,
  getLastMonthRange,
  type DateRange,
  type ReportFilter,
  type SalesReportItem,
  exportReport
} from '../../services/reporting/reportingService';

// Remove date-fns import and implement our own formatting functions
const SalesReport: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [dateRangeType, setDateRangeType] = useState<string>('last3Months');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [salesData, setSalesData] = useState<SalesReportItem[]>([]);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Function to load sales report data
  const loadSalesData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filter: ReportFilter = {
        dateRange,
        status: statusFilter.length > 0 ? statusFilter : undefined,
        sortBy,
        sortDirection
      };
      
      const data = await getSalesReport(filter);
      setSalesData(data);
    } catch (err) {
      console.error('Error loading sales data:', err);
      setError('Failed to load sales report data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to load sales data when filters change
  useEffect(() => {
    loadSalesData();
  }, [dateRange, statusFilter, sortBy, sortDirection]);

  // Handle date range change
  const handleDateRangeChange = (type: string) => {
    setDateRangeType(type);
    
    let newRange: DateRange;
    
    switch (type) {
      case 'monthToDate':
        newRange = getMonthToDateRange();
        break;
      case 'lastMonth':
        newRange = getLastMonthRange();
        break;
      case 'last3Months':
      default:
        newRange = getDefaultDateRange();
        break;
    }
    
    setDateRange(newRange);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(item => item !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
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
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Format date values using built-in JavaScript Date
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (err) {
      return date;
    }
  };

  // Handle export report
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const filter: ReportFilter = {
        dateRange,
        status: statusFilter.length > 0 ? statusFilter : undefined,
        sortBy,
        sortDirection
      };
      
      const result = await exportReport('sales', filter, exportFormat);
      console.log('Export successful:', result);
      
      // In a real application, we would trigger a download of the file here
      alert(`Report exported successfully as ${result}`);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export report. Please try again later.');
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate totals for summary
  const calculateTotals = () => {
    const totalInvoiced = salesData.reduce((sum, item) => sum + item.invoiceTotal, 0);
    const totalPaid = salesData.reduce((sum, item) => sum + item.totalPaid, 0);
    const totalOutstanding = salesData.reduce((sum, item) => sum + item.balanceDue, 0);
    
    return { totalInvoiced, totalPaid, totalOutstanding };
  };

  // Helper for sort icons
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // If loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  // Calculate totals for summary cards
  const totals = calculateTotals();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Sales Report</h1>
      
      {/* Report Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Date Range Controls */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Time Period</h2>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="dateRange"
                  checked={dateRangeType === 'monthToDate'}
                  onChange={() => handleDateRangeChange('monthToDate')}
                  className="form-radio h-5 w-5 text-purple-700"
                />
                <span className="ml-2">Month to Date</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="dateRange"
                  checked={dateRangeType === 'lastMonth'}
                  onChange={() => handleDateRangeChange('lastMonth')}
                  className="form-radio h-5 w-5 text-purple-700"
                />
                <span className="ml-2">Last Month</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="dateRange"
                  checked={dateRangeType === 'last3Months'}
                  onChange={() => handleDateRangeChange('last3Months')}
                  className="form-radio h-5 w-5 text-purple-700"
                />
                <span className="ml-2">Last 3 Months</span>
              </label>
            </div>
          </div>
          
          {/* Status Filter */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Invoice Status</h2>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={statusFilter.includes('draft')}
                  onChange={() => handleStatusFilterChange('draft')}
                  className="form-checkbox h-5 w-5 text-purple-700"
                />
                <span className="ml-2">Draft</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={statusFilter.includes('sent')}
                  onChange={() => handleStatusFilterChange('sent')}
                  className="form-checkbox h-5 w-5 text-purple-700"
                />
                <span className="ml-2">Sent</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={statusFilter.includes('paid')}
                  onChange={() => handleStatusFilterChange('paid')}
                  className="form-checkbox h-5 w-5 text-purple-700"
                />
                <span className="ml-2">Paid</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={statusFilter.includes('overdue')}
                  onChange={() => handleStatusFilterChange('overdue')}
                  className="form-checkbox h-5 w-5 text-purple-700"
                />
                <span className="ml-2">Overdue</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={statusFilter.includes('cancelled')}
                  onChange={() => handleStatusFilterChange('cancelled')}
                  className="form-checkbox h-5 w-5 text-purple-700"
                />
                <span className="ml-2">Cancelled</span>
              </label>
            </div>
          </div>
          
          {/* Export Controls */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Export Report</h2>
            <div className="flex flex-col gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="form-select mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-purple-700 focus:ring focus:ring-purple-700 focus:ring-opacity-50"
              >
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="mt-2 px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-opacity-50 disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : 'Export Report'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* No Data Message */}
      {salesData.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="text-center py-4">
            <p className="text-gray-600 mb-2">No sales data available yet. Create and send invoices to see sales reports.</p>
            <Link to="/invoices/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              Create New Invoice
            </Link>
          </div>
        </div>
      )}
      
      {/* Summary Cards */}
      {salesData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-500">Total Invoiced</h3>
            <p className="text-2xl font-bold">{formatCurrency(totals.totalInvoiced)}</p>
            <p className="text-sm text-gray-500">{salesData.length} invoices</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-500">Total Paid</h3>
            <p className="text-2xl font-bold">{formatCurrency(totals.totalPaid)}</p>
            <p className="text-sm text-gray-500">
              {salesData.filter(item => item.status === 'paid').length} paid invoices
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-500">Total Outstanding</h3>
            <p className="text-2xl font-bold">{formatCurrency(totals.totalOutstanding)}</p>
            <p className="text-sm text-gray-500">
              {salesData.filter(item => item.status !== 'paid' && item.status !== 'cancelled').length} unpaid invoices
            </p>
          </div>
        </div>
      )}
      
      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      {/* Sales Report Table */}
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
                  onClick={() => handleSortChange('client')}
                >
                  Client {getSortIcon('client')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('createdAt')}
                >
                  Created {getSortIcon('createdAt')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('dueDate')}
                >
                  Due Date {getSortIcon('dueDate')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('status')}
                >
                  Status {getSortIcon('status')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('invoiceTotal')}
                >
                  Total {getSortIcon('invoiceTotal')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('balanceDue')}
                >
                  Balance {getSortIcon('balanceDue')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No invoices found matching the current filters.
                  </td>
                </tr>
              ) : (
                salesData.map((invoice) => (
                  <tr key={invoice.invoiceId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.customerName || invoice.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                        ${invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' : ''}
                        ${invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                        ${invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : ''}
                        ${invoice.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(invoice.invoiceTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(invoice.balanceDue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination placeholder - would implement in a real application */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{salesData.length}</span> invoices
        </div>
        
        <div className="flex-1 flex justify-end">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              Previous
            </button>
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              1
            </button>
            <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
