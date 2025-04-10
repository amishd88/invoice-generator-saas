import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { plan, remainingFreeInvoices, canCreateInvoice, openUpgradeModal } = useSubscription();
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This would typically fetch data from your API
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // In a real implementation, this would be replaced with an actual API call
        // For now, we'll initialize with an empty array
        setRecentInvoices([]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 font-lexend">Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!</h1>
          <p className="text-text-secondary">
            Here's an overview of your invoicing activity
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link 
            to="/invoices/new"
            className={`btn-primary ${
              !canCreateInvoice
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'
                : ''
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
      </div>

      {plan === 'free' && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-primary-700">
                You have <span className="font-semibold">{remainingFreeInvoices}</span> free {remainingFreeInvoices === 1 ? 'invoice' : 'invoices'} remaining this month.
              </p>
              <p className="mt-3 text-sm md:mt-0 md:ml-6">
                <button
                  onClick={openUpgradeModal}
                  className="whitespace-nowrap font-medium text-primary-700 hover:text-primary-600 transition-colors duration-200"
                >
                  Upgrade to Premium <span aria-hidden="true">&rarr;</span>
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm text-text-secondary font-lexend">Outstanding</h3>
          <p className="text-2xl font-bold font-lexend text-primary-700">$0.00</p>
          <p className="text-sm text-text-secondary">
            0 invoices
          </p>
        </div>
        
        <div className="card">
          <h3 className="text-sm text-text-secondary font-lexend">Overdue</h3>
          <p className="text-2xl font-bold font-lexend text-primary-700">$0.00</p>
          <p className="text-sm text-text-secondary">
            0 invoices
          </p>
        </div>
        
        <div className="card">
          <h3 className="text-sm text-text-secondary font-lexend">Paid (Last 30 days)</h3>
          <p className="text-2xl font-bold font-lexend text-primary-700">$0.00</p>
          <p className="text-sm text-text-secondary">
            0 invoices
          </p>
        </div>
      </div>

      <div className="card mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium font-lexend text-text-primary">Recent Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-2 text-sm text-text-secondary">Loading invoices...</p>
            </div>
          ) : recentInvoices.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-text-secondary">No invoices yet. Create your first invoice to get started.</p>
              <Link 
                to="/invoices/new"
                className="btn-primary mt-4 inline-flex items-center"
              >
                Create New Invoice
              </Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider font-lexend">
                    Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider font-lexend">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider font-lexend">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider font-lexend">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider font-lexend">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider font-lexend">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                      <Link to={`/invoices/${invoice.id}`} className="hover:text-primary-800 transition-colors duration-200">{invoice.number}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                        ${invoice.status === 'sent' ? 'bg-primary-100 text-primary-800' : ''}
                        ${invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                        ${invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/invoices/${invoice.id}`} className="text-primary-600 hover:text-primary-800 transition-colors duration-200 mr-3">
                        View
                      </Link>
                      <Link to={`/invoices/${invoice.id}`} className="text-primary-600 hover:text-primary-800 transition-colors duration-200">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <Link to="/invoices" className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
            View all invoices <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium font-lexend text-text-primary">Recent Customers</h2>
          </div>
          <div className="p-6">
            <div className="text-center text-text-secondary">
              <p>Customer list coming soon</p>
              <Link to="/customers" className="mt-2 block text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
                Manage Customers <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium font-lexend text-text-primary">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <Link 
                to="/invoices/new"
                className="btn-primary block w-full py-2 text-center"
              >
                Create New Invoice
              </Link>
              <Link 
                to="/customers/new"
                className="btn-secondary block w-full py-2 text-center"
              >
                Add New Customer
              </Link>
              <Link 
                to="/products/new"
                className="btn-secondary block w-full py-2 text-center"
              >
                Add New Product
              </Link>
              <Link 
                to="/reports"
                className="btn-secondary block w-full py-2 text-center"
              >
                View Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
