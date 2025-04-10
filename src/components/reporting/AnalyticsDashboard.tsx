import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';
import { handleApiError } from '../../utils/apiErrorHandler';
import { 
  getDashboardMetrics, 
  getDefaultDateRange, 
  type DateRange, 
  type DashboardMetrics
} from '../../services/reporting/reportingService';

const AnalyticsDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create default metrics with zero values to avoid null errors
      const defaultMetrics: DashboardMetrics = {
        totalRevenue: 0,
        outstandingAmount: 0,
        overdueAmount: 0,
        invoiceCount: 0,
        paidInvoiceCount: 0,
        overdueInvoiceCount: 0,
        topCustomers: [],
        topProducts: [],
        revenueByMonth: [],
        invoicesByStatus: [],
        agingData: [
          { agingBucket: 'current', amount: 0 },
          { agingBucket: '0-30', amount: 0 },
          { agingBucket: '31-60', amount: 0 },
          { agingBucket: '61-90', amount: 0 },
          { agingBucket: '90+', amount: 0 }
        ]
      };
      
      // Try to get data from the service
      try {
        const data = await getDashboardMetrics({ dateRange });
        setMetrics(data);
      } catch (serviceError) {
        // Handle the error using our error utility
        const formattedError = handleApiError(serviceError, 'Dashboard metrics', {
          showToast: true,
          logToConsole: true
        });
        
        setError(formattedError.message);
        
        // Fall back to using default metrics
        setMetrics(defaultMetrics);
      }
    } catch (err) {
      const formattedError = handleApiError(err, 'Dashboard loading');
      setError(formattedError.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Create empty placeholder metrics if there's no data
  const displayMetrics = metrics || {
    totalRevenue: 0,
    outstandingAmount: 0,
    overdueAmount: 0,
    invoiceCount: 0,
    paidInvoiceCount: 0,
    overdueInvoiceCount: 0,
    topCustomers: [],
    topProducts: [],
    revenueByMonth: [],
    invoicesByStatus: [],
    agingData: [
      { agingBucket: 'current', amount: 0 },
      { agingBucket: '0-30', amount: 0 },
      { agingBucket: '31-60', amount: 0 },
      { agingBucket: '61-90', amount: 0 },
      { agingBucket: '90+', amount: 0 }
    ]
  };

  // Render with LoadingState component
  return (
    <LoadingState isLoading={isLoading} loadingText="Loading dashboard data...">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
        
        {/* If there's an error, show the error state */}
        {error && (
          <ErrorState
            error={error}
            onRetry={loadDashboardData}
            title="Dashboard Error"
            className="mb-6"
          />
        )}
        
        {/* Show "No Data" message if no metrics data */}
        {!isLoading && !displayMetrics.totalRevenue && !displayMetrics.outstandingAmount && 
         !displayMetrics.invoiceCount && displayMetrics.topCustomers.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="text-center py-4">
              <p className="text-gray-600 mb-2">No data available yet. Create and send invoices to see analytics.</p>
              <Link to="/invoices/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                Create New Invoice
              </Link>
            </div>
          </div>
        )}
        
        {/* Display dashboard metrics if we have data */}
        {displayMetrics.invoiceCount > 0 && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm text-gray-500">Total Revenue</h3>
                <p className="text-2xl font-bold">{formatCurrency(displayMetrics.totalRevenue)}</p>
                <p className="text-sm text-gray-500">From {displayMetrics.paidInvoiceCount} paid invoices</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm text-gray-500">Outstanding Amount</h3>
                <p className="text-2xl font-bold">{formatCurrency(displayMetrics.outstandingAmount)}</p>
                <p className="text-sm text-gray-500">Across all unpaid invoices</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm text-gray-500">Overdue Amount</h3>
                <p className="text-2xl font-bold">{formatCurrency(displayMetrics.overdueAmount)}</p>
                <p className="text-sm text-gray-500">From {displayMetrics.overdueInvoiceCount} overdue invoices</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm text-gray-500">Total Invoices</h3>
                <p className="text-2xl font-bold">{displayMetrics.invoiceCount}</p>
                <p className="text-sm text-gray-500">In selected time period</p>
              </div>
            </div>
            
            {/* Revenue Trend Chart (simplified) */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
              <div className="h-80 flex items-center justify-center">
                <div className="text-gray-500">
                  {displayMetrics.revenueByMonth.length === 0 ? (
                    <p>No revenue data available for the selected time period.</p>
                  ) : (
                    <div>
                      <p>Revenue data by month:</p>
                      <ul className="list-disc list-inside">
                        {displayMetrics.revenueByMonth.map((item, index) => (
                          <li key={index}>{item.month}: {formatCurrency(item.revenue)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Invoice Status Chart (simplified) */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Invoices by Status</h3>
                <div className="h-60 flex items-center justify-center">
                  <div className="text-gray-500">
                    {displayMetrics.invoicesByStatus.length === 0 ? (
                      <p>No invoice status data available.</p>
                    ) : (
                      <div>
                        <ul className="list-disc list-inside">
                          {displayMetrics.invoicesByStatus.map((item, index) => (
                            <li key={index}>{item.status}: {item.count}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Aging Chart (simplified) */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Outstanding Invoices by Age</h3>
                <div className="h-60 flex items-center justify-center">
                  <div className="text-gray-500">
                    {displayMetrics.agingData.every(item => item.amount === 0) ? (
                      <p>No aging data available.</p>
                    ) : (
                      <div>
                        <ul className="list-disc list-inside">
                          {displayMetrics.agingData.map((item, index) => (
                            <li key={index}>{item.agingBucket}: {formatCurrency(item.amount)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Top Customers and Products */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
                {displayMetrics.topCustomers.length === 0 ? (
                  <p className="text-gray-500">No customer data available.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {displayMetrics.topCustomers.map((customer, index) => (
                      <li key={index} className="py-3 flex justify-between">
                        <span className="text-gray-800">{customer.customerName}</span>
                        <span className="text-gray-600 font-medium">{formatCurrency(customer.totalBilled)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Top Products</h3>
                {displayMetrics.topProducts.length === 0 ? (
                  <p className="text-gray-500">No product data available.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {displayMetrics.topProducts.map((product, index) => (
                      <li key={index} className="py-3 flex justify-between">
                        <span className="text-gray-800">{product.productName}</span>
                        <span className="text-gray-600 font-medium">{formatCurrency(product.totalRevenue)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </LoadingState>
  );
};

export default AnalyticsDashboard;
