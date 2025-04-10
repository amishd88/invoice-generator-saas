import React from 'react'
import { Trash2 } from 'lucide-react'
import { LineItem } from '../types'
import { isValidNumber } from '../utils/validation'

type LineItemRowProps = {
  item: LineItem
  dispatch: React.Dispatch<any>
  error?: string
}

const LineItemRow: React.FC<LineItemRowProps> = ({ item, dispatch, error }) => {
  // Input validation handlers
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    dispatch({
      type: 'UPDATE_ITEM',
      id: item.id,
      field: 'quantity',
      value: value === '' ? '' : Math.max(1, parseInt(value) || 0)
    })
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numericValue = parseFloat(value)
    
    dispatch({
      type: 'UPDATE_ITEM',
      id: item.id,
      field: 'price',
      value: value === '' ? 0 : (isNaN(numericValue) ? 0 : numericValue)
    })
  }

  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numericValue = parseFloat(value)
    
    dispatch({
      type: 'UPDATE_ITEM',
      id: item.id,
      field: 'taxRate',
      value: value === '' ? 0 : (isNaN(numericValue) ? 0 : numericValue)
    })
  }

  // Calculate the styles for inputs based on validation
  const getInputStyles = (value: any, validateFn: (val: any) => boolean) => {
    const isValid = validateFn(value)
    const baseClasses = "p-2 border rounded-lg"
    
    if (value === '' || value === 0) {
      return `${baseClasses} border-red-300`
    }
    
    return isValid 
      ? baseClasses 
      : `${baseClasses} border-red-300 bg-red-50`
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-4 items-start">
        <input
          value={item.description}
          onChange={e => dispatch({
            type: 'UPDATE_ITEM',
            id: item.id,
            field: 'description',
            value: e.target.value
          })}
          placeholder="Item description"
          className={`flex-1 ${item.description.trim() === '' ? 'border-red-300' : 'border'} p-2 rounded-lg`}
        />
        <input
          type="number"
          value={item.quantity}
          onChange={handleQuantityChange}
          className={`w-20 ${getInputStyles(item.quantity, val => isValidNumber(val) && val > 0)}`}
          min="1"
          step="1"
        />
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500">$</span>
          <input
            type="number"
            value={item.price}
            onChange={handlePriceChange}
            placeholder="0.00"
            className={`w-32 pl-6 ${getInputStyles(item.price, isValidNumber)}`}
            min="0"
            step="0.01"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Tax Rate (%)</label>
          <input
            type="number"
            value={item.taxRate}
            onChange={handleTaxRateChange}
            className={`w-16 ${getInputStyles(item.taxRate, isValidNumber)}`}
            min="0"
            max="100"
            step="0.1"
          />
        </div>
        <button
          onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          aria-label="Remove item"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      {/* Show error message if present */}
      {error && (
        <div className="text-sm text-red-600 ml-2">{error}</div>
      )}
    </div>
  )
}

export default LineItemRow