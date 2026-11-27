// KAN-90: Radar's `near` param is only a proximity *bias* for ranking autocomplete results,
// not a hard filter — in a large country like France it still let results from other towns
// outrank/appear alongside the right one (e.g. "10 Rue de Rivoli" with city "Paris" surfacing
// only a match in Elne, 66200). This filters the already-fetched results down to the typed
// city (case/diacritic-insensitive) whenever at least one match exists, and falls back to the
// unfiltered list rather than showing nothing if the city name doesn't line up with how Radar
// labels it (e.g. a borough vs. the parent city name).

export function normalizeCityName(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .trim()
        .toLowerCase();
}

export interface AddressWithCity {
    city?: string | null;
}

export function filterAddressesByCity<T extends AddressWithCity>(
    addresses: T[],
    city: string | undefined,
): T[] {
    if (!city) return addresses;
    const normalizedCity = normalizeCityName(city);
    const cityMatches = addresses.filter(
        (a) => !!a.city && normalizeCityName(a.city) === normalizedCity,
    );
    return cityMatches.length > 0 ? cityMatches : addresses;
}
