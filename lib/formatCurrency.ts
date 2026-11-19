// P1-29 (QA round 4, 2026-11-19): `locale` defaults to undefined (the browser/OS locale),
// same as before — but that means a user who picked French/Spanish/Catalan in the app while
// their OS is set to English still saw English-style "€6.50" instead of "6,50 €". Pass the
// active i18next language explicitly (e.g. `i18n.language`) wherever it's available so the
// number format follows the app's language, not the device's.
export function formatCurrency(amount: number, currency: string, locale?: string): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}
