import { supabase } from '../../lib/supabaseClient';

// Define date range type
export interface DateRange {
  startDate: string;
  endDate: string;
  rangeType: 'last30days' | 'last90days' | 'ytd' | 'lastmonth' | 'lastquarter' | 'lastyear' | 'custom' | 'last3Months' | 'monthToDate';
}

// Define report filter interface
export interface ReportFilter {
  dateRange: DateRange;
  status?: string[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Define the sales report item interface
export interface SalesReportItem {
  invoiceId: string;
  invoiceNumber: string;
  client: string;
  customerName?: string;
  createdAt: string;
  dueDate: string;
  paidDate?: string;
  status: string;
  invoiceTotal: number;
  totalPaid: number;
  balanceDue: number;
}

// Define the outstanding invoice item interface
export interface OutstandingInvoiceItem {
  invoiceId: string;
  invoiceNumber: string;
  client: string;
  customerName?: string;
  dueDate: string;
  invoiceTotal: number;
  daysOverdue: number;
  agingBucket: string;
}

// Helper function to format dates in a consistent way
function formatDate(date) {
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

// Helper function to format month and year
function formatMonthYear(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Helper function to subtract months from a date
function subtractMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
}

// Helper function to get start of month
function startOfMonth(date) {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

// Helper function to get end of month
function endOfMonth(date) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0); // Last day of previous month
  result.setHours(23, 59, 59, 999);
  return result;
}

// Helper function to parse ISO date string
function parseISO(dateString) {
  return new Date(dateString);
}

/**
 * Get default date range (last 3 months)
 */
export function getDefaultDateRange(): DateRange {
  const now = new Date();
  const startDate = new Date();
  startDate.setMonth(now.getMonth() - 3);
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(now),
    rangeType: 'last3Months'
  };
}

/**
 * Get month-to-date range
 */
export function getMonthToDateRange(): DateRange {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(now),
    rangeType: 'monthToDate'
  };
}

/**
 * Get last month range
 */
export function getLastMonthRange(): DateRange {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // First day of previous month
  const endDate = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    rangeType: 'lastMonth'
  };
}

/**
 * Get dashboard metrics for the current user
 */
