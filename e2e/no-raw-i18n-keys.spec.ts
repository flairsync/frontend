import { test, expect } from "@playwright/test";

// KAN-76: a missing translation key doesn't throw — i18next just renders the raw key
// ("problemSolution.inventoryDemo.status.low") in place of real copy, which is easy to miss
// in code review and only shows up by actually looking at the rendered page. This walks the
// public pages and fails if any raw-key-shaped text is visible.
//
// Raw-key shape: namespaced dot path, snake_case/camelCase segments, no spaces — real copy in
// every locale this app ships (en/es-ES/ca/fr-FR/it) essentially never looks like this.
const RAW_KEY_PATTERN = /\b[a-zA-Z][a-zA-Z0-9]*(?:[._][a-zA-Z0-9]+){2,}\b/;

const PUBLIC_PAGES = ["/", "/support"];

for (const path of PUBLIC_PAGES) {
    test(`no raw i18n keys visible on ${path}`, async ({ page }) => {
        await page.goto(path);
        const bodyText = await page.locator("body").innerText();

        const suspiciousMatches = bodyText
            .split(/\s+/)
            .filter((word) => RAW_KEY_PATTERN.test(word));

        expect(
            suspiciousMatches,
            `Found text on ${path} that looks like a raw, untranslated i18n key: ${JSON.stringify(suspiciousMatches)}`,
        ).toEqual([]);
    });
}

test("no raw i18n keys visible on a public business page", async () => {
    const slug = process.env.E2E_BUSINESS_SLUG;
    test.skip(!slug, "Needs E2E_BUSINESS_SLUG — see e2e/README.md");
});

if (process.env.E2E_BUSINESS_SLUG) {
    test(`no raw i18n keys visible on /business/${process.env.E2E_BUSINESS_SLUG}`, async ({ page }) => {
        await page.goto(`/business/${process.env.E2E_BUSINESS_SLUG}`);
        const bodyText = await page.locator("body").innerText();
        const suspiciousMatches = bodyText
            .split(/\s+/)
            .filter((word) => RAW_KEY_PATTERN.test(word));

        expect(suspiciousMatches, JSON.stringify(suspiciousMatches)).toEqual([]);
    });
}
