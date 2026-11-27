import { test } from "node:test";
import assert from "node:assert/strict";
import { filterAddressesByCity, normalizeCityName } from "./addressCityFilter.ts";

// KAN-90: with City = "Paris", "10 Rue de Rivoli" must not surface only the Elne (66200) match.
test("filters out results from a different city when a same-named-street match for the typed city exists", () => {
    const addresses = [
        { formattedAddress: "10 Rue de Rivoli, 66200 Elne", city: "Elne" },
        { formattedAddress: "10 Rue de Rivoli, 75001 Paris", city: "Paris" },
    ];
    const result = filterAddressesByCity(addresses, "Paris");
    assert.deepEqual(result, [{ formattedAddress: "10 Rue de Rivoli, 75001 Paris", city: "Paris" }]);
});

test("is case- and diacritic-insensitive", () => {
    const addresses = [{ formattedAddress: "1 Rue X", city: "Évry" }];
    assert.equal(filterAddressesByCity(addresses, "evry").length, 1);
    assert.equal(filterAddressesByCity(addresses, "EVRY").length, 1);
});

test("falls back to the unfiltered list when nothing matches the typed city", () => {
    const addresses = [{ formattedAddress: "1 Rue X", city: "Lyon" }];
    assert.deepEqual(filterAddressesByCity(addresses, "Paris"), addresses);
});

test("returns the list unchanged when no city is given", () => {
    const addresses = [{ formattedAddress: "1 Rue X", city: "Lyon" }];
    assert.deepEqual(filterAddressesByCity(addresses, undefined), addresses);
});

test("treats a missing city on a result as a non-match, not a crash", () => {
    const addresses = [{ formattedAddress: "1 Rue X", city: null }, { formattedAddress: "2 Rue Y", city: "Paris" }];
    assert.deepEqual(filterAddressesByCity(addresses, "Paris"), [{ formattedAddress: "2 Rue Y", city: "Paris" }]);
});

test("normalizeCityName strips accents and case", () => {
    assert.equal(normalizeCityName("Évry"), "evry");
    assert.equal(normalizeCityName("  PARIS  "), "paris");
});
