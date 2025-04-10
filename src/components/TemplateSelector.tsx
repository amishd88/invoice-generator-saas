import React, { useState } from 'react';
import { Check, ChevronDown, Palette } from 'lucide-react';
import { invoiceTemplates, TemplateConfig } from '../templates/invoiceTemplates';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedTemplateObj = invoiceTemplates.find(t => t.id === selectedTemplate) || invoiceTemplates[0];

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center px-3 py-2 text-sm font-medium bg-white border rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Palette className="w-4 h-4 mr-2 text-purple-700" />
        <span className="mr-1">Template:</span>
        <span className="font-medium">{selectedTemplateObj.name}</span>
        <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-96 bg-white shadow-lg rounded-md border overflow-hidden">
          <div className="p-2 border-b">
            <h3 className="text-sm font-semibold text-gray-700">Choose Invoice Template</h3>
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {invoiceTemplates.map((template) => (
              <li
                key={template.id}
                className={`relative cursor-pointer px-3 py-2 flex items-start hover:bg-gray-50 ${
                  selectedTemplate === template.id ? 'bg-purple-50' : ''
                }`}
                onClick={() => {
                  onSelectTemplate(template.id);
                  setIsOpen(false);
                }}
              >
                <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded border overflow-hidden mr-3">
                  {/* Template preview */}
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundColor: template.colors.secondary,
                      borderTop: `3px solid ${template.colors.primary}`,
                    }}
                  ></div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">{template.name}</p>
                    {selectedTemplate === template.id && (
                      <Check className="h-5 w-5 text-purple-700" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
