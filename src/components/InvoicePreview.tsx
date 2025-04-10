import React from 'react';
import { InvoiceState } from '../types';
import InvoiceSummary from './InvoiceSummary';
import { getTemplateById } from '../templates/invoiceTemplates';
import { formatCurrency } from '../utils/currencies';

interface InvoicePreviewProps {
  state: InvoiceState;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  shippingCost?: number;
  discountAmount?: number;
}

const InvoicePreview = React.forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ state, subtotal, taxTotal, grandTotal, shippingCost = 0, discountAmount = 0 }, ref) => {
    // Get the selected template
    const template = getTemplateById(state.templateId);
    
    // Get custom colors or use template defaults
    const primaryColor = state.primaryColor || template.colors.primary;
    const secondaryColor = state.secondaryColor || template.colors.secondary;
    const accentColor = template.colors.accent;
    const backgroundColor = template.colors.background;
    const textColor = template.colors.text;
    
    // Format currency values
    const formatValue = (amount: number) => formatCurrency(amount, state.currency);

    // Determine CSS classes based on template
    const getButtonStyle = () => {
      return {
        backgroundColor: primaryColor,
        color: '#fff',
        borderRadius: template.cornerStyle === 'pill' ? '9999px' : 
                      template.cornerStyle === 'rounded' ? '0.375rem' : '0',
        padding: '0.5rem 1rem',
      };
    };
    
    // Determine table styles based on template
    const getTableStyle = () => {
      if (template.lineItemStyle === 'alternating') {
        return {
          row: 'border-t hover:bg-gray-50',
          evenRow: 'bg-gray-50',
          header: `bg-${primaryColor} bg-opacity-10`,
        };
      } else if (template.lineItemStyle === 'bordered') {
        return {
          row: 'border-t border-l border-r',
          evenRow: '',
          header: `bg-${primaryColor} bg-opacity-10 border`,
        };
      } else {
        // minimal
        return {
          row: 'border-b',
          evenRow: '',
          header: 'border-b-2',
        };
      }
    };
    
    const tableStyle = getTableStyle();

    return (
      <div 
        ref={ref} 
        className="p-8 md:p-12"
        style={{ 
          backgroundColor: backgroundColor,
          color: textColor,
          fontFamily: template.fontFamily,
        }}
      >
        {/* Invoice Preview */}
        <div 
          className={`max-w-4xl mx-auto ${template.showBorders ? 'border shadow-sm' : ''} rounded-${template.cornerStyle === 'pill' ? 'full' : template.cornerStyle === 'rounded' ? 'md' : 'none'} overflow-hidden`}
        >
          {/* Header */}
          <div 
            className={`p-6 md:p-8 ${template.showHeaderBorder ? 'border-b' : ''}`}
            style={{ 
              backgroundColor: template.layout === 'modern' ? primaryColor : 'transparent',
              color: template.layout === 'modern' ? '#fff' : 'inherit',
            }}
          >
            <div className={`flex flex-col ${template.layout === 'compact' ? 'md:flex-row md:justify-between md:items-center' : ''} gap-6`}>
              {/* Company Info with Logo - Position based on template */}
              <div className={`${template.logoPosition === 'right' ? 'order-2' : 'order-1'} ${template.layout === 'compact' ? 'flex items-center gap-4' : ''}`}>
                {state.logo && typeof state.logo === 'string' && (
                  <img 
                    src={state.logo} 
                    alt="Company Logo" 
                    className={`max-h-20 ${template.logoPosition === 'center' ? 'mx-auto mb-4' : template.logoPosition === 'right' ? 'ml-auto' : ''}`} 
                    style={{ zoom: state.logoZoom }} 
                  />
                )}
                
                <div className={template.logoPosition === 'center' ? 'text-center' : ''}>
                  <h2 
                    className="text-2xl md:text-3xl font-bold"
                    style={{ color: template.layout === 'modern' ? '#fff' : primaryColor }}
                  >
                    {state.company}
                  </h2>
                  <pre className={`mt-2 whitespace-pre-wrap ${template.layout === 'modern' ? 'text-white text-opacity-90' : 'text-gray-600'}`}>
                    {state.companyAddress}
                  </pre>
                </div>
              </div>
              
              {/* Invoice Info */}
              <div className={`${template.logoPosition === 'right' ? 'order-1' : 'order-2'} ${template.layout === 'compact' ? '' : 'text-right'}`}>
                <h1 
                  className="text-xl md:text-2xl font-bold"
                  style={{ color: template.layout === 'modern' ? '#fff' : primaryColor }}
                >
                  INVOICE
                </h1>
                <div className="mt-4 space-y-1">
                  <p><span className="font-semibold">Invoice #:</span> {state.invoiceNumber}</p>
                  <p><span className="font-semibold">Due Date:</span> {new Date(state.dueDate).toLocaleDateString()}</p>
                  {state.issueDate && (
                    <p><span className="font-semibold">Issue Date:</span> {new Date(state.issueDate).toLocaleDateString()}</p>
                  )}
                  {state.poNumber && (
                    <p><span className="font-semibold">PO #:</span> {state.poNumber}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bill To / Ship To Section */}
          <div className="px-6 md:px-8 py-6 bg-opacity-50" style={{ backgroundColor: secondaryColor }}>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500">BILL TO</h3>
                <p className="mt-2 text-lg font-medium">{state.client}</p>
                <pre className="text-gray-600 mt-1 whitespace-pre-wrap">
                  {state.clientAddress}
                </pre>
                {state.vatNumber && (
                  <p className="mt-1 text-gray-600">VAT: {state.vatNumber}</p>
                )}
              </div>
              
              {/* Shipping Info (if enabled) */}
              {state.showShipping && state.shipping && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">SHIP TO</h3>
                  <p className="mt-2 text-lg font-medium">{state.shipping.name || state.client}</p>
                  <p className="mt-1 text-gray-600 whitespace-pre-wrap">
                    {[
                      state.shipping.address,
                      state.shipping.city && state.shipping.state ? `${state.shipping.city}, ${state.shipping.state}` : (state.shipping.city || state.shipping.state),
                      state.shipping.zipCode,
                      state.shipping.country
                    ].filter(Boolean).join('\n')}
                  </p>
                  {state.shipping.method && (
                    <p className="mt-1 text-gray-600">Method: {state.shipping.method}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="px-6 md:px-8 py-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={tableStyle.header}>
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Qty</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    {state.showTaxColumn && (
                      <th className="py-3 px-4 text-right">Tax</th>
                    )}
                    <th className="text-right py-3 px-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {state.items.map((item, index) => (
                    <tr key={item.id} className={`${tableStyle.row} ${index % 2 === 1 ? tableStyle.evenRow : ''}`}>
                      <td className="py-3 px-4">
                        <div className="font-medium">{item.description}</div>
                        {item.unit && <div className="text-sm text-gray-500">Unit: {item.unit}</div>}
                      </td>
                      <td className="py-3 px-4 text-right">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">{formatValue(item.price)}</td>
                      {state.showTaxColumn && (
                        <td className="py-3 px-4 text-right">{item.taxRate}%</td>
                      )}
                      <td className="py-3 px-4 text-right">
                        {formatValue(item.quantity * item.price * (1 + (item.taxRate / 100)))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Section */}
            <div className="mt-8 flex justify-end">
              <div className="max-w-xs w-full">
                <table className="w-full">
                  <tbody>
                    <tr className="border-t">
                      <td className="py-2">Subtotal:</td>
                      <td className="py-2 text-right">{formatValue(subtotal)}</td>
                    </tr>
                    {state.showDiscount && discountAmount > 0 && (
                      <tr className="border-t">
                        <td className="py-2">Discount ({state.discount}%):</td>
                        <td className="py-2 text-right text-red-600">-{formatValue(discountAmount)}</td>
                      </tr>
                    )}
                    <tr className="border-t">
                      <td className="py-2">Tax Total:</td>
                      <td className="py-2 text-right">{formatValue(taxTotal)}</td>
                    </tr>
                    {state.showShipping && shippingCost > 0 && (
                      <tr className="border-t">
                        <td className="py-2">Shipping:</td>
                        <td className="py-2 text-right">{formatValue(shippingCost)}</td>
                      </tr>
                    )}
                    <tr className="border-t border-b">
                      <td className="py-2 font-bold">Total:</td>
                      <td className="py-2 text-right font-bold">{formatValue(grandTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className={`px-6 md:px-8 py-6 ${template.showFooterBorder ? 'border-t' : ''}`}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Notes Section */}
              <div>
                {state.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">NOTES</h3>
                    <pre className="mt-2 whitespace-pre-wrap text-sm">{state.notes}</pre>
                  </div>
                )}
              </div>
              
              {/* Terms/Payment Details Section */}
              <div>
                {state.terms && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-500">TERMS</h3>
                    <pre className="mt-2 whitespace-pre-wrap text-sm">{state.terms}</pre>
                  </div>
                )}
                
                {state.showPaymentDetails && state.bankDetails && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">PAYMENT DETAILS</h3>
                    <pre className="mt-2 whitespace-pre-wrap text-sm">{state.bankDetails}</pre>
                  </div>
                )}
              </div>
            </div>
            
            {/* Signature Section */}
            {state.showSignature && (
              <div className="mt-10 border-t pt-8">
                <div className="flex justify-between">
                  <div>
                    <div className="h-16 mb-1"></div>
                    <div className="border-t border-gray-400 w-48"></div>
                    <p className="mt-1 text-sm">Customer Signature</p>
                  </div>
                  <div>
                    <div className="h-16 mb-1"></div>
                    <div className="border-t border-gray-400 w-48"></div>
                    <p className="mt-1 text-sm">Company Representative</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = 'InvoicePreview';

export default InvoicePreview;
