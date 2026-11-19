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

// P0-2 (QA round 4, 2026-11-19): slugify()'s trailing-hyphen trim runs on every keystroke in
// BusinessSettingsGeneralDetails, so a hyphen/space typed at the end of the current value (e.g.
// the "-" in "retest-" while typing "retest-cafe") gets stripped before the next character
// arrives, silently eating it. This partial variant is for live typing: it only lowercases,
// strips diacritics, drops invalid characters and turns whitespace into hyphens, without
// collapsing repeats or trimming — so an in-progress trailing hyphen survives until the user
// types past it. Call the full slugify() above on blur/submit/paste to normalize the result.
export function slugifyPartial(input: string): string {
    return input
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "") // strip combining diacritical marks
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // drop invalid characters, keep existing hyphens/spaces
        .replace(/\s/g, "-"); // turn whitespace into hyphens
}
