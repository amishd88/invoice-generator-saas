import { useState, useEffect, useCallback } from 'react';
import { 
  getCustomers, 
  searchCustomers, 
  CustomerListOptions,
  getCustomerStats
} from '../../services/customerService';
import { Customer, ApiResponse, CustomerStats } from '../../types';
import { useToast } from '../../contexts/ToastContext';

// Hook for fetching customers with pagination and filtering
export const useCustomers = (initialOptions: CustomerListOptions = {}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState({
    page: initialOptions.page || 1,
    pageSize: initialOptions.pageSize || 10,
    totalCount: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<CustomerListOptions>(initialOptions);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { showToast } = useToast();

  // Function to fetch customers
  const fetchCustomers = useCallback(async (opts: CustomerListOptions = options) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use search if there's a query, otherwise use regular fetch
      let response: ApiResponse<Customer>;
      
      if (searchQuery) {
        response = await searchCustomers(searchQuery, opts);
      } else {
        response = await getCustomers(opts);
      }
      
      setCustomers(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customers';
      setError(errorMessage);
      showToast('error', `Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [options, searchQuery, showToast]);

  // Fetch customers when options or search query changes
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Change page
  const changePage = useCallback((page: number) => {
    setOptions(prev => ({ ...prev, page }));
  }, []);

  // Change page size
  const changePageSize = useCallback((pageSize: number) => {
    setOptions(prev => ({ ...prev, page: 1, pageSize }));
  }, []);

  // Change sort options
  const changeSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') => {
    setOptions(prev => ({ ...prev, sortBy, sortOrder }));
  }, []);

  // Apply filters
  const applyFilters = useCallback((filterBy: CustomerListOptions['filterBy']) => {
    setOptions(prev => ({ ...prev, page: 1, filterBy: { ...prev.filterBy, ...filterBy } }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setOptions(prev => ({ ...prev, page: 1, filterBy: {} }));
  }, []);

  // Search function
  const search = useCallback((query: string) => {
    setSearchQuery(query);
    setOptions(prev => ({ ...prev, page: 1 }));
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Fetch customer statistics
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    
    try {
      const response = await getCustomerStats();
      setStats(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customer statistics';
      setStatsError(errorMessage);
      showToast('error', `Error: ${errorMessage}`);
    } finally {
      setStatsLoading(false);
    }
  }, [showToast]);

  return {
    customers,
    pagination,
    loading,
    error,
    options,
    searchQuery,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    search,
    refreshData,
    stats,
    statsLoading,
    statsError,
    fetchStats
  };
};
