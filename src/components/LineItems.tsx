import React from 'react'
import { Plus } from 'lucide-react'
import LineItemRow from './LineItemRow'
import { LineItem } from '../types'

type LineItemsProps = {
  items: LineItem[]
  dispatch: React.Dispatch<any>
  errors?: string[] // Array of validation errors for line items
}

const LineItems: React.FC<LineItemsProps> = ({ items, dispatch, errors = [] }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Items</h3>
        <button
          onClick={() => dispatch({ type: 'ADD_ITEM' })}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          aria-label="Add new item"
        >
          <Plus size={18} /> Add Item
        </button>
      </div>

      {items.length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-center text-yellow-800">
          At least one line item is required. Click "Add Item" to add a new line item.
        </div>
      )}

      {items.map((item, index) => (
        <LineItemRow 
          key={item.id} 
          item={item} 
          dispatch={dispatch} 
          error={errors[index]}
        />
      ))}
    </div>
  )
}

export default LineItems