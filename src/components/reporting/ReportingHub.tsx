import React, { useState } from 'react';
import AnalyticsDashboard from './AnalyticsDashboard';
import SalesReport from './SalesReport';
import OutstandingInvoicesReport from './OutstandingInvoicesReport';
import CustomerPaymentHistory from './CustomerPaymentHistory';

type ReportView = 'dashboard' | 'salesReport' | 'outstandingInvoices' | 'customerPaymentHistory';

const ReportingHub: React.FC = () => {
  const [activeView, setActiveView] = useState<ReportView>('dashboard');
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeView === 'dashboard' 
                  ? 'border-purple-700 text-purple-700' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveView('dashboard')}
            >
              Analytics Dashboard
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeView === 'salesReport' 
                  ? 'border-purple-700 text-purple-700' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveView('salesReport')}
            >
              Sales Report
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeView === 'outstandingInvoices' 
                  ? 'border-purple-700 text-purple-700' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveView('outstandingInvoices')}
            >
              Outstanding Invoices
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeView === 'customerPaymentHistory' 
                  ? 'border-purple-700 text-purple-700' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveView('customerPaymentHistory')}
            >
              Customer Payment History
            </button>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        {activeView === 'dashboard' && <AnalyticsDashboard />}
        {activeView === 'salesReport' && <SalesReport />}
        {activeView === 'outstandingInvoices' && <OutstandingInvoicesReport />}
        {activeView === 'customerPaymentHistory' && <CustomerPaymentHistory />}
      </div>
    </div>
  );
};

export default ReportingHub;
