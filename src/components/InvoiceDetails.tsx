import React from 'react'

type InvoiceDetailsProps = {
  invoiceNumber: string
  dueDate: string
  dispatch: React.Dispatch<any> // Consider defining a more specific action type
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ invoiceNumber, dueDate, dispatch }) => {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Invoice #</label>
        <input
          value={invoiceNumber}
          onChange={e => dispatch({ invoiceNumber: e.target.value })}
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={e => dispatch({ dueDate: e.target.value })}
          className="w-full p-2 border rounded-lg"
        />
      </div>
    </div>
  )
}

export default InvoiceDetails
