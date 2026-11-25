// Single source of truth for which countries require a Tax ID before a business can
// take orders, and what a valid Tax ID looks like for each — mirrors
// TAX_ID_REQUIRED_COUNTRY_CODES / isTaxIdFormatInvalid in the backend's
// src/business/utils/tax-id.util.ts. Was duplicated across the owner layout header,
// the welcome checklist and the tax settings form; collected here after a 4th call site
// (the pre-publish warning) made that one more copy than was worth repeating.
//
// Add "ES" here the same day FiscalAdapterFactory's 'ES' case is flipped on, not before —
// Spain stays on the generic fiscal adapter, which doesn't need a Tax ID to complete orders,
// so warning Spanish businesses about it here would be a false alarm.
export const FISCAL_ID_REQUIRED_COUNTRIES = new Set(["AD"]);

export const TAX_ID_FORMAT_BY_COUNTRY: Record<string, RegExp> = {
    AD: /^[A-Z]-\d{6}-[A-Z]$/i,
    ES: /^[A-Z0-9]\d{6,7}[A-Z0-9]$/i,
    FR: /^(?:\d{14}|FR[A-Z0-9]{2}\d{9})$/i,
};