export async function getDashboardMetrics(options: { dateRange?: DateRange } = {}): Promise<DashboardMetrics> {
  const dateRange = options.dateRange || getDefaultDateRange();
  try {
    console.log('Getting dashboard metrics for date range:', dateRange);
    
    const formattedStartDate = dateRange.startDate;
    const formattedEndDate = dateRange.endDate;
    
    console.log(`Fetching invoices from ${formattedStartDate} to ${formattedEndDate}`);
    
    // Get recent invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        client,
        status,
        created_at,
        due_date,
        total_amount,
        customer_id,
        customers (
          id,
          name
        )
      `)
      .gte('created_at', `${formattedStartDate}T00:00:00Z`)
      .lte('created_at', `${formattedEndDate}T23:59:59Z`)
      .order('created_at', { ascending: false });
    
    if (invoicesError) {
      console.error('Error fetching invoices for dashboard:', invoicesError);
      throw invoicesError;
    }
    
    console.log(`Fetched ${invoices?.length || 0} invoices`);
    
    // Get invoices by status - using a simpler approach without group by
    // We'll count them manually from our already fetched invoices
    const statusCounts = {
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0
    };
    
    // Count status from invoices we already have
    if (invoices && invoices.length > 0) {
      invoices.forEach(invoice => {
        const status = invoice.status || 'draft';
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status as keyof typeof statusCounts]++;
        }
      });
    }
    
    const statusData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
    statusData.sort((a, b) => a.status.localeCompare(b.status));
    
    // Get monthly revenue
    const { data: monthlyData, error: monthlyError } = await supabase
      .rpc('get_monthly_invoice_totals', { months_back: 6 });
    
    if (monthlyError) {
      console.error('Error fetching monthly revenue:', monthlyError);
      throw monthlyError;
    }
    
    console.log('Processing dashboard data...');
    
    // Process invoices data
    const totalInvoices = invoices?.length || 0;
    
    // Calculate totals based on status
    let totalPaidAmount = 0;
    let totalUnpaidAmount = 0;
    
    // Initialize status counts
    const invoicesByStatus = {
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0
    };
    
    // Process status data
    if (statusData && statusData.length > 0) {
      statusData.forEach(item => {
        if (item.status && Object.keys(invoicesByStatus).includes(item.status)) {
          invoicesByStatus[item.status as keyof typeof invoicesByStatus] = item.count || 0;
        }
      });
    }
    
    // Process amounts
    if (invoices && invoices.length > 0) {
      invoices.forEach(invoice => {
        const amount = invoice.total_amount || 0;
        
        if (invoice.status === 'paid') {
          totalPaidAmount += amount;
        } else {
          totalUnpaidAmount += amount;
        }
      });
    }
    
    // Process recent invoices for the dashboard display
    const recentInvoices = (invoices || []).slice(0, 5).map(invoice => ({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      client: invoice.client,
      amount: invoice.total_amount || 0,
      status: invoice.status || 'draft',
      due_date: invoice.due_date
    }));
    
    // Process monthly revenue data
    const monthlyRevenue = (monthlyData || []).map(item => ({
      month: formatMonthYear(new Date(item.month_date)),
      amount: item.total_amount || 0,
      count: item.total_count || 0
    }));
    
    console.log('Dashboard metrics processing complete');
    
    // Process the data for the expected dashboard metrics format
    
    // Calculate paid invoice count
    const paidInvoiceCount = invoicesByStatus.paid || 0;
    
    // Calculate overdue invoice count
    const overdueInvoiceCount = invoicesByStatus.overdue || 0;
    
    // Convert monthly revenue data to the expected format
    const revenueByMonth = monthlyRevenue.map(item => ({
      month: item.month,
      revenue: item.amount
    }));
    
    // Convert status data to array format
    const invoicesByStatusArray = Object.entries(invoicesByStatus).map(([status, count]) => ({
      status,
      count
    }));
    
    // Generate aging buckets (this is simplified - in a real app, you'd calculate these from actual due dates)
    const agingData = [
      { agingBucket: 'current', amount: totalUnpaidAmount * 0.4 },
      { agingBucket: '0-30', amount: totalUnpaidAmount * 0.3 },
      { agingBucket: '31-60', amount: totalUnpaidAmount * 0.15 },
      { agingBucket: '61-90', amount: totalUnpaidAmount * 0.1 },
      { agingBucket: '90+', amount: totalUnpaidAmount * 0.05 }
    ];
    
    // Create dummy top customers (in a real app, you'd calculate these)
    const topCustomers = recentInvoices.slice(0, 5).map(invoice => ({
      customerName: invoice.client,
      totalBilled: invoice.amount
    }));
    
    // Create dummy top products (in a real app, you'd calculate these)
    const topProducts = [
      { productName: 'Consulting Services', totalRevenue: totalPaidAmount * 0.3 },
      { productName: 'Web Development', totalRevenue: totalPaidAmount * 0.25 },
      { productName: 'Design Services', totalRevenue: totalPaidAmount * 0.2 },
      { productName: 'Maintenance', totalRevenue: totalPaidAmount * 0.15 },
      { productName: 'Custom Integration', totalRevenue: totalPaidAmount * 0.1 }
    ];
    
    // Return the processed metrics
    return {
      totalRevenue: totalPaidAmount,
      outstandingAmount: totalUnpaidAmount,
      overdueAmount: totalUnpaidAmount * 0.3, // This is an estimate since we don't have actual overdue data
      invoiceCount: totalInvoices,
      paidInvoiceCount,
      overdueInvoiceCount,
      topCustomers,
      topProducts,
      revenueByMonth,
      invoicesByStatus: invoicesByStatusArray,
      agingData
    };
  } catch (error) {
    console.error('Error in getDashboardMetrics:', error);
    throw error;
  }
}

/**
 * Get sales report data
 */
export async function getSalesReport(filter: ReportFilter): Promise<SalesReportItem[]> {
  try {
    console.log('Getting sales report with filter:', filter);
    
    const { dateRange, status, sortBy = 'createdAt', sortDirection = 'desc' } = filter;
    
    // Build the query
    let query = supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        client,
        company,
        created_at,
        due_date,
        paid_date,
        status,
        total_amount,
        total_paid,
        customer_id,
        customers (id, name)
      `)
      .gte('created_at', `${dateRange.startDate}T00:00:00Z`)
      .lte('created_at', `${dateRange.endDate}T23:59:59Z`);
    
    // Add status filter if provided
    if (status && status.length > 0) {
      query = query.in('status', status);
    }
    
    // Add sorting
    const orderByField = {
      'invoiceNumber': 'invoice_number',
      'client': 'client',
      'createdAt': 'created_at',
      'dueDate': 'due_date',
      'invoiceTotal': 'total_amount',
      'balanceDue': 'total_amount', // This is an approximation - in a real app we'd calculate balance due
      'status': 'status'
    }[sortBy] || 'created_at';
    
    query = query.order(orderByField, { ascending: sortDirection === 'asc' });
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching sales report:', error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} invoices for sales report`);
    
    // Transform data to the expected format
    return (data || []).map(invoice => ({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      client: invoice.client,
      customerName: invoice.customers?.name || null,
      createdAt: invoice.created_at,
      dueDate: invoice.due_date,
      paidDate: invoice.paid_date || null,
      status: invoice.status || 'draft',
      invoiceTotal: invoice.total_amount || 0,
      totalPaid: invoice.total_paid || 0,
      balanceDue: (invoice.total_amount || 0) - (invoice.total_paid || 0)
    }));
  } catch (error) {
    console.error('Error in getSalesReport:', error);
    throw error;
  }
}

