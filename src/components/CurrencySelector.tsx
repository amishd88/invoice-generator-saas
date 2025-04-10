import React, { useState } from 'react';
import { ChevronDown, DollarSign, Search } from 'lucide-react';
import { Currency } from '../types';
import { currencies } from '../utils/currencies';

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  onSelectCurrency: (currency: Currency) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onSelectCurrency,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter currencies based on search query
  const filteredCurrencies = searchQuery
    ? currencies.filter(
        (currency) =>
          currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          currency.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currencies;

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center px-3 py-2 text-sm font-medium bg-white border rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
        <span className="font-medium">{selectedCurrency.code} ({selectedCurrency.symbol})</span>
        <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-72 bg-white shadow-lg rounded-md border overflow-hidden">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search currencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {filteredCurrencies.map((currency) => (
              <li
                key={currency.code}
                className={`relative cursor-pointer px-3 py-2 hover:bg-gray-50 ${
                  selectedCurrency.code === currency.code ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  onSelectCurrency(currency);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center">
                  <span className="w-8 text-center text-lg font-semibold">{currency.symbol}</span>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{currency.name}</p>
                    <p className="text-xs text-gray-500">{currency.code}</p>
                  </div>
                </div>
              </li>
            ))}
            {filteredCurrencies.length === 0 && (
              <li className="py-3 px-4 text-sm text-gray-500 text-center">
                No currencies found matching "{searchQuery}"
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
