import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

export interface Column<T> {
  id: string;
  header: string;
  accessor: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (id: string, order: 'asc' | 'desc') => void;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  selectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  footer?: React.ReactNode;
}

function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data available',
  sortBy,
  sortOrder = 'asc',
  onSort,
  onRowClick,
  actions,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  footer
}: DataTableProps<T>): React.ReactElement {
  
  // Handle header click for sorting
  const handleHeaderClick = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;
    
    const newSortOrder = sortBy === column.id && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(column.id, newSortOrder);
  };
  
  // Handle checkbox change for row selection
  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectionChange) return;
    
    const newSelectedItems = checked
      ? [...selectedItems, id]
      : selectedItems.filter(item => item !== id);
    
    onSelectionChange(newSelectedItems);
  };
  
  // Handle select all checkbox change
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    
    const newSelectedItems = checked
      ? data.map(item => keyExtractor(item))
      : [];
    
    onSelectionChange(newSelectedItems);
  };
  
  // Check if all items are selected
  const allSelected = data.length > 0 && selectedItems.length === data.length;
  
  // Check if some (but not all) items are selected
  const someSelected = selectedItems.length > 0 && selectedItems.length < data.length;
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="bg-white overflow-hidden border border-gray-200 rounded-lg shadow-sm">
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }
  
  // Render empty state
  if (data.length === 0) {
    return (
      <div className="bg-white overflow-hidden border border-gray-200 rounded-lg shadow-sm">
        <div className="flex justify-center items-center p-8 text-gray-500">
          {emptyMessage}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white overflow-hidden border border-gray-200 rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Selection checkbox column */}
              {selectable && onSelectionChange && (
                <th scope="col" className="w-10 px-3 py-3 text-left">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={allSelected}
                      ref={input => {
                        // Handle indeterminate state
                        if (input) {
                          input.indeterminate = someSelected;
                        }
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </div>
                </th>
              )}
              
              {/* Data columns */}
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.className || ''}`}
                  onClick={() => column.sortable && handleHeaderClick(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span className="ml-1">
                        {sortBy === column.id ? (
                          sortOrder === 'asc' ? (
                            <FaSortUp className="inline-block" />
                          ) : (
                            <FaSortDown className="inline-block" />
                          )
                        ) : (
                          <FaSort className="inline-block text-gray-400" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              
              {/* Actions column */}
              {actions && (
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => {
              const id = keyExtractor(item);
              const isSelected = selectedItems.includes(id);
              
              return (
                <tr
                  key={id}
                  className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {/* Selection checkbox */}
                  {selectable && onSelectionChange && (
                    <td className="px-3 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(id, e.target.checked)}
                        />
                      </div>
                    </td>
                  )}
                  
                  {/* Data cells */}
                  {columns.map((column) => (
                    <td
                      key={`${id}-${column.id}`}
                      className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}
                    >
                      {column.accessor(item)}
                    </td>
                  ))}
                  
                  {/* Actions cell */}
                  {actions && (
                    <td
                      className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actions(item)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Table footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}

export default DataTable;
