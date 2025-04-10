// Currency configuration
export interface Currency {
  code: string        // USD, EUR, GBP, etc.
  symbol: string      // $, €, £, etc.
  name?: string        // US Dollar, Euro, British Pound, etc.
  decimal?: string     // ".", ",", etc.
  thousand?: string    // ",", ".", " ", etc.
  precision?: number   // Number of decimal places
  format?: string      // "%s%v" for $1.00, "%v %s" for 1.00 €, etc.
}

// Tax information
export interface TaxInfo {
  id: string
  name: string
  rate: number
  isDefault?: boolean
}

// Shipping information
export interface ShippingInfo {
  name?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  method?: string
  cost?: number
}

export type LineItem = {
  id: string
  description: string
  quantity: number
  price: number
  taxRate: number
  taxId?: string     // Reference to a specific tax
  unit?: string      // hours, items, pieces, etc.
  discount?: number  // Percentage discount
  productId?: string // Reference to a Product
}

export type InvoiceState = {
  id?: string // Added for database reference
  company: string
  companyAddress: string
  client: string
  clientAddress: string
  invoiceNumber: string
  dueDate: string
  items: LineItem[]
  logo?: string | null | ArrayBuffer
  logoZoom: number
  notes?: string
  terms?: string
  createdAt?: string // Added for database
  updatedAt?: string // Added for database
  customerId?: string // Reference to a Customer
  status?: string // draft, sent, paid, overdue
  totalAmount?: number // Calculated total amount
  
  // New customization fields
  templateId: string // Reference to the template being used
  primaryColor?: string // Can override template color
  secondaryColor?: string // Can override template color
  currency: Currency
  
  // Additional fields
  paymentTerms?: string
  shipping?: ShippingInfo
  bankDetails?: string
  vatNumber?: string
  poNumber?: string // Purchase order number
  dueInDays?: number // Due in X days from issue
  issueDate?: string // When the invoice was issued
  discount?: number // Overall invoice discount percentage
  taxes?: TaxInfo[] // Available tax rates
  
  // Visibility toggles for optional sections
  showShipping: boolean
  showDiscount: boolean
  showTaxColumn: boolean
  showSignature: boolean
  showPaymentDetails: boolean
}

// New type for Customer data
export type Customer = {
  id: string
  name: string
  address: string
  email?: string
  phone?: string
  vatNumber?: string // Tax ID / VAT Number
  contactPerson?: string
  website?: string
  preferredCurrency?: string
  createdAt?: string
  updatedAt?: string
}

// New type for Product/Service catalog
export type Product = {
  id: string
  name: string
  description: string
  defaultPrice: number
  defaultTaxRate: number
  unit?: string // hours, items, pieces, etc.
  sku?: string  // Stock keeping unit
  category?: string
  createdAt?: string
  updatedAt?: string
}

// Authentication related types
export type User = {
  id: string
  email: string
}

// Template-related action types
export interface TemplateAction {
  type: 'SET_TEMPLATE'
  templateId: string
}

export interface CurrencyAction {
  type: 'SET_CURRENCY'
  currency: Currency
}

export interface ToggleFieldAction {
  type: 'TOGGLE_FIELD'
  field: 'showShipping' | 'showDiscount' | 'showTaxColumn' | 'showSignature' | 'showPaymentDetails'
  value: boolean
}

export interface UpdateShippingAction {
  type: 'UPDATE_SHIPPING'
  shipping: Partial<ShippingInfo>
}

export interface AddTaxAction {
  type: 'ADD_TAX'
  tax: TaxInfo
}

export interface RemoveTaxAction {
  type: 'REMOVE_TAX'
  taxId: string
}

// Extended action types for the reducer
export type InvoiceAction =
  | { type: 'ADD_ITEM' }
  | { type: 'UPDATE_ITEM'; id: string; field: string; value: any }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'SET_LOGO'; logo: string | null | ArrayBuffer }
  | { type: 'CLEAR_LOGO' }
  | { type: 'SET_LOGO_ZOOM'; zoom: number }
  | { type: 'LOAD_INVOICE'; invoice: InvoiceState }
  | { type: 'RESET_INVOICE' }
  | { type: 'SET_CUSTOMER'; customer: Customer }
  | { type: 'ADD_PRODUCT_TO_ITEMS'; product: Product }
  | TemplateAction
  | CurrencyAction
  | ToggleFieldAction
  | UpdateShippingAction
  | AddTaxAction
  | RemoveTaxAction
  | { [key: string]: any } // For dynamic field updates

// API Response and Pagination Types
export interface PaginationInfo {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

export interface ApiSingleResponse<T> {
  data: T
}

export interface ApiError {
  message: string
  status: number
  details?: string
}

// Search and filter options
export interface BaseListOptions {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface InvoiceFilterOptions extends BaseListOptions {
  filterBy?: {
    client?: string
    fromDate?: string
    toDate?: string
    status?: string
    minAmount?: number
    maxAmount?: number
    customerId?: string
  }
}

export interface CustomerFilterOptions extends BaseListOptions {
  filterBy?: {
    name?: string
    email?: string
    phone?: string
    vatNumber?: string
    currency?: string
  }
}

export interface ProductFilterOptions extends BaseListOptions {
  filterBy?: {
    name?: string
    minPrice?: number
    maxPrice?: number
    taxRate?: number
    category?: string
  }
}

// Statistics and dashboard types
export interface InvoiceStats {
  byStatus: { status: string, count: number }[]
  timeline: { month: string, total: number }[]
}

export interface CustomerStats {
  totalCount: number
  recentCustomers: {
    id: string
    name: string
    email?: string
    createdAt: string
  }[]
  byCurrency: { preferred_currency: string, count: number }[]
}

export interface ProductStats {
  totalCount: number
  recentProducts: {
    id: string
    name: string
    defaultPrice: number
    createdAt: string
  }[]
  priceStats: {
    avg_price: number
    min_price: number
    max_price: number
  }
}

// Bulk import types
export interface BulkImportResult {
  count: number
  success: boolean
  errors?: string[]
}
