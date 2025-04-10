import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/common/Navigation';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/invoices/InvoiceList';
import InvoiceForm from './components/invoices/InvoiceForm';
import CustomerList from './components/customers/CustomerList';
import CustomerForm from './components/customers/CustomerForm';
import ProductList from './components/products/ProductList';
import ProductForm from './components/products/ProductForm';
import ReportingHub from './components/reporting/ReportingHub';
import Footer from './components/common/Footer';
import { NotificationProvider } from './contexts/NotificationContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import LoginPage from './components/auth/LoginPage';
import SimpleProtectedRoute from './components/auth/SimpleProtectedRoute';
import ToastContainer from './components/common/ToastContainer';
import AppInitializer from './components/common/AppInitializer';
import DatabaseDebugger from './components/common/DatabaseDebugger';
import Troubleshoot from './components/Troubleshoot';

function App() {
  return (
    <ToastContainer>
      <NotificationProvider>
        <SubscriptionProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-gray-50">
                <Navigation />
                <AppInitializer />
                <DatabaseDebugger />
                <main className="flex-grow container-custom py-6">
                  <Routes>
                    {/* Auth Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/troubleshoot" element={<Troubleshoot />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={<SimpleProtectedRoute><Dashboard /></SimpleProtectedRoute>} />
                    
                    {/* Invoice Routes */}
                    <Route path="/invoices" element={<SimpleProtectedRoute><InvoiceList /></SimpleProtectedRoute>} />
                    <Route path="/invoices/new" element={<SimpleProtectedRoute><InvoiceForm /></SimpleProtectedRoute>} />
                    <Route path="/invoices/:id" element={<SimpleProtectedRoute><InvoiceForm /></SimpleProtectedRoute>} />
                    
                    {/* Customer Routes */}
                    <Route path="/customers" element={<SimpleProtectedRoute><CustomerList /></SimpleProtectedRoute>} />
                    <Route path="/customers/new" element={<SimpleProtectedRoute><CustomerForm /></SimpleProtectedRoute>} />
                    <Route path="/customers/:id" element={<SimpleProtectedRoute><CustomerForm /></SimpleProtectedRoute>} />
                    
                    {/* Product Routes */}
                    <Route path="/products" element={<SimpleProtectedRoute><ProductList /></SimpleProtectedRoute>} />
                    <Route path="/products/new" element={<SimpleProtectedRoute><ProductForm /></SimpleProtectedRoute>} />
                    <Route path="/products/:id" element={<SimpleProtectedRoute><ProductForm /></SimpleProtectedRoute>} />
                    
                    {/* Report Routes */}
                    <Route path="/reports/*" element={<SimpleProtectedRoute><ReportingHub /></SimpleProtectedRoute>} />
                  </Routes>
                </main>
                <Footer />
            </div>
          </BrowserRouter>
        </SubscriptionProvider>
      </NotificationProvider>
    </ToastContainer>
  );
}

export default App;
