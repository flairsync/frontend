const ISO_TO_SYMBOL: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  TND: 'TND',
  AED: 'AED',
  BRL: 'R$',
  CAD: 'CA$',
  AUD: 'AU$',
  JPY: '¥',
  INR: '₹',
  CHF: 'CHF',
  SGD: 'SG$',
};

const SYMBOL_TO_ISO: Record<string, string> = {
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  'R$': 'BRL',
  'CA$': 'CAD',
  'AU$': 'AUD',
  '¥': 'JPY',
  '₹': 'INR',
  'SG$': 'SGD',
};

/** Returns the display symbol for an ISO code. Falls back to the value itself for legacy symbol data. */
export function getCurrencySymbol(currency: string | undefined | null): string {
  if (!currency) return '$';
  return ISO_TO_SYMBOL[currency] ?? currency;
}

/** Normalises a stored value to an ISO 4217 code. Handles legacy symbol values. */
export function toIsoCurrencyCode(currency: string | undefined | null): string {
  if (!currency) return 'USD';
  return SYMBOL_TO_ISO[currency] ?? currency;
}
