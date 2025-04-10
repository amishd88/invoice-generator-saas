import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaFileDownload, FaPlusCircle } from 'react-icons/fa';

// Import custom hooks and components
import { useProducts } from '../../hooks/api';
import { useExport } from '../../hooks/api/useExport';
import { DataTable, Column, Pagination, SearchAndFilter } from '../ui';
import { Product } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { deleteProduct } from '../../services/productService';

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { exportToCSV, exportToJSON } = useExport();
  
  // Use our custom hook to fetch products with pagination and filtering
  const {
    products,
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
    fetchStats,
    categories,
    fetchCategories
  } = useProducts();

  // Fetch statistics and categories on component mount
  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, [fetchStats, fetchCategories]);

  // Define filter options for the search and filter component
  const filterOptions = [
    {
      id: 'name',
      label: 'Name',
      type: 'text' as const
    },
    {
      id: 'minPrice',
      label: 'Min Price',
      type: 'number' as const
    },
    {
      id: 'maxPrice',
      label: 'Max Price',
      type: 'number' as const
    },
    {
      id: 'taxRate',
      label: 'Tax Rate',
      type: 'number' as const
    }
  ];

  // Add category filter if categories are available
  if (categories && categories.length > 0) {
    filterOptions.push({
      id: 'category',
      label: 'Category',
      type: 'select' as const,
      options: categories.map(category => ({
        value: category,
        label: category
      }))
    });
  }

  // Define columns for the data table
  const columns: Column<Product>[] = [
    {
      id: 'name',
      header: 'Name',
      accessor: (product) => (
        <div className="font-medium text-gray-900">{product.name}</div>
      ),
      sortable: true
    },
    {
      id: 'description',
      header: 'Description',
      accessor: (product) => (
        <div className="max-w-md truncate">{product.description || 'N/A'}</div>
      ),
      sortable: true
    },
    {
      id: 'defaultPrice',
      header: 'Price',
      accessor: (product) => (
        <div className="text-right">${product.defaultPrice.toFixed(2)}</div>
      ),
      sortable: true,
      className: 'text-right'
    },
    {
      id: 'defaultTaxRate',
      header: 'Tax Rate',
      accessor: (product) => (
        <div className="text-right">{product.defaultTaxRate}%</div>
      ),
      sortable: true,
      className: 'text-right'
    },
    {
      id: 'category',
      header: 'Category',
      accessor: (product) => product.category || 'Uncategorized',
      sortable: true
    }
  ];

  // Handle product deletion
  const handleDeleteProduct = async (product: Product) => {
    if (!product.id) return;
    
    if (window.confirm(`Are you sure you want to delete product ${product.name}?`)) {
      try {
        await deleteProduct(product.id);
        showToast('success', `Product ${product.name} deleted successfully`);
        refreshData(); // Refresh the data after deletion
      } catch (error) {
        // Check if the error is because the product is used in invoices
        if (error instanceof Error && error.message.includes('used in invoices')) {
          showToast('error', `Cannot delete ${product.name} because it is used in invoices`);
        } else {
          console.error('Error deleting product:', error);
          showToast('error', 'Failed to delete product');
        }
      }
    }
  };

  // Export data to CSV
  const handleExportCSV = () => {
    exportToCSV(
      products,
      {
        name: 'Name',
        description: 'Description',
        defaultPrice: 'Price',
        defaultTaxRate: 'Tax Rate',
        category: 'Category'
      },
      'products-export'
    );
  };

  // Export data to JSON
  const handleExportJSON = () => {
    exportToJSON(products, 'products-export');
  };

  // Define actions for each row in the data table
  const renderActions = (product: Product) => (
    <div className="flex justify-end space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/products/view/${product.id}`);
        }}
        className="text-blue-600 hover:text-blue-800"
        title="View"
      >
        <FaEye />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/products/edit/${product.id}`);
        }}
        className="text-yellow-600 hover:text-yellow-800"
        title="Edit"
      >
        <FaEdit />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteProduct(product);
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
          <h1 className="text-2xl font-semibold text-gray-900">Products & Services</h1>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Link
              to="/products/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <FaPlusCircle className="mr-2" /> New Product
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-sm text-gray-500">Total Products</div>
              <div className="text-2xl font-semibold mt-1">{stats.totalCount}</div>
            </div>
            
            {/* Price stats */}
            {stats.priceStats && (
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm text-gray-500">Price Statistics</div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Average Price:</span>
                    <span>${stats.priceStats.avg_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Min Price:</span>
                    <span>${stats.priceStats.min_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Max Price:</span>
                    <span>${stats.priceStats.max_price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Recent products */}
            {stats.recentProducts && stats.recentProducts.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm text-gray-500">Recently Added</div>
                <div className="mt-2 space-y-2">
                  {stats.recentProducts.slice(0, 3).map((product) => (
                    <div key={product.id} className="text-sm">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-gray-500">${product.defaultPrice.toFixed(2)}</div>
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
        searchPlaceholder="Search products..."
      />
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {/* Data table */}
      <DataTable
        data={products}
        columns={columns}
        keyExtractor={(product) => product.id}
        isLoading={loading}
        emptyMessage="No products found. Add your first product!"
        sortBy={options.sortBy}
        sortOrder={options.sortOrder}
        onSort={changeSort}
        onRowClick={(product) => navigate(`/products/view/${product.id}`)}
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

export default ProductListPage;
