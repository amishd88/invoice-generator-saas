import React from 'react';
import { updateInvoiceStatus } from '../../services/invoiceService';

export const INVOICE_STATUSES = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

interface InvoiceStatusManagerProps {
  invoiceId: string;
  currentStatus: string;
  dueDate?: string;
  onStatusUpdated: (newStatus: string) => void;
}

const InvoiceStatusManager: React.FC<InvoiceStatusManagerProps> = ({
  invoiceId,
  currentStatus,
  dueDate,
  onStatusUpdated,
}) => {
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Check if invoice is overdue (system determined)
  const isOverdue = React.useMemo(() => {
    if (!dueDate) return false;
    const now = new Date();
    const due = new Date(dueDate);
    return due < now && currentStatus === INVOICE_STATUSES.SENT;
  }, [dueDate, currentStatus]);

  // If overdue and status isn't already set to overdue, update it
  React.useEffect(() => {
    if (isOverdue && currentStatus !== INVOICE_STATUSES.OVERDUE) {
      handleStatusChange(INVOICE_STATUSES.OVERDUE);
    }
  }, [isOverdue, currentStatus]);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    
    // Prevent manually setting to "OVERDUE" as it's system determined
    if (newStatus === INVOICE_STATUSES.OVERDUE) return;
    
    setIsUpdating(true);
    try {
      await updateInvoiceStatus(invoiceId, newStatus);
      onStatusUpdated(newStatus);
      // Status update success
    } catch (error) {
      console.error('Failed to update invoice status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center">
      <span className="mr-2 text-sm font-medium text-gray-600">Status:</span>
      <select
        className={`rounded-md border ${getStatusColor(currentStatus)} py-1 px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500`}
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isUpdating || currentStatus === INVOICE_STATUSES.OVERDUE}
      >
        <option value={INVOICE_STATUSES.DRAFT}>Draft</option>
        <option value={INVOICE_STATUSES.SENT}>Sent</option>
        <option value={INVOICE_STATUSES.PAID}>Paid</option>
        <option value={INVOICE_STATUSES.CANCELLED}>Cancelled</option>
        {/* OVERDUE is system determined and only shown if the invoice is currently overdue */}
        {currentStatus === INVOICE_STATUSES.OVERDUE && (
          <option value={INVOICE_STATUSES.OVERDUE}>Overdue</option>
        )}
      </select>
      {isUpdating && (
        <div className="ml-2 animate-spin h-4 w-4 border-2 border-purple-500 rounded-full border-t-transparent"></div>
      )}
    </div>
  );
};

// Helper function to determine UI color based on status
const getStatusColor = (status: string): string => {
  switch (status) {
    case INVOICE_STATUSES.DRAFT:
      return 'border-gray-300 bg-gray-100 text-gray-800';
    case INVOICE_STATUSES.SENT:
      return 'border-blue-300 bg-blue-100 text-blue-800';
    case INVOICE_STATUSES.PAID:
      return 'border-green-300 bg-green-100 text-green-800';
    case INVOICE_STATUSES.OVERDUE:
      return 'border-red-300 bg-red-100 text-red-800';
    case INVOICE_STATUSES.CANCELLED:
      return 'border-gray-600 bg-gray-300 text-gray-800';
    default:
      return 'border-gray-300';
  }
};

export default InvoiceStatusManager;