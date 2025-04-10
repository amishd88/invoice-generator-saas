import React, { useState, useEffect } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useNotification } from '../../contexts/NotificationContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSalesReport, getDashboardMetrics, getDefaultDateRange, type DateRange } from '../../services/reporting/reportingService';

const LimitedAnalyticsDashboard: React.FC = () => {
  const { openUpgradeModal } = useSubscription();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [dateRange] = useState<DateRange>(getDefaultDateRange());

  // Function to load limited dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getDashboardMetrics({ dateRange });
        
        // Limit the data for free users
        const limitedData = {
          totalRevenue: data.totalRevenue,
          outstandingAmount: data.outstandingAmount,
          invoiceCount: data.invoiceCount,
          // Limit the revenue by month data to just 3 months
          revenueByMonth: data.revenueByMonth.slice(0, 3),
          // Only include total counts for invoice statuses
          invoicesByStatus: data.invoicesByStatus,
          // Don't include customer-specific or product-specific data
        };
        
        setMetrics(limitedData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [dateRange]);

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Handle upgrade click
  const handleUpgradeClick = () => {
    openUpgradeModal();
  };

  // If loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-500">Free Plan</span>
          <button 
            onClick={handleUpgradeClick}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-400 text-white rounded-md shadow hover:from-purple-700 hover:to-cyan-500 transition-colors"
          >
            Upgrade for Full Access
          </button>
        </div>
      </div>
      
      {metrics && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500">Outstanding Amount</h3>
              <p className="text-2xl font-bold">{formatCurrency(metrics.outstandingAmount)}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500">Total Invoices</h3>
              <p className="text-2xl font-bold">{metrics.invoiceCount}</p>
            </div>
          </div>
          
          {/* Revenue Trend Chart (Limited) */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Revenue Trend</h3>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">Last 3 Months</span>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={metrics.revenueByMonth}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value).replace('$', '')} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenue" 
                    stroke="#8b5cf6" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Free Tier Limitations Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Free Plan Limitations</h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>You're currently seeing a limited version of the analytics dashboard. Upgrade to Premium to unlock:</p>
                  <ul className="mt-2 ml-4 space-y-1 list-disc">
                    <li>Detailed sales reports with advanced filtering</li>
                    <li>Outstanding invoices tracker with aging analysis</li>
                    <li>Customer payment history tracking</li>
                    <li>Full reporting features with export capabilities</li>
                    <li>Advanced dashboard with more visualizations</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleUpgradeClick}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-cyan-400 hover:from-purple-700 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Upgrade to Premium
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Invoice Status Chart */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Invoices by Status</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.invoicesByStatus}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Count" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LimitedAnalyticsDashboard;
