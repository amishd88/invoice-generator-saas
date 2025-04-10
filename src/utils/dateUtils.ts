/**
 * Utility functions for handling dates in the application
 */

/**
 * Ensures a date value is properly formatted for database storage
 * Handles various input formats and converts to ISO string
 * 
 * @param dateValue - The date value to format (string, Date, or null)
 * @returns Properly formatted ISO date string or null
 */
export function formatDateForDB(dateValue: string | Date | null | undefined): string | null {
  if (!dateValue) {
    return null;
  }
  
  try {
    // If it's already a Date object
    if (dateValue instanceof Date) {
      // Only use the date part (YYYY-MM-DD) to avoid PostgreSQL EXTRACT issues
      return dateValue.toISOString().split('T')[0];
    }
    
    // If it's a string and already in YYYY-MM-DD format, return as is
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateValue;
    }
    
    // If it's a string with a time component, extract just the date part
    if (typeof dateValue === 'string' && dateValue.includes('T')) {
      return dateValue.split('T')[0];
    }
    
    // Otherwise, try to parse it as a date
    const date = new Date(dateValue);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date value: ${dateValue}`);
      return null;
    }
    
    // Only use the date part (YYYY-MM-DD) to avoid PostgreSQL EXTRACT issues
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error(`Error formatting date for DB: ${error}`);
    return null;
  }
}

/**
 * Formats a date from the database for display in the UI
 * 
 * @param dbDate - The date from the database
 * @param format - Optional format (e.g., 'yyyy-MM-dd')
 * @returns Formatted date string for display
 */
export function formatDateForDisplay(dbDate: string | null | undefined, format?: string): string {
  if (!dbDate) {
    return '';
  }
  
  try {
    const date = new Date(dbDate);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Default format: YYYY-MM-DD
    if (!format) {
      return date.toISOString().split('T')[0];
    }
    
    // Use a simple format implementation
    // For more complex formatting, consider a library like date-fns
    return format
      .replace('yyyy', date.getFullYear().toString())
      .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
      .replace('dd', date.getDate().toString().padStart(2, '0'));
  } catch (error) {
    console.error(`Error formatting date for display: ${error}`);
    return '';
  }
}

/**
 * Formats a date specifically to avoid PostgreSQL EXTRACT function issues
 * The PostgreSQL EXTRACT function requires properly formatted date strings
 * 
 * @param dateValue - Any date value (string, Date object, etc.)
 * @returns A properly formatted YYYY-MM-DD date string safe for PostgreSQL
 */
export function formatDateForExtract(dateValue: string | Date | null | undefined): string | null {
  if (!dateValue) {
    return null;
  }
  
  try {
    // If already in YYYY-MM-DD format, return as is
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateValue;
    }
    
    // If it's a string with time component, extract just the date part
    if (typeof dateValue === 'string' && dateValue.includes('T')) {
      return dateValue.split('T')[0];
    }
    
    // Convert to Date object if it's not already
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    
    // Validate the date
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date for PostgreSQL EXTRACT: ${dateValue}`);
      return null;
    }
    
    // Format as YYYY-MM-DD (without time component)
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error(`Error formatting date for PostgreSQL EXTRACT: ${error}`);
    return null;
  }
}
