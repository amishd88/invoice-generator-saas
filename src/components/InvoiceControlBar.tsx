import React from 'react'
import { Printer, CalendarDays, Download } from 'lucide-react'

type InvoiceControlBarProps = {
  isEditing: boolean
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  handlePrint: () => void
}

const InvoiceControlBar: React.FC<InvoiceControlBarProps> = ({ isEditing, setIsEditing, handlePrint }) => {
  return (
    <div className="p-4 border-b flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">Invoice Generator</h1>
      <div className="flex gap-2">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          {isEditing ? <Printer size={18} /> : <CalendarDays size={18} />}
          {isEditing ? 'Preview Invoice' : 'Edit Invoice'}
        </button>
        {!isEditing && (
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download size={18} />
            Download PDF
          </button>
        )}
      </div>
    </div>
  )
}

export default InvoiceControlBar
