import { test } from "node:test";
import assert from "node:assert/strict";
import { capitalizeCity } from "./cityLabel.ts";
import andorraCities from "../data/andorra.cities.json" with { type: "json" };

// P0-1 (QA round 4, 2026-11-19): BusinessLocationPicker's city <Select> is controlled by the
// capitalized city string, and each <SelectItem value={capitalizeCity(val.city)}> must match
// it exactly, or Radix can't resolve the selection and the field renders empty even though a
// city was picked. This guards that every raw city in the data file round-trips through
// capitalizeCity to a value that (a) is non-empty and (b) uniquely identifies its raw entry,
// so selecting it always sets a value step validation will accept.
test("every Andorra city capitalizes to a non-empty, unique display value", () => {
    const seen = new Map<string, string>();
    for (const entry of andorraCities) {
        const label = capitalizeCity(entry.city);
        assert.ok(label.length > 0, `capitalizeCity("${entry.city}") must not be empty`);
        assert.ok(!seen.has(label), `"${label}" collides with raw city "${seen.get(label)}"`);
        seen.set(label, entry.city);
    }
});

test("capitalized Andorra city labels resolve back to their raw data entry", () => {
    for (const entry of andorraCities) {
        const label = capitalizeCity(entry.city);
        const match = andorraCities.find(c => capitalizeCity(c.city) === label);
        assert.equal(match?.city, entry.city);
    }
});

test("capitalizes each parish name, lowercasing Catalan connector words", () => {
    assert.equal(capitalizeCity("andorra la vella"), "Andorra la Vella");
    assert.equal(capitalizeCity("escaldes-engordany"), "Escaldes-Engordany");
    assert.equal(capitalizeCity("sant julià de lòria"), "Sant Julià de Lòria");
    assert.equal(capitalizeCity("la massana"), "La Massana");
    assert.equal(capitalizeCity("encamp"), "Encamp");
});