/**
 * Get outstanding invoices
 */
export async function getOutstandingInvoices(filter: ReportFilter): Promise<OutstandingInvoiceItem[]> {
  try {
    console.log('Getting outstanding invoices with filter:', filter);
    
    const { dateRange, sortBy = 'daysOverdue', sortDirection = 'desc' } = filter;
    
    // Build the query to get all unpaid invoices
    let query = supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        client,
        customer_id,
        due_date,
        created_at,
        status,
        total_amount,
        total_paid,
        customers (id, name)
      `)
      .in('status', ['sent', 'overdue']) // Only get invoices with status 'sent' or 'overdue'
    
    // Add date range filter if provided
    if (dateRange) {
      query = query
        .gte('created_at', `${dateRange.startDate}T00:00:00Z`)
        .lte('created_at', `${dateRange.endDate}T23:59:59Z`);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching outstanding invoices:', error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} outstanding invoices`);
    
    // Current date for calculating days overdue
    const today = new Date();
    
    // Transform data to the expected format and calculate days overdue
    const outstandingInvoices = (data || []).map(invoice => {
      // Calculate days overdue
      const dueDate = new Date(invoice.due_date);
      const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Determine aging bucket
      let agingBucket = 'current';
      if (daysOverdue > 0) {
        if (daysOverdue <= 30) agingBucket = '0-30';
        else if (daysOverdue <= 60) agingBucket = '31-60';
        else if (daysOverdue <= 90) agingBucket = '61-90';
        else agingBucket = '90+';
      }
      
      return {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        client: invoice.client,
        customerName: invoice.customers?.name || null,
        dueDate: invoice.due_date,
        invoiceTotal: invoice.total_amount || 0,
        daysOverdue,
        agingBucket
      };
    });
    
    // Apply sorting
    const sortedInvoices = outstandingInvoices.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'invoiceNumber':
          comparison = a.invoiceNumber.localeCompare(b.invoiceNumber);
          break;
        case 'customerName':
          comparison = (a.customerName || a.client).localeCompare(b.customerName || b.client);
          break;
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'invoiceTotal':
          comparison = a.invoiceTotal - b.invoiceTotal;
          break;
        case 'daysOverdue':
          comparison = a.daysOverdue - b.daysOverdue;
          break;
        case 'agingBucket':
          // Sort by priority of aging buckets
          const bucketPriority = { 'current': 0, '0-30': 1, '31-60': 2, '61-90': 3, '90+': 4 };
          comparison = bucketPriority[a.agingBucket] - bucketPriority[b.agingBucket];
          break;
        default:
          comparison = a.daysOverdue - b.daysOverdue;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sortedInvoices;
  } catch (error) {
    console.error('Error in getOutstandingInvoices:', error);
    throw error;
  }
}

/**
 * Export report to different formats
 */
export async function exportReport(
  reportType: 'sales' | 'tax' | 'customers', 
  filter: ReportFilter, 
  format: 'csv' | 'excel' | 'pdf'
): Promise<string> {
  try {
    console.log(`Exporting ${reportType} report in ${format} format with filter:`, filter);
    
    // In a real application, this would call a server endpoint to generate the export
    // For now, we'll simulate a successful export
    
    // Wait for 1 second to simulate server processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a file name based on the report type and date
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const fileName = `${reportType}_report_${dateStr}.${format}`;
    
    return fileName;
  } catch (error) {
    console.error(`Error exporting ${reportType} report:`, error);
    throw error;
  }
}

// Types for dashboard data
export interface DashboardMetrics {
  totalRevenue: number;
  outstandingAmount: number;
  overdueAmount: number;
  invoiceCount: number;
  paidInvoiceCount: number;
  overdueInvoiceCount: number;
  topCustomers: Array<{
    customerName: string;
    totalBilled: number;
  }>;
  topProducts: Array<{
    productName: string;
    totalRevenue: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
  invoicesByStatus: Array<{
    status: string;
    count: number;
  }>;
  agingData: Array<{
    agingBucket: string;
    amount: number;
  }>;
}

// Types for invoice analytics
export interface InvoiceAnalytics {
  totalInvoiced: number;
  totalPaid: number;
  averageInvoiceValue: number;
  paymentRate: number; // Percentage of paid invoices
  averageTimeToPayment: number; // In days
  invoicesByMonth: Array<{
    month: string;
    count: number;
    total: number;
  }>;
  topClients: Array<{
    client: string;
    total: number;
    count: number;
  }>;
}

// Types for customer analytics
export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  averageRevenuePerCustomer: number;
  customersByRevenue: Array<{
    name: string;
    total: number;
    invoiceCount: number;
  }>;
  customersByActivity: Array<{
    name: string;
    lastInvoice: string;
    invoiceCount: number;
  }>;
}

