// Shared with BusinessLocationPicker.tsx so the SelectItem `value` (which must match the
// Select's controlled `value` for Radix to resolve a selection) and the test that guards this
// behavior can never drift out of sync with each other.
const CATALAN_LOWERCASE_CONNECTORS = new Set(['la', 'de', 'del', 'les', 'els']);

export function capitalizeCity(name: string): string {
    return name
        .split(' ')
        .map((word, index) => {
            if (index > 0 && CATALAN_LOWERCASE_CONNECTORS.has(word.toLowerCase())) {
                return word.toLowerCase();
            }
            return word
                .split('-')
                .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
                .join('-');
        })
        .join(' ');
}
