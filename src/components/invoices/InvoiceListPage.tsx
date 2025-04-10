import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaFileDownload, FaPlusCircle } from 'react-icons/fa';
import { format } from 'date-fns';

// Import custom hooks and components
import { useInvoices } from '../../hooks/api';
import { useExport } from '../../hooks/api/useExport';
import { DataTable, Column, Pagination, SearchAndFilter } from '../ui';
import { InvoiceState } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { deleteInvoice, updateInvoiceStatus } from '../../services/invoiceService';

// Invoice status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  
  switch (status) {
    case 'draft':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      break;
    case 'sent':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'paid':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'overdue':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { exportToCSV, exportToJSON } = useExport();
  
  // Use our custom hook to fetch invoices with pagination and filtering
  const {
    invoices,
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
  } = useInvoices();

  // Fetch statistics on component mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Define filter options for the search and filter component
  const filterOptions = [
    {
      id: 'client',
      label: 'Client',
      type: 'text' as const
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' }
      ]
    },
    {
      id: 'fromDate',
      label: 'From Date',
      type: 'date' as const
    },
    {
      id: 'toDate',
      label: 'To Date',
      type: 'date' as const
    },
    {
      id: 'minAmount',
      label: 'Min Amount',
      type: 'number' as const
    },
    {
      id: 'maxAmount',
      label: 'Max Amount',
      type: 'number' as const
    }
  ];

  // Define columns for the data table
  const columns: Column<InvoiceState>[] = [
    {
      id: 'invoiceNumber',
      header: 'Invoice #',
      accessor: (invoice) => (
        <div className="font-medium text-gray-900">
          {invoice.invoiceNumber}
        </div>
      ),
      sortable: true
    },
    {
      id: 'client',
      header: 'Client',
      accessor: (invoice) => invoice.client,
      sortable: true
    },
    {
      id: 'createdAt',
      header: 'Date',
      accessor: (invoice) => (
        <span>
          {invoice.createdAt
            ? format(new Date(invoice.createdAt), 'dd MMM yyyy')
            : 'N/A'}
        </span>
      ),
      sortable: true
    },
    {
      id: 'dueDate',
      header: 'Due Date',
      accessor: (invoice) => (
        <span>
          {invoice.dueDate
            ? format(new Date(invoice.dueDate), 'dd MMM yyyy')
            : 'N/A'}
        </span>
      ),
      sortable: true
    },
    {
      id: 'totalAmount',
      header: 'Amount',
      accessor: (invoice) => (
        <div className="text-right">
          {invoice.currency?.symbol || '$'}
          {invoice.totalAmount?.toFixed(2) || '0.00'}
        </div>
      ),
      sortable: true,
      className: 'text-right'
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (invoice) => <StatusBadge status={invoice.status || 'draft'} />,
      sortable: true
    }
  ];

  // Handle invoice deletion
  const handleDeleteInvoice = async (invoice: InvoiceState) => {
    if (!invoice.id) return;
    
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      try {
        await deleteInvoice(invoice.id);
        showToast('success', `Invoice ${invoice.invoiceNumber} deleted successfully`);
        refreshData(); // Refresh the data after deletion
      } catch (error) {
        console.error('Error deleting invoice:', error);
        showToast('error', 'Failed to delete invoice');
      }
    }
  };

  // Handle invoice status update
  const handleUpdateStatus = async (invoice: InvoiceState, newStatus: string) => {
    if (!invoice.id) return;
    
    try {
      await updateInvoiceStatus(invoice.id, newStatus);
      showToast('success', `Invoice ${invoice.invoiceNumber} marked as ${newStatus}`);
      refreshData(); // Refresh the data after status update
    } catch (error) {
      console.error('Error updating invoice status:', error);
      showToast('error', 'Failed to update invoice status');
    }
  };

  // Export data to CSV
  const handleExportCSV = () => {
    exportToCSV(
      invoices,
      {
        invoiceNumber: 'Invoice Number',
        client: 'Client',
        createdAt: 'Date',
        dueDate: 'Due Date',
        totalAmount: 'Amount',
        status: 'Status'
      },
      'invoices-export'
    );
  };

  // Export data to JSON
  const handleExportJSON = () => {
    exportToJSON(invoices, 'invoices-export');
  };

  // Define actions for each row in the data table
  const renderActions = (invoice: InvoiceState) => (
    <div className="flex justify-end space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/invoices/view/${invoice.id}`);
        }}
        className="text-blue-600 hover:text-blue-800"
        title="View"
      >
        <FaEye />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/invoices/edit/${invoice.id}`);
        }}
        className="text-yellow-600 hover:text-yellow-800"
        title="Edit"
      >
        <FaEdit />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteInvoice(invoice);
        }}
        className="text-red-600 hover:text-red-800"
        title="Delete"
      >
        <FaTrash />
      </button>
    </div>
  );

  // Define dropdown menu for status updates
  const renderStatusMenu = (invoice: InvoiceState) => (
    <div className="relative dropdown inline-block">
      <button className="text-sm text-gray-600 hover:text-gray-800">
        Change Status
      </button>
      <div className="dropdown-menu hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
        <div className="py-1">
          <button
            onClick={() => handleUpdateStatus(invoice, 'draft')}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Mark as Draft
          </button>
          <button
            onClick={() => handleUpdateStatus(invoice, 'sent')}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Mark as Sent
          </button>
          <button
            onClick={() => handleUpdateStatus(invoice, 'paid')}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Mark as Paid
          </button>
          <button
            onClick={() => handleUpdateStatus(invoice, 'overdue')}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Mark as Overdue
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Link
              to="/invoices/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <FaPlusCircle className="mr-2" /> New Invoice
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-sm text-gray-500">Total Invoices</div>
              <div className="text-2xl font-semibold mt-1">
                {stats.byStatus.reduce((sum, item) => sum + item.count, 0)}
              </div>
            </div>
            
            {stats.byStatus.map((stat) => (
              <div key={stat.status} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm text-gray-500">
                  {stat.status.charAt(0).toUpperCase() + stat.status.slice(1)}
                </div>
                <div className="text-2xl font-semibold mt-1">{stat.count}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Search and filter */}
      <SearchAndFilter
        onSearch={search}
        onFilter={applyFilters}
        filterOptions={filterOptions}
        searchPlaceholder="Search invoices..."
      />
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {/* Data table */}
      <DataTable
        data={invoices}
        columns={columns}
        keyExtractor={(invoice) => invoice.id || ''}
        isLoading={loading}
        emptyMessage="No invoices found. Create your first invoice!"
        sortBy={options.sortBy}
        sortOrder={options.sortOrder}
        onSort={changeSort}
        onRowClick={(invoice) => navigate(`/invoices/view/${invoice.id}`)}
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

export default InvoiceListPage;
