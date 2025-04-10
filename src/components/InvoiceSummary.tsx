import React from 'react'

type InvoiceSummaryProps = {
  subtotal: number
  taxTotal: number
  grandTotal: number
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({ subtotal, taxTotal, grandTotal }) => {
  return (
    <>
      <div className="flex justify-between py-2">
        <span>Subtotal:</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between py-2 border-t">
        <span>Tax:</span>
        <span>${taxTotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between py-2 border-t font-semibold">
        <span>Grand Total:</span>
        <span>${grandTotal.toFixed(2)}</span>
      </div>
    </>
  )
}

export default InvoiceSummary
