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

// ── 2. Every ?action= deep link is actually handled ──────────────────────────
//
// An action bar button whose action nobody consumes is worse than no button:
// it looks clickable, navigates, and then nothing happens. The page (or any
// component beside it) has to list the action in its useActionParam([...]) call.

// Pages routinely reuse a section component from another route's folder (the
// staff staff-page imports the owner's InvitationsSection, for instance), so a
// directory-only scan reports false failures. Follow the import graph instead.
const FILE_EXTENSIONS = [".tsx", ".ts"];

function resolveImport(specifier, fromFile) {
    let base;
    if (specifier.startsWith(".")) {
        base = path.resolve(path.dirname(fromFile), specifier);
    } else if (specifier.startsWith("@/")) {
        base = path.join(root, specifier.slice(2));
    } else {
        return null; // node_modules — nothing of ours in there
    }

    for (const ext of FILE_EXTENSIONS) {
        if (fs.existsSync(base + ext)) return base + ext;
    }
    for (const ext of FILE_EXTENSIONS) {
        const asIndex = path.join(base, "index" + ext);
        if (fs.existsSync(asIndex)) return asIndex;
    }
    return fs.existsSync(base) && fs.statSync(base).isFile() ? base : null;
}

function collectHandledActions(dir) {
    const handled = new Set();
    if (!fs.existsSync(dir)) return handled;

    const queue = [];
    const seen = new Set();

    const seedFrom = (current) => {
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const full = path.join(current, entry.name);
            if (entry.isDirectory()) seedFrom(full);
            else if (FILE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
                queue.push({ file: full, depth: 0 });
            }
        }
    };
    seedFrom(dir);

    // Depth 3 comfortably covers page -> section -> child modal without
    // walking half the codebase on every run.
    while (queue.length > 0) {
        const { file, depth } = queue.shift();
        if (seen.has(file)) continue;
        seen.add(file);

        const src = fs.readFileSync(file, "utf-8");
        for (const call of src.matchAll(/useActionParam\(\s*\[([^\]]*)\]/g)) {
            for (const quoted of call[1].matchAll(/["'`]([^"'`]+)["'`]/g)) {
                handled.add(quoted[1]);
            }
        }

        if (depth >= 3) continue;
        for (const imp of src.matchAll(/from\s+["']([^"']+)["']/g)) {
            const resolved = resolveImport(imp[1], file);
            if (resolved && !seen.has(resolved)) queue.push({ file: resolved, depth: depth + 1 });
        }
    }

    return handled;
}


function collectTabValues(dir) {
    const values = new Set();
    const walk = (current) => {
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const full = path.join(current, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (FILE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
                const src = fs.readFileSync(full, "utf-8");
                for (const m of src.matchAll(/<TabsTrigger[^>]*?value="([^"]+)"/g)) values.add(m[1]);
                for (const m of src.matchAll(/VALID_TABS\s*=\s*\[([^\]]*)\]/g)) {
                    for (const q of m[1].matchAll(/"([^"]+)"/g)) values.add(q[1]);
                }
            }
        }
    };
    if (fs.existsSync(dir)) walk(dir);
    return values;
}

// Roles declared on the action itself, if any, else null.
function actionRolesRawEarly(_block, actionMatch) {
    const raw = actionMatch[2];
    if (!raw) return null;
    return [...raw.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

// Pull each tile's key, its roles, and its actions' query strings out of the
// registry source. Crude, but it means the check needs no build step.
const tileBlocks = registrySrc.split(/\n    \{\n        key: "/).slice(1);

for (const block of tileBlocks) {
    const tileKey = block.slice(0, block.indexOf('"'));
    const rolesMatch = block.match(/roles: \[([^\]]*)\]/);
    const tileRoles = rolesMatch
        ? [...rolesMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
        : [];

    for (const actionMatch of block.matchAll(
        /key: "([^"]+)",\s*\n\s*labelKey: "[^"]+",\s*\n(?:\s*roles: \[([^\]]*)\],\s*\n)?[^}]*?query: "([^"]*)"/g
    )) {
        const [, actionKey, actionRolesRaw, query] = actionMatch;
        const params = new URLSearchParams(query.replace(/^\?/, ""));

        // A ?tab= link is only as good as the value matching a real tab on the
        // target page. Getting this wrong is silent — the page just ignores the
        // param and renders its default tab — so check it rather than trust it.
        const tabParam = params.get("tab");
        if (tabParam) {
            const rolesForTab = actionRolesRawEarly(block, actionMatch) ?? tileRoles;
            for (const role of rolesForTab) {
                const pageDir = path.join(root, "pages", "manage", "@id", role, tileKey);
                if (!fs.existsSync(pageDir)) continue;
                if (!collectTabValues(pageDir).has(tabParam)) {
                    problems.push(
                        `?tab=${tabParam} (tile "${tileKey}", role ${role}) matches no tab on ` +
                        `pages/manage/@id/${role}/${tileKey}/ — that button would land on the ` +
                        `default tab instead.`
                    );
                }
            }
        }

        const actionParam = params.get("action");
        if (!actionParam) continue; // ?tab=/?status= links have no dialog to open

        const actionRoles = actionRolesRaw
            ? [...actionRolesRaw.matchAll(/"([^"]+)"/g)].map((m) => m[1])
            : tileRoles;

        for (const role of actionRoles) {
            const pageDir = path.join(root, "pages", "manage", "@id", role, tileKey);
            if (!fs.existsSync(pageDir)) {
                problems.push(
                    `Tile "${tileKey}" action "${actionKey}" targets ${role}, but ` +
                    `pages/manage/@id/${role}/${tileKey}/ does not exist.`
                );
                continue;
            }
            if (!collectHandledActions(pageDir).has(actionParam)) {
                problems.push(
                    `?action=${actionParam} (tile "${tileKey}", action "${actionKey}", role ${role}) ` +
                    `is not handled — no useActionParam([...]) under pages/manage/@id/${role}/${tileKey}/ ` +
                    `lists it. That button would do nothing.`
                );
            }
        }
    }
}

// ── 3. Every referenced i18n key exists ──────────────────────────────────────

const sourceFiles = [
    registryPath,
    path.join(root, "components", "management", "simple", "AppLauncher.tsx"),
    path.join(root, "components", "management", "simple", "AppTileCard.tsx"),
    path.join(root, "components", "management", "simple", "SimpleActionBar.tsx"),
    path.join(root, "components", "management", "simple", "RightNowStrip.tsx"),
    path.join(root, "components", "management", "simple", "AdvancedControls.tsx"),
    path.join(root, "components", "management", "simple", "TaskSearchDialog.tsx"),
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
