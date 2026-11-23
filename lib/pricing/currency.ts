/**
 * Multi-currency support with exchange rates
 */

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export const supportedCurrencies: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
];

// Mock exchange rates (in production, fetch from API)
const mockExchangeRates: Record<string, number> = {
  'EUR': 1.00,
  'USD': 1.09,
  'GBP': 0.86,
  'CHF': 0.95,
  'CAD': 1.46,
  'AUD': 1.64,
};

/**
 * Convert amount from EUR to target currency
 */
export function convertCurrency(amountEUR: number, targetCurrency: string): number {
  const rate = mockExchangeRates[targetCurrency] || 1;
  return amountEUR * rate;
}

/**
 * Format amount in specific currency
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = supportedCurrencies.find(c => c.code === currencyCode);
  
  return new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
}

/**
 * Get exchange rate from EUR
 */
export function getExchangeRate(currencyCode: string): number {
  return mockExchangeRates[currencyCode] || 1;
}

/**
 * Get all exchange rates
 */
export function getAllExchangeRates(): Record<string, number> {
  return { ...mockExchangeRates };
}
