import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify, slugifyPartial } from "./slugify.ts";

test("strips diacritics and punctuation, hyphenates spaces", () => {
    assert.equal(slugify("Retest Café!"), "retest-cafe");
});

test("collapses runs of whitespace into a single hyphen", () => {
    assert.equal(slugify("  Multiple   Spaces  "), "multiple-spaces");
});

test("leaves an already-valid slug untouched", () => {
    assert.equal(slugify("already-slugged"), "already-slugged");
});

test("handles mixed accents, ampersands and em dashes", () => {
    assert.equal(slugify("Ñandú & Café — Bar"), "nandu-cafe-bar");
});

test("empty input produces an empty slug", () => {
    assert.equal(slugify(""), "");
});

test("input with only punctuation produces an empty slug, not stray hyphens", () => {
    assert.equal(slugify("---"), "");
});

test("uppercase-only input is lowercased", () => {
    assert.equal(slugify("RETEST CAFE"), "retest-cafe");
});

// P0-2 (QA round 4, 2026-11-19): slugifyPartial() is used on every keystroke, slugify() only on
// blur/submit/paste. slugifyPartial must not trim a trailing hyphen the user just typed, or the
// next keystroke gets appended to the wrong spot ("retest-cafe" -> "retestcafe").
test("slugifyPartial keeps an in-progress trailing hyphen while typing", () => {
    assert.equal(slugifyPartial("retest-"), "retest-");
    assert.equal(slugifyPartial("retest- "), "retest--");
});

test("typing 'retest-cafe' one character at a time keeps the hyphen (slugifyPartial)", () => {
    let value = "";
    for (const ch of "retest-cafe") {
        value = slugifyPartial(value + ch);
    }
    assert.equal(value, "retest-cafe");
});

test("slugifyPartial lowercases, strips diacritics and invalid characters, turns spaces into hyphens", () => {
    assert.equal(slugifyPartial("Retest Café!"), "retest-cafe");
});

test("the full slugify still collapses and trims what slugifyPartial left in-progress", () => {
    assert.equal(slugify(slugifyPartial("retest-")), "retest");
    assert.equal(slugify("  My  Café -- Bar "), "my-cafe-bar");
});
