const POPULAR_EMAIL_DOMAINS = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'live.com',
    'aol.com',
    'protonmail.com',
    'msn.com',
    'gmx.com',
    'yandex.com',
    'zoho.com',
    'mail.com',
    'comcast.net',
];

// Max edits (substitution/insertion/deletion/adjacent transposition) before a
// domain is no longer considered a "typo" of a popular one. Kept at 1 so
// short/unrelated domains (e.g. "abc.io") never get falsely matched.
const MAX_TYPO_DISTANCE = 1;

function damerauLevenshteinDistance(a: string, b: string): number {
    const d: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) d[i][0] = i;
    for (let j = 0; j <= b.length; j++) d[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            d[i][j] = Math.min(
                d[i - 1][j] + 1,
                d[i][j - 1] + 1,
                d[i - 1][j - 1] + cost
            );

            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
            }
        }
    }

    return d[a.length][b.length];
}

/**
 * Returns a corrected email when the domain looks like a typo of a popular
 * provider (e.g. "user@gmial.com" -> "user@gmail.com"), or null when the
 * email is malformed, the domain is already known, or no close match exists.
 */
export function suggestEmailCorrection(email: string): string | null {
    const trimmed = email.trim();
    const atIndex = trimmed.lastIndexOf('@');
    if (atIndex <= 0 || atIndex === trimmed.length - 1) return null;

    const localPart = trimmed.slice(0, atIndex);
    const domain = trimmed.slice(atIndex + 1).toLowerCase();
    if (POPULAR_EMAIL_DOMAINS.includes(domain)) return null;

    let closestDomain: string | null = null;
    let closestDistance = Infinity;

    for (const candidate of POPULAR_EMAIL_DOMAINS) {
        const distance = damerauLevenshteinDistance(domain, candidate);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestDomain = candidate;
        }
    }

    if (!closestDomain || closestDistance === 0 || closestDistance > MAX_TYPO_DISTANCE) {
        return null;
    }

    return `${localPart}@${closestDomain}`;
}