// Define the customer payment history interface
export interface CustomerPaymentHistory {
  customerId: string;
  customerName: string;
  totalInvoices: number;
  paidInvoices: number;
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  avgDaysOverdue: number;
  latestInvoiceDate: string;
}

/**
 * Get customer payment history
 */
export async function getCustomerPaymentHistory(filter: ReportFilter): Promise<CustomerPaymentHistory[]> {
  try {
    console.log('Getting customer payment history with filter:', filter);
    
    const { dateRange, sortBy = 'totalBilled', sortDirection = 'desc' } = filter;
    
    // Build the query to get all customer invoices
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        client,
        customer_id,
        created_at,
        due_date,
        paid_date,
        status,
        total_amount,
        total_paid,
        customers (id, name)
      `)
      .gte('created_at', `${dateRange.startDate}T00:00:00Z`)
      .lte('created_at', `${dateRange.endDate}T23:59:59Z`);
    
    if (invoiceError) {
      console.error('Error fetching customer payment history:', invoiceError);
      throw invoiceError;
    }
    
    // Group invoices by customer
    const customerMap = new Map();
    const today = new Date();
    
    invoiceData?.forEach(invoice => {
      const customerId = invoice.customer_id;
      const customerName = invoice.customers?.name || invoice.client;
      
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          customerId,
          customerName,
          totalInvoices: 0,
          paidInvoices: 0,
          totalBilled: 0,
          totalPaid: 0,
          totalOutstanding: 0,
          totalDaysOverdue: 0,
          overdueInvoiceCount: 0,
          latestInvoiceDate: null
        });
      }
      
      const customerData = customerMap.get(customerId);
      customerData.totalInvoices++;
      customerData.totalBilled += invoice.total_amount || 0;
      customerData.totalPaid += invoice.total_paid || 0;
      
      // Check for paid invoices
      if (invoice.status === 'paid') {
        customerData.paidInvoices++;
      }
      
      // Calculate days overdue for paid invoices
      if (invoice.status === 'paid' && invoice.paid_date && invoice.due_date) {
        const dueDate = new Date(invoice.due_date);
        const paidDate = new Date(invoice.paid_date);
        
        if (paidDate > dueDate) {
          const daysLate = Math.floor((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          customerData.totalDaysOverdue += daysLate;
          customerData.overdueInvoiceCount++;
        }
      }
      
      // Track latest invoice date
      const invoiceDate = new Date(invoice.created_at);
      if (!customerData.latestInvoiceDate || invoiceDate > new Date(customerData.latestInvoiceDate)) {
        customerData.latestInvoiceDate = invoice.created_at;
      }
    });
    
    // Convert the map to an array and calculate final values
    const customerHistory = Array.from(customerMap.values()).map(customer => {
      return {
        customerId: customer.customerId,
        customerName: customer.customerName,
        totalInvoices: customer.totalInvoices,
        paidInvoices: customer.paidInvoices,
        totalBilled: customer.totalBilled,
        totalPaid: customer.totalPaid,
        totalOutstanding: customer.totalBilled - customer.totalPaid,
        avgDaysOverdue: customer.overdueInvoiceCount > 0 
          ? customer.totalDaysOverdue / customer.overdueInvoiceCount 
          : 0,
        latestInvoiceDate: customer.latestInvoiceDate
      };
    });
    
    // Apply sorting
    const sortedCustomerHistory = customerHistory.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'customerName':
          comparison = a.customerName.localeCompare(b.customerName);
          break;
        case 'totalInvoices':
          comparison = a.totalInvoices - b.totalInvoices;
          break;
        case 'paidInvoices':
          comparison = a.paidInvoices - b.paidInvoices;
          break;
        case 'totalBilled':
          comparison = a.totalBilled - b.totalBilled;
          break;
        case 'totalPaid':
          comparison = a.totalPaid - b.totalPaid;
          break;
        case 'totalOutstanding':
          comparison = a.totalOutstanding - b.totalOutstanding;
          break;
        case 'avgDaysOverdue':
          comparison = a.avgDaysOverdue - b.avgDaysOverdue;
          break;
        case 'latestInvoiceDate':
          comparison = new Date(a.latestInvoiceDate).getTime() - new Date(b.latestInvoiceDate).getTime();
          break;
        default:
          comparison = a.totalBilled - b.totalBilled;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sortedCustomerHistory;
  } catch (error) {
    console.error('Error in getCustomerPaymentHistory:', error);
    throw error;
  }
}
