import React, { useState, useCallback } from 'react';

interface FilterOption {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  options?: Array<{ value: string; label: string }>;
  defaultValue?: any;
}

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  filterOptions?: FilterOption[];
  searchPlaceholder?: string;
  defaultSearchQuery?: string;
  showFilterToggle?: boolean;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  onSearch,
  onFilter,
  filterOptions = [],
  searchPlaceholder = 'Search...',
  defaultSearchQuery = '',
  showFilterToggle = true
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(defaultSearchQuery);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<Record<string, any>>(
    filterOptions.reduce((acc, option) => {
      acc[option.id] = option.defaultValue || '';
      return acc;
    }, {} as Record<string, any>)
  );

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle search form submission
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  }, [searchQuery, onSearch]);

  // Handle filter input change
  const handleFilterChange = useCallback((id: string, value: any) => {
    setFilters(prev => ({ ...prev, [id]: value }));
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    if (onFilter) {
      // Remove empty filter values
      const nonEmptyFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      onFilter(nonEmptyFilters);
    }
  }, [filters, onFilter]);

  // Reset filters
  const resetFilters = useCallback(() => {
    const defaultFilters = filterOptions.reduce((acc, option) => {
      acc[option.id] = option.defaultValue || '';
      return acc;
    }, {} as Record<string, any>);
    
    setFilters(defaultFilters);
    
    if (onFilter) {
      onFilter({});
    }
  }, [filterOptions, onFilter]);

  return (
    <div className="mb-6">
      {/* Search form */}
      <form onSubmit={handleSearchSubmit} className="flex w-full">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          className="flex-grow px-4 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
        
        {/* Filter toggle button */}
        {showFilterToggle && filterOptions.length > 0 && (
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        )}
      </form>
      
      {/* Filters section */}
      {showFilters && filterOptions.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded border">
          <h3 className="text-lg font-medium mb-3">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterOptions.map((option) => (
              <div key={option.id} className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {option.label}
                </label>
                
                {option.type === 'text' && (
                  <input
                    type="text"
                    value={filters[option.id] || ''}
                    onChange={(e) => handleFilterChange(option.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                
                {option.type === 'select' && (
                  <select
                    value={filters[option.id] || ''}
                    onChange={(e) => handleFilterChange(option.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    {option.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
                
                {option.type === 'date' && (
                  <input
                    type="date"
                    value={filters[option.id] || ''}
                    onChange={(e) => handleFilterChange(option.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                
                {option.type === 'number' && (
                  <input
                    type="number"
                    value={filters[option.id] || ''}
                    onChange={(e) => handleFilterChange(option.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                
                {option.type === 'boolean' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!!filters[option.id]}
                      onChange={(e) => handleFilterChange(option.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;
