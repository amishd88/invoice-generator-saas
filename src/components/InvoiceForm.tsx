import React from 'react'
import CompanyInfo from './CompanyInfo'
import ClientInfo from './ClientInfo'
import InvoiceDetails from './InvoiceDetails'
import LineItems from './LineItems'
import LogoUploader from './LogoUploader'
import CustomerSelector from './database/CustomerSelector'
import ProductSelector from './database/ProductSelector'
import ValidationError from './ValidationError'

import { InvoiceState, Customer, Product } from '../types'
import { ValidationErrors } from '../utils/validation'

type InvoiceFormProps = {
  state: InvoiceState
  dispatch: React.Dispatch<any>
  logoError: string | null
  handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleClearLogo: () => void
  handleLogoZoomChange: (zoom: number) => void
  handleSelectCustomer: (customer: Customer) => void
  handleSaveCurrentAsCustomer: () => void
  handleAddProductToItems: (product: Product) => void
  validationErrors?: ValidationErrors
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  state,
  dispatch,
  logoError,
  handleLogoUpload,
  handleClearLogo,
  handleLogoZoomChange,
  handleSelectCustomer,
  handleSaveCurrentAsCustomer,
  handleAddProductToItems,
  validationErrors = {}
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    dispatch({ type: 'updateField', field: e.target.name, value: e.target.value })
  }

  return (
    <div className="p-8 space-y-6">
      <LogoUploader
        logo={state.logo}
        logoError={logoError}
        handleLogoUpload={handleLogoUpload}
        handleClearLogo={handleClearLogo}
        logoZoom={state.logoZoom}
        handleLogoZoomChange={handleLogoZoomChange}
      />
      
      <div className="grid grid-cols-2 gap-6"> {/* Grid container for side-by-side layout */}
        <div>
          <CompanyInfo 
            company={state.company} 
            companyAddress={state.companyAddress} 
            dispatch={dispatch} 
          />
          <ValidationError error={validationErrors.company} />
          <ValidationError error={validationErrors.companyAddress} />
        </div>
        <div>
          <ClientInfo 
            client={state.client} 
            clientAddress={state.clientAddress} 
            dispatch={dispatch} 
          />
          <ValidationError error={validationErrors.client} />
          <ValidationError error={validationErrors.clientAddress} />
          <CustomerSelector
            currentCustomer={{
              name: state.client,
              address: state.clientAddress
            }}
            onSelectCustomer={handleSelectCustomer}
            onSaveCurrentAsCustomer={handleSaveCurrentAsCustomer}
          />
        </div>
      </div>
      
      <div>
        <InvoiceDetails 
          invoiceNumber={state.invoiceNumber}
          dueDate={state.dueDate}
          dispatch={dispatch} 
        />
        <ValidationError error={validationErrors.invoiceNumber} />
        <ValidationError error={validationErrors.dueDate} />
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium font-lexend">Line Items</h3>
        <div className="flex space-x-2">
          <ProductSelector 
            onSelectProduct={() => {}} 
            onAddItemFromProduct={handleAddProductToItems} 
          />
          <button
            type="button"
            className="flex items-center px-3 py-2 bg-secondary-50 text-secondary-700 rounded hover:bg-secondary-100 transition-colors duration-200"
            onClick={() => dispatch({ type: 'ADD_ITEM' })}
          >
            + Add Blank Item
          </button>
        </div>
      </div>
      
      <div>
        <LineItems 
          items={state.items} 
          dispatch={dispatch} 
          errors={validationErrors.items}
        />
        {validationErrors.general && (
          <div className="mt-2">
            <ValidationError error={validationErrors.general} />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="form-label">Notes (Optional)</label>
        <div className="mt-1">
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="form-input"
            placeholder="Enter any notes here..."
            value={state.notes}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label htmlFor="terms" className="form-label">Terms (Optional)</label>
        <div className="mt-1">
          <textarea
            id="terms"
            name="terms"
            rows={3}
            className="form-input"
            placeholder="Enter payment terms here..."
            value={state.terms}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  )
}

export default InvoiceForm