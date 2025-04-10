// Validation utility functions

// Email validation using regex
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return email === '' || emailRegex.test(email)
}

// Phone number validation - allows various formats
export const isValidPhone = (phone: string): boolean => {
  // Allow empty phone numbers
  if (phone === '') return true
  
  // Remove spaces, dashes, parentheses, and dots
  const cleanedPhone = phone.replace(/[\s\-\(\)\.]/g, '')
  
  // Check if only digits remain and length is reasonable (7-15 digits)
  return /^\d+$/.test(cleanedPhone) && cleanedPhone.length >= 7 && cleanedPhone.length <= 15
}

// Postal/ZIP code validation - allows common formats
export const isValidPostalCode = (postalCode: string): boolean => {
  // Allow empty postal codes
  if (postalCode === '') return true
  
  // US ZIP code (5 digits or 5+4)
  const usZipRegex = /^\d{5}(-\d{4})?$/
  
  // Canadian postal code (A1A 1A1)
  const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
  
  // UK postal code
  const ukPostalRegex = /^[A-Za-z]{1,2}\d[A-Za-z\d]? \d[A-Za-z]{2}$/
  
  // Check against supported formats
  return (
    usZipRegex.test(postalCode) || 
    canadianPostalRegex.test(postalCode) || 
    ukPostalRegex.test(postalCode)
  )
}

// Numeric value validation (for price, quantity)
export const isValidNumber = (value: any): boolean => {
  // Allow empty values to be caught by required field validation
  if (value === '' || value === null || value === undefined) return true
  
  // Check if it's a number and not NaN
  return !isNaN(Number(value)) && Number(value) >= 0
}

// URL validation
export const isValidUrl = (url: string): boolean => {
  // Allow empty URLs
  if (url === '') return true
  
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

// Invoice validation - checks all required fields
export interface ValidationErrors {
  company?: string
  companyAddress?: string
  client?: string
  clientAddress?: string
  invoiceNumber?: string
  dueDate?: string
  items?: string[]
  general?: string
}

export const validateInvoice = (invoice: any): ValidationErrors => {
  const errors: ValidationErrors = {}
  
  // Check required fields
  if (!invoice.company?.trim()) {
    errors.company = 'Company name is required'
  }
  
  if (!invoice.companyAddress?.trim()) {
    errors.companyAddress = 'Company address is required'
  }
  
  if (!invoice.client?.trim()) {
    errors.client = 'Client name is required'
  }
  
  if (!invoice.clientAddress?.trim()) {
    errors.clientAddress = 'Client address is required'
  }
  
  if (!invoice.invoiceNumber?.trim()) {
    errors.invoiceNumber = 'Invoice number is required'
  }
  
  if (!invoice.dueDate) {
    errors.dueDate = 'Due date is required'
  }
  
  // Validate line items
  if (!invoice.items || invoice.items.length === 0) {
    errors.general = 'At least one line item is required'
  } else {
    const itemErrors: string[] = []
    
    invoice.items.forEach((item: any, index: number) => {
      if (!item.description?.trim()) {
        itemErrors[index] = `Item #${index + 1}: Description is required`
      } else if (!isValidNumber(item.quantity) || item.quantity <= 0) {
        itemErrors[index] = `Item #${index + 1}: Quantity must be a positive number`
      } else if (!isValidNumber(item.price)) {
        itemErrors[index] = `Item #${index + 1}: Price must be a valid number`
      } else if (!isValidNumber(item.taxRate)) {
        itemErrors[index] = `Item #${index + 1}: Tax rate must be a valid number`
      }
    })
    
    if (itemErrors.length > 0) {
      errors.items = itemErrors
    }
  }
  
  return errors
}

// Check if there are any validation errors
export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0
}
