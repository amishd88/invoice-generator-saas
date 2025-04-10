import { useState, useEffect, useCallback } from 'react';
import { 
  getInvoices, 
  searchInvoices, 
  InvoiceListOptions,
  getInvoiceStats
} from '../../services/invoiceService';
import { InvoiceState, ApiResponse, InvoiceStats } from '../../types';
import { useToast } from '../../contexts/ToastContext';

// Hook for fetching invoices with pagination and filtering
export const useInvoices = (initialOptions: InvoiceListOptions = {}) => {
  const [invoices, setInvoices] = useState<InvoiceState[]>([]);
  const [pagination, setPagination] = useState({
    page: initialOptions.page || 1,
    pageSize: initialOptions.pageSize || 10,
    totalCount: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<InvoiceListOptions>(initialOptions);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { showToast } = useToast();

  // Function to fetch invoices
  const fetchInvoices = useCallback(async (opts: InvoiceListOptions = options) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use search if there's a query, otherwise use regular fetch
      let response: ApiResponse<InvoiceState>;
      
      if (searchQuery) {
        response = await searchInvoices(searchQuery, opts);
      } else {
        response = await getInvoices(opts);
      }
      
      setInvoices(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invoices';
      setError(errorMessage);
      showToast('error', `Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [options, searchQuery, showToast]);

  // Fetch invoices when options or search query changes
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

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
  const applyFilters = useCallback((filterBy: InvoiceListOptions['filterBy']) => {
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
    fetchInvoices();
  }, [fetchInvoices]);

  // Fetch invoice statistics
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    
    try {
      const response = await getInvoiceStats();
      setStats(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invoice statistics';
      setStatsError(errorMessage);
      showToast('error', `Error: ${errorMessage}`);
    } finally {
      setStatsLoading(false);
    }
  }, [showToast]);

  return {
    invoices,
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
