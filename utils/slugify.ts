// P1-17 (QA, 2026-11-18): the inline version of this in BusinessSettingsGeneralDetails.tsx
// just lowercased and stripped anything outside [a-z0-9-] — so "Retest Café!" lost the "é"
// (stripped, not transliterated) and the space (stripped, not turned into a hyphen),
// producing "retestcaf" instead of "retest-cafe". This normalizes diacritics away first and
// turns runs of whitespace/punctuation into single hyphens, so accented/spaced input still
// produces a sensible slug.
export function slugify(input: string): string {
    return input
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "") // strip combining diacritical marks
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // runs of anything non-alphanumeric -> one hyphen
        .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}
