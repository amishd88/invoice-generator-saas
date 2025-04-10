import React, { useState } from 'react';
import { Paintbrush, Settings, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { invoiceTemplates, TemplateConfig } from '../templates/invoiceTemplates';
import { currencies } from '../utils/currencies';
import { InvoiceState, Currency } from '../types';
import TemplateSelector from './TemplateSelector';
import CurrencySelector from './CurrencySelector';

interface CustomizationPanelProps {
  state: InvoiceState;
  dispatch: React.Dispatch<any>;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ state, dispatch }) => {
  const [expanded, setExpanded] = useState(false);
  const selectedTemplate = invoiceTemplates.find(t => t.id === state.templateId) || invoiceTemplates[0];

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    dispatch({ type: 'SET_TEMPLATE', templateId });
  };

  // Handle currency selection
  const handleSelectCurrency = (currency: Currency) => {
    dispatch({ type: 'SET_CURRENCY', currency });
  };

  // Handle color changes
  const handleColorChange = (key: 'primaryColor' | 'secondaryColor', color: string) => {
    dispatch({ type: 'updateField', field: key, value: color });
  };

  return (
    <div className="bg-white rounded-lg shadow mb-4">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Paintbrush className="h-5 w-5 mr-2 text-gray-500" />
          Invoice Customization
        </h3>
        <div className="text-gray-500">
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <TemplateSelector 
              selectedTemplate={state.templateId}
              onSelectTemplate={handleSelectTemplate}
            />
            <CurrencySelector
              selectedCurrency={state.currency}
              onSelectCurrency={handleSelectCurrency}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Template Colors</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Primary Color</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={state.primaryColor || selectedTemplate.colors.primary}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="h-8 w-8 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={state.primaryColor || selectedTemplate.colors.primary}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="ml-2 block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  {state.primaryColor && (
                    <button
                      type="button"
                      onClick={() => handleColorChange('primaryColor', '')}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-500"
                      title="Reset to template default"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Secondary Color</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={state.secondaryColor || selectedTemplate.colors.secondary}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="h-8 w-8 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={state.secondaryColor || selectedTemplate.colors.secondary}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="ml-2 block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  {state.secondaryColor && (
                    <button
                      type="button"
                      onClick={() => handleColorChange('secondaryColor', '')}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-500"
                      title="Reset to template default"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t mt-6 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Template Preview</h4>
            <div className="bg-gray-50 p-4 rounded-md border">
              <div 
                className="w-full h-32 border rounded-md overflow-hidden"
                style={{ 
                  backgroundColor: state.secondaryColor || selectedTemplate.colors.secondary,
                  borderColor: state.primaryColor || selectedTemplate.colors.primary,
                  borderTopWidth: '4px',
                }}
              >
                <div className="h-12 border-b" style={{ 
                  borderColor: state.primaryColor || selectedTemplate.colors.primary,
                  opacity: 0.1
                }}></div>
                <div className="flex p-4">
                  <div className="w-1/2">
                    <div className="h-4 w-20 rounded" style={{ backgroundColor: state.primaryColor || selectedTemplate.colors.primary }}></div>
                    <div className="h-2 w-24 rounded mt-2" style={{ backgroundColor: '#e5e7eb' }}></div>
                    <div className="h-2 w-32 rounded mt-1" style={{ backgroundColor: '#e5e7eb' }}></div>
                  </div>
                  <div className="w-1/2 flex justify-end">
                    <div className="h-8 w-24 rounded" style={{ 
                      backgroundColor: state.primaryColor || selectedTemplate.colors.primary,
                      opacity: 0.2
                    }}></div>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center">
                Preview of the {selectedTemplate.name} template with your customizations
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizationPanel;
