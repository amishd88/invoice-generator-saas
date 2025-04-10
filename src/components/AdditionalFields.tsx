import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Truck, CreditCard, FileText, Percent, Tag, X } from 'lucide-react';
import { ShippingInfo, InvoiceState, TaxInfo } from '../types';
import ValidationError from './ValidationError';

interface AdditionalFieldsProps {
  state: InvoiceState;
  dispatch: React.Dispatch<any>;
  validationErrors?: any;
}

const AdditionalFields: React.FC<AdditionalFieldsProps> = ({
  state,
  dispatch,
  validationErrors = {},
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    dispatch({ type: 'updateField', field: e.target.name, value: e.target.value });
  };

  const handleToggleField = (field: 'showShipping' | 'showDiscount' | 'showTaxColumn' | 'showSignature' | 'showPaymentDetails') => {
    dispatch({ type: 'TOGGLE_FIELD', field, value: !state[field] });
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedShipping = {
      ...state.shipping,
      [name]: value,
    };
    dispatch({ type: 'UPDATE_SHIPPING', shipping: updatedShipping });
  };

  // Handle adding a new tax
  const handleAddTax = () => {
    const newTaxId = `tax-${Date.now()}`;
    const newTax: TaxInfo = {
      id: newTaxId,
      name: 'New Tax',
      rate: 0,
    };
    
    dispatch({ type: 'ADD_TAX', tax: newTax });
  };

  // Handle removing a tax
  const handleRemoveTax = (taxId: string) => {
    dispatch({ type: 'REMOVE_TAX', taxId });
  };

  // Toggle expand/collapse
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="bg-white border rounded-md shadow-sm">
      <div
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={toggleExpand}
      >
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-gray-500" />
          Additional Invoice Options
        </h3>
        <div className="text-gray-500">
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Terms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms
              </label>
              <input
                type="text"
                name="paymentTerms"
                value={state.paymentTerms || ''}
                onChange={handleChange}
                placeholder="e.g., Net 30, Due on Receipt"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {/* PO Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Order Number
              </label>
              <input
                type="text"
                name="poNumber"
                value={state.poNumber || ''}
                onChange={handleChange}
                placeholder="PO-12345"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {/* VAT/Tax Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                VAT/Tax Number
              </label>
              <input
                type="text"
                name="vatNumber"
                value={state.vatNumber || ''}
                onChange={handleChange}
                placeholder="VAT123456789"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {/* Due Date Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due in Days (from issue date)
              </label>
              <input
                type="number"
                name="dueInDays"
                value={state.dueInDays || ''}
                onChange={handleChange}
                min="0"
                placeholder="30"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {/* Bank Details */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Bank Details
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showPaymentDetails"
                    checked={state.showPaymentDetails}
                    onChange={() => handleToggleField('showPaymentDetails')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showPaymentDetails" className="ml-2 text-sm text-gray-700">
                    Show on Invoice
                  </label>
                </div>
              </div>
              <textarea
                name="bankDetails"
                value={state.bankDetails || ''}
                onChange={handleChange}
                rows={2}
                placeholder="Account Name: Company Inc.&#10;Account Number: 1234567890&#10;Routing Number: 123456789"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {/* Shipping Details Section */}
            <div className="md:col-span-2 border-t pt-4 mt-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-gray-500" />
                  Shipping Information
                </h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showShipping"
                    checked={state.showShipping}
                    onChange={() => handleToggleField('showShipping')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showShipping" className="ml-2 text-sm text-gray-700">
                    Show on Invoice
                  </label>
                </div>
              </div>

              {state.showShipping && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={state.shipping?.name || ''}
                      onChange={handleShippingChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Method
                    </label>
                    <input
                      type="text"
                      name="method"
                      value={state.shipping?.method || ''}
                      onChange={handleShippingChange}
                      placeholder="e.g., Standard, Express"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={state.shipping?.address || ''}
                      onChange={handleShippingChange}
                      rows={2}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={state.shipping?.city || ''}
                      onChange={handleShippingChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={state.shipping?.state || ''}
                      onChange={handleShippingChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={state.shipping?.zipCode || ''}
                      onChange={handleShippingChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={state.shipping?.country || ''}
                      onChange={handleShippingChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Cost
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">
                          {state.currency.symbol}
                        </span>
                      </div>
                      <input
                        type="number"
                        name="cost"
                        value={state.shipping?.cost || ''}
                        onChange={handleShippingChange}
                        className="block w-full pl-7 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Discount Section */}
            <div className="md:col-span-2 border-t pt-4 mt-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium flex items-center">
                  <Percent className="h-4 w-4 mr-2 text-gray-500" />
                  Discount
                </h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showDiscount"
                    checked={state.showDiscount}
                    onChange={() => handleToggleField('showDiscount')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showDiscount" className="ml-2 text-sm text-gray-700">
                    Show on Invoice
                  </label>
                </div>
              </div>

              {state.showDiscount && (
                <div className="flex items-center mt-2">
                  <label className="block text-sm font-medium text-gray-700 mr-2">
                    Overall Discount:
                  </label>
                  <div className="relative rounded-md shadow-sm w-32">
                    <input
                      type="number"
                      name="discount"
                      value={state.discount || ''}
                      onChange={handleChange}
                      className="block w-full pr-8 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      step="0.1"
                      min="0"
                      max="100"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tax Rates Section */}
            <div className="md:col-span-2 border-t pt-4 mt-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-gray-500" />
                  Tax Rates
                </h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showTaxColumn"
                    checked={state.showTaxColumn}
                    onChange={() => handleToggleField('showTaxColumn')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showTaxColumn" className="ml-2 text-sm text-gray-700">
                    Show Tax Column
                  </label>
                </div>
              </div>

              {state.taxes && state.taxes.length > 0 && (
                <div className="space-y-2 mt-2">
                  {state.taxes.map((tax) => (
                    <div key={tax.id} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tax.name}
                        onChange={(e) => 
                          dispatch({
                            type: 'UPDATE_TAX_NAME',
                            taxId: tax.id,
                            name: e.target.value,
                          })
                        }
                        className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Tax Name"
                      />
                      <div className="relative rounded-md shadow-sm w-32">
                        <input
                          type="number"
                          value={tax.rate}
                          onChange={(e) => 
                            dispatch({
                              type: 'UPDATE_TAX_RATE',
                              taxId: tax.id,
                              rate: parseFloat(e.target.value),
                            })
                          }
                          className="block w-full pr-8 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          step="0.1"
                          min="0"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTax(tax.id)}
                        className="rounded-md border border-transparent p-1 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleAddTax}
                className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Tax Rate
              </button>
            </div>

            {/* Signature Section */}
            <div className="md:col-span-2 border-t pt-4 mt-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                  Signature
                </h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showSignature"
                    checked={state.showSignature}
                    onChange={() => handleToggleField('showSignature')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showSignature" className="ml-2 text-sm text-gray-700">
                    Show on Invoice
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionalFields;
