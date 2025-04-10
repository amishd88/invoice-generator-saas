import { useState, useEffect, useCallback } from 'react';
import { 
  getProducts, 
  searchProducts, 
  ProductListOptions,
  getProductStats,
  getProductCategories
} from '../../services/productService';
import { Product, ApiResponse, ProductStats } from '../../types';
import { useToast } from '../../contexts/ToastContext';

// Hook for fetching products with pagination and filtering
export const useProducts = (initialOptions: ProductListOptions = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: initialOptions.page || 1,
    pageSize: initialOptions.pageSize || 10,
    totalCount: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ProductListOptions>(initialOptions);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { showToast } = useToast();

  // Function to fetch products
  const fetchProducts = useCallback(async (opts: ProductListOptions = options) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use search if there's a query, otherwise use regular fetch
      let response: ApiResponse<Product>;
      
      if (searchQuery) {
        response = await searchProducts(searchQuery, opts);
      } else {
        response = await getProducts(opts);
      }
      
      setProducts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      showToast('error', `Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [options, searchQuery, showToast]);

  // Fetch products when options or search query changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
  const applyFilters = useCallback((filterBy: ProductListOptions['filterBy']) => {
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
    fetchProducts();
  }, [fetchProducts]);

  // Fetch product statistics
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    
    try {
      const response = await getProductStats();
      setStats(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product statistics';
      setStatsError(errorMessage);
      showToast('error', `Error: ${errorMessage}`);
    } finally {
      setStatsLoading(false);
    }
  }, [showToast]);

  // Fetch product categories
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    
    try {
      const response = await getProductCategories();
      setCategories(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product categories';
      setCategoriesError(errorMessage);
      showToast('error', `Error: ${errorMessage}`);
    } finally {
      setCategoriesLoading(false);
    }
  }, [showToast]);

  return {
    products,
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
    fetchStats,
    categories,
    categoriesLoading,
    categoriesError,
    fetchCategories
  };
};
