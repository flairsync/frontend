// Guards the two ways Easy View silently rots:
//
//   1. A management route gets added but no tile is registered for it, so it
//      exists in Full View and is simply invisible in Easy View.
//   2. A tile or action references an i18n key that nobody wrote, so a café
//      owner sees "simple_mode.tiles.foo.label" on a button.
//
// Run: node scripts/check-task-registry.js
// Exits non-zero on failure, so it can gate CI.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const registryPath = path.join(root, "features", "navigation", "taskRegistry.ts");
const registrySrc = fs.readFileSync(registryPath, "utf-8");

const problems = [];

// ── 1. Every route has a tile ────────────────────────────────────────────────

// Routes that are intentionally not on the launcher.
const EXEMPT_ROUTES = new Set([
    "home", // the launcher itself
]);

const registeredKeys = new Set(
    [...registrySrc.matchAll(/^\s{8}key: "([^"]+)"/gm)].map((m) => m[1])
);

for (const role of ["owner", "staff"]) {
    const roleDir = path.join(root, "pages", "manage", "@id", role);
    if (!fs.existsSync(roleDir)) continue;

    const routes = fs
        .readdirSync(roleDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((name) => !name.startsWith("+") && !EXEMPT_ROUTES.has(name));

    for (const route of routes) {
        if (!registeredKeys.has(route)) {
            problems.push(
                `Route /manage/:id/${role}/${route} has no tile in taskRegistry.ts — ` +
                `it will be missing from Easy View. Add a tile, or add it to EXEMPT_ROUTES here.`
            );
        }
    }
}

// ── 2. Every referenced i18n key exists ──────────────────────────────────────

const sourceFiles = [
    registryPath,
    path.join(root, "components", "management", "simple", "AppLauncher.tsx"),
    path.join(root, "components", "management", "simple", "AppTileCard.tsx"),
    path.join(root, "components", "management", "simple", "SimpleActionBar.tsx"),
    path.join(root, "components", "shared", "UiModeToggle.tsx"),
    path.join(root, "pages", "manage", "@id", "owner", "home", "+Page.tsx"),
    path.join(root, "pages", "manage", "@id", "staff", "home", "+Page.tsx"),
].filter((f) => fs.existsSync(f));

const referencedKeys = new Set();
for (const file of sourceFiles) {
    const src = fs.readFileSync(file, "utf-8");
    for (const match of src.matchAll(/"(simple_mode\.[A-Za-z0-9_.]+)"/g)) {
        referencedKeys.add(match[1]);
    }
}

const localesDir = path.join(root, "public", "locales");
const locales = fs
    .readdirSync(localesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

for (const locale of locales) {
    const file = path.join(localesDir, locale, "management.json");
    if (!fs.existsSync(file)) continue;
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));

    for (const key of referencedKeys) {
        let node = data;
        for (const part of key.split(".")) {
            node = node && typeof node === "object" ? node[part] : undefined;
        }
        if (typeof node !== "string") {
            problems.push(`${locale}/management.json is missing "${key}"`);
        }
    }
}

// ── Report ───────────────────────────────────────────────────────────────────

if (problems.length > 0) {
    console.error(`\ntask registry check FAILED (${problems.length} problem(s)):\n`);
    for (const problem of problems) console.error(`  • ${problem}`);
    console.error(
        "\nReminder: new keys also have to reach Tolgee (npm run i18n:push), " +
        "because it's ahead of the static JSON in the chained backend.\n"
    );
    process.exit(1);
}

console.log(
    `task registry OK — ${registeredKeys.size} tiles, ` +
    `${referencedKeys.size} i18n keys verified across ${locales.length} locales.`
);
