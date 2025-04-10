import { Currency } from '../types';

// Define available currencies
export const currencies: Currency[] = [
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimal: '.',
    thousand: ',',
    precision: 2,
    format: '%s%v' // $1.00
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimal: ',',
    thousand: '.',
    precision: 2,
    format: '%v %s' // 1,00 €
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimal: '.',
    thousand: ',',
    precision: 2,
    format: '%s%v' // £1.00
  },
  {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimal: '.',
    thousand: ',',
    precision: 0,
    format: '%s%v' // ¥100
  },
  {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    decimal: '.',
    thousand: ',',
    precision: 2,
    format: '%s%v' // C$1.00
  },
  {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    decimal: '.',
    thousand: ',',
    precision: 2,
    format: '%s%v' // A$1.00
  },
  {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    decimal: '.',
    thousand: ',',
    precision: 2,
    format: '%s%v' // ₹1.00
  },
  {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    decimal: '.',
    thousand: ',',
    precision: 2,
    format: '%s%v' // ¥1.00
  },
  {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    decimal: ',',
    thousand: '.',
    precision: 2,
    format: '%s%v' // R$1,00
  }
];

// Get a currency by its code
export function getCurrencyByCode(code: string): Currency {
  const currency = currencies.find(curr => curr.code === code);
  return currency || currencies[0]; // Default to USD if not found
}

// Format a number according to currency specifications
export function formatCurrency(amount: number, currency: Currency): string {
  // Handle number formatting
  let formattedAmount = amount.toFixed(currency.precision);
  
  // Add thousand separators
  const parts = formattedAmount.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousand);
  
  // Reassemble with decimal
  if (currency.precision > 0) {
    formattedAmount = parts.join(currency.decimal);
  } else {
    formattedAmount = parts[0];
  }
  
  // Apply currency format
  return currency.format.replace('%s', currency.symbol).replace('%v', formattedAmount);
}

// Convert amount from one currency to another
// This is a placeholder - in a real application, you'd use an API
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  // In a real application, you would integrate with a currency conversion API
  // For now, we'll use static conversion rates for demonstration
  const rates = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.75,
    JPY: 110,
    CAD: 1.25,
    AUD: 1.35,
    INR: 74,
    CNY: 6.5,
    BRL: 5.3
  };
  
  // Convert to USD first (as base currency)
  const amountInUSD = fromCurrency === 'USD' ? amount : amount / rates[fromCurrency as keyof typeof rates];
  
  // Then convert from USD to target currency
  return toCurrency === 'USD' ? amountInUSD : amountInUSD * rates[toCurrency as keyof typeof rates];
}
