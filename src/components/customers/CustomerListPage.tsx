import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaFileDownload, FaPlusCircle } from 'react-icons/fa';

// Import custom hooks and components
import { useCustomers } from '../../hooks/api';
import { useExport } from '../../hooks/api/useExport';
import { DataTable, Column, Pagination, SearchAndFilter } from '../ui';
import { Customer } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { deleteCustomer } from '../../services/customerService';

const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { exportToCSV, exportToJSON } = useExport();
  
  // Use our custom hook to fetch customers with pagination and filtering
  const {
    customers,
    pagination,
    loading,
    error,
    options,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    search,
    refreshData,
    stats,
    fetchStats
  } = useCustomers();

  // Fetch statistics on component mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Define filter options for the search and filter component
  const filterOptions = [
    {
      id: 'name',
      label: 'Name',
      type: 'text' as const
    },
    {
      id: 'email',
      label: 'Email',
      type: 'text' as const
    },
    {
      id: 'phone',
      label: 'Phone',
      type: 'text' as const
    },
    {
      id: 'currency',
      label: 'Currency',
      type: 'select' as const,
      options: [
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' },
        { value: 'GBP', label: 'GBP' },
        { value: 'JPY', label: 'JPY' },
        { value: 'CAD', label: 'CAD' },
        { value: 'AUD', label: 'AUD' }
      ]
    }
  ];

  // Define columns for the data table
  const columns: Column<Customer>[] = [
    {
      id: 'name',
      header: 'Name',
      accessor: (customer) => (
        <div className="font-medium text-gray-900">{customer.name}</div>
      ),
      sortable: true
    },
    {
      id: 'email',
      header: 'Email',
      accessor: (customer) => customer.email || 'N/A',
      sortable: true
    },
    {
      id: 'phone',
      header: 'Phone',
      accessor: (customer) => customer.phone || 'N/A',
      sortable: true
    },
    {
      id: 'vatNumber',
      header: 'VAT/Tax ID',
      accessor: (customer) => customer.vatNumber || 'N/A',
      sortable: true
    },
    {
      id: 'preferredCurrency',
      header: 'Currency',
      accessor: (customer) => customer.preferredCurrency || 'USD',
      sortable: true
    }
  ];

  // Handle customer deletion
  const handleDeleteCustomer = async (customer: Customer) => {
    if (!customer.id) return;
    
    if (window.confirm(`Are you sure you want to delete customer ${customer.name}?`)) {
      try {
        await deleteCustomer(customer.id);
        showToast('success', `Customer ${customer.name} deleted successfully`);
        refreshData(); // Refresh the data after deletion
      } catch (error) {
        // Check if the error is because the customer has associated invoices
        if (error instanceof Error && error.message.includes('associated invoices')) {
          showToast('error', `Cannot delete ${customer.name} because they have associated invoices`);
        } else {
          console.error('Error deleting customer:', error);
          showToast('error', 'Failed to delete customer');
        }
      }
    }
  };

  // Export data to CSV
  const handleExportCSV = () => {
    exportToCSV(
      customers,
      {
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        vatNumber: 'VAT/Tax ID',
        preferredCurrency: 'Currency'
      },
      'customers-export'
    );
  };

  // Export data to JSON
  const handleExportJSON = () => {
    exportToJSON(customers, 'customers-export');
  };

  // Define actions for each row in the data table
  const renderActions = (customer: Customer) => (
    <div className="flex justify-end space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/customers/view/${customer.id}`);
        }}
        className="text-blue-600 hover:text-blue-800"
        title="View"
      >
        <FaEye />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/customers/edit/${customer.id}`);
        }}
        className="text-yellow-600 hover:text-yellow-800"
        title="Edit"
      >
        <FaEdit />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteCustomer(customer);
        }}
        className="text-red-600 hover:text-red-800"
        title="Delete"
      >
        <FaTrash />
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Link
              to="/customers/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <FaPlusCircle className="mr-2" /> New Customer
            </Link>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              <FaFileDownload className="mr-2" /> Export CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              <FaFileDownload className="mr-2" /> Export JSON
            </button>
          </div>
        </div>
        
        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-sm text-gray-500">Total Customers</div>
              <div className="text-2xl font-semibold mt-1">{stats.totalCount}</div>
            </div>
            
            {/* Currency distribution */}
            {stats.byCurrency && stats.byCurrency.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm text-gray-500">Currency Distribution</div>
                <div className="mt-2 space-y-1">
                  {stats.byCurrency.map((item) => (
                    <div key={item.preferred_currency} className="flex justify-between text-sm">
                      <span>{item.preferred_currency || 'Not Set'}</span>
                      <span>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Recent customers */}
            {stats.recentCustomers && stats.recentCustomers.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm text-gray-500">Recently Added</div>
                <div className="mt-2 space-y-2">
                  {stats.recentCustomers.slice(0, 3).map((customer) => (
                    <div key={customer.id} className="text-sm">
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-xs text-gray-500">{customer.email || 'No email'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Search and filter */}
      <SearchAndFilter
        onSearch={search}
        onFilter={applyFilters}
        filterOptions={filterOptions}
        searchPlaceholder="Search customers..."
      />
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {/* Data table */}
      <DataTable
        data={customers}
        columns={columns}
        keyExtractor={(customer) => customer.id}
        isLoading={loading}
        emptyMessage="No customers found. Add your first customer!"
        sortBy={options.sortBy}
        sortOrder={options.sortOrder}
        onSort={changeSort}
        onRowClick={(customer) => navigate(`/customers/view/${customer.id}`)}
        actions={renderActions}
        footer={
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={changePage}
            totalItems={pagination.totalCount}
            pageSize={pagination.pageSize}
            onPageSizeChange={changePageSize}
          />
        }
      />
    </div>
  );
};

export default CustomerListPage;
