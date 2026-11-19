import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify } from "./slugify.ts";

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
