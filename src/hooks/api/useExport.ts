import { useState, useCallback } from 'react';
import { useToast } from '../../contexts/ToastContext';

// Helper for exporting data to CSV
const convertToCSV = (data: any[], headers: Record<string, string>): string => {
  // Create header row
  const headerRow = Object.values(headers).join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return Object.keys(headers).map(key => {
      // Handle nested paths (e.g., "address.city")
      const value = key.split('.').reduce((obj, path) => 
        (obj && obj[path] !== undefined) ? obj[path] : '', item);
      
      // Escape commas and quotes
      const escapedValue = typeof value === 'string' 
        ? `"${value.replace(/"/g, '""')}"` 
        : value;
      
      return escapedValue;
    }).join(',');
  });
  
  // Combine headers and data
  return [headerRow, ...dataRows].join('\n');
};

// Hook for exporting data to various formats
export const useExport = () => {
  const [exporting, setExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  
  // Export to CSV file
  const exportToCSV = useCallback(<T extends object>(
    data: T[], 
    headers: Record<string, string>, 
    filename: string
  ) => {
    setExporting(true);
    setError(null);
    
    try {
      // Convert data to CSV
      const csv = convertToCSV(data, headers);
      
      // Create blob and download link
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create download link and trigger download
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('success', `Successfully exported ${data.length} items to ${filename}.csv`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMessage);
      showToast('error', `Error exporting data: ${errorMessage}`);
    } finally {
      setExporting(false);
    }
  }, [showToast]);
  
  // Export to JSON file
  const exportToJSON = useCallback(<T extends object>(
    data: T[], 
    filename: string
  ) => {
    setExporting(true);
    setError(null);
    
    try {
      // Convert data to JSON string
      const json = JSON.stringify(data, null, 2);
      
      // Create blob and download link
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link and trigger download
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('success', `Successfully exported ${data.length} items to ${filename}.json`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMessage);
      showToast('error', `Error exporting data: ${errorMessage}`);
    } finally {
      setExporting(false);
    }
  }, [showToast]);
  
  return {
    exporting,
    error,
    exportToCSV,
    exportToJSON
  };
};
