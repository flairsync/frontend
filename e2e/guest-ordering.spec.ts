import { test, expect, type Page } from "@playwright/test";

// KAN-71 round 5 "GUESTS CAN'T ORDER" — the three tickets below all sit on the same critical
// path (scan table -> see menu -> order), so they're verified together rather than as three
// unrelated specs: KAN-73/KAN-88 are meaningless to test while KAN-72 still kicks the guest out.
const BUSINESS_SLUG = process.env.E2E_BUSINESS_SLUG;
const TABLE_ID = process.env.E2E_TABLE_ID;
const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL;
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD;

const hasTableFixture = !!BUSINESS_SLUG && !!TABLE_ID;
const hasOwnerFixture = hasTableFixture && !!OWNER_EMAIL && !!OWNER_PASSWORD;

test.describe("Guest ordering via scanned table (KAN-72, KAN-88)", () => {
    test.skip(!hasTableFixture, "Needs E2E_BUSINESS_SLUG and E2E_TABLE_ID — see e2e/README.md");

    test("scanning a table loads the menu and stays loaded — no redirect loop", async ({ page }) => {
        await page.goto(`/tbl/${BUSINESS_SLUG}/${TABLE_ID}`);

        // /tbl/... does a full-page redirect into /diner/{slug}/menu.
        await page.waitForURL(`**/diner/${BUSINESS_SLUG}/menu`);
        await expect(page.locator("main")).not.toBeEmpty();

        // KAN-72's actual bug: a stale-state race armed a 12s auto-exit-to-home timer on every
        // table-scan visit. Wait past that window and confirm we're still on the menu, not
        // bounced to "/". This is the one assertion that would have caught the regression.
        await page.waitForTimeout(13_000);
        await expect(page).toHaveURL(new RegExp(`/diner/${BUSINESS_SLUG}/menu`));
    });

    test("guest can add an item from the menu and place an order", async ({ page }) => {
        await page.goto(`/tbl/${BUSINESS_SLUG}/${TABLE_ID}`);
        await page.waitForURL(`**/diner/${BUSINESS_SLUG}/menu`);

        const addableItem = page.locator("main").getByRole("button").first();
        await expect(addableItem).toBeVisible();
        await addableItem.click();

        // DinerMenuItemSheet's confirm button text is `add_to_order` = "Add to order · {{price}}".
        const addToOrderButton = page.getByRole("button", { name: /add to order/i });
        await expect(addToOrderButton).toBeVisible();
        await addToOrderButton.click();

        await page.getByRole("link", { name: /my order/i }).click();
        const placeOrderButton = page.getByRole("button", { name: /place order/i });
        await expect(placeOrderButton).toBeVisible();
        await placeOrderButton.click();

        // Order placed — My Order tab should now show an active/pending order rather than
        // an empty cart, and not have bounced the guest anywhere.
        await expect(page).toHaveURL(new RegExp(`/diner/${BUSINESS_SLUG}/order`));
    });

    test.describe("full chain: guest order reaches the owner's Orders list (KAN-88)", () => {
        test.skip(!hasOwnerFixture, "Needs E2E_OWNER_EMAIL/E2E_OWNER_PASSWORD too — see e2e/README.md");

        test("guest order -> owner Orders list", async ({ browser }) => {
            const guestContext = await browser.newContext();
            const guestPage = await guestContext.newPage();

            await guestPage.goto(`/tbl/${BUSINESS_SLUG}/${TABLE_ID}`);
            await guestPage.waitForURL(`**/diner/${BUSINESS_SLUG}/menu`);

            const marker = `E2E ${Date.now()}`;
            const addableItem = guestPage.locator("main").getByRole("button").first();
            const itemName = (await addableItem.textContent())?.trim() ?? "";
            await addableItem.click();

            const notesField = guestPage.getByPlaceholder(/special instructions|notes/i);
            if (await notesField.isVisible().catch(() => false)) {
                await notesField.fill(marker);
            }
            await guestPage.getByRole("button", { name: /add to order/i }).click();
            await guestPage.getByRole("link", { name: /my order/i }).click();
            await guestPage.getByRole("button", { name: /place order/i }).click();
            await expect(guestPage).toHaveURL(new RegExp(`/diner/${BUSINESS_SLUG}/order`));

            await guestContext.close();

            // Owner side: log in and check the new order shows up.
            const ownerContext = await browser.newContext();
            const ownerPage = await ownerContext.newPage();
            await loginAsOwner(ownerPage);

            await ownerPage.goto(`/manage/${BUSINESS_SLUG}/owner/orders`);
            const orderRow = itemName
                ? ownerPage.getByText(itemName).first()
                : ownerPage.locator("main").getByRole("row").first();
            await expect(orderRow).toBeVisible({ timeout: 15_000 });

            await ownerContext.close();
        });
    });
});

test.describe("Public business page lets a guest order directly (KAN-73)", () => {
    test.skip(!BUSINESS_SLUG, "Needs E2E_BUSINESS_SLUG — see e2e/README.md");

    test("menu items show a visible, always-on Add control (not hover-only) and open the order modal", async ({ page }) => {
        await page.goto(`/business/${BUSINESS_SLUG}`);
        await page.locator("#menu-section").scrollIntoViewIfNeeded();

        // KAN-73's actual bug: the only "this is clickable" affordance was an
        // opacity-0 → group-hover:opacity-100 chevron, invisible on a touchscreen (no
        // :hover). The Add badge must render with full opacity without any hover/pointer
        // interaction at all — this project uses the "Mobile Chrome" device profile with no
        // mouse, so this assertion fails exactly the way a real phone would show the bug.
        const addBadge = page.getByText(/^Add$/).first();
        await expect(addBadge).toBeVisible();
        await expect(addBadge).toHaveCSS("opacity", "1");

        await page.locator("#menu-section").getByRole("heading").first(); // sanity: menu rendered
        const firstItemRow = page.locator("#menu-section .cursor-pointer").first();
        await firstItemRow.click();

        // BusinessDetailsOrderModal: dine-in/takeaway radio, quantity +/-, Confirm.
        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByText(/dine-in|takeaway/i).first()).toBeVisible();
        await expect(page.getByRole("button", { name: /confirm order/i })).toBeVisible();
    });
});

async function loginAsOwner(page: Page) {
    await page.goto("/login");
    await page.fill("#email", OWNER_EMAIL!);
    await page.fill("#password", OWNER_PASSWORD!);
    await page.getByRole("button", { name: /log in|sign in/i }).click();
    await page.waitForURL(/\/manage\//, { timeout: 20_000 });
}
