// P1-16 (QA, 2026-11-18): guards against the exact bug class the QA passes kept finding —
// a string added to en/*.json (or a new key referenced in code) that never made it into
// es-ES/ca/fr-FR, so a non-English visitor just sees the raw key or falls back to English.
//
// Checks every namespace file under public/locales/en against its es-ES/ca/fr-FR
// counterparts and reports any key present in en but missing (or not a string where en
// has one) elsewhere. Does NOT check for extra keys in a non-en locale that en lacks —
// that's a much weaker signal of a real bug (could just be a WIP addition) and would add
// noise, not catch real regressions, so it's left out.
//
// Run: node scripts/check-i18n-coverage.js
// Exits non-zero on failure, so it can gate CI.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const localesDir = path.join(root, "public", "locales");

const SOURCE_LOCALE = "en";
const TARGET_LOCALES = ["es-ES", "ca", "fr-FR", "it"];

function flattenKeys(obj, prefix = "") {
    const keys = [];
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            keys.push(...flattenKeys(value, fullKey));
        } else {
            // Arrays (e.g. the FAQ items list) are treated as a single leaf — diffing
            // array contents key-by-key isn't meaningful here, just that the array exists.
            keys.push(fullKey);
        }
    }
    return keys;
}

function getByPath(obj, keyPath) {
    return keyPath.split(".").reduce((acc, segment) => (acc == null ? acc : acc[segment]), obj);
}

// *_upload.json files are dead: not in translations/i18n.ts's `ns` list and not referenced
// by any useTranslation() call anywhere in the codebase (checked 2026-11-21 while adding the
// it locale) — excluded so this check doesn't demand translations for content nothing loads.
const namespaceFiles = fs
    .readdirSync(path.join(localesDir, SOURCE_LOCALE))
    .filter((f) => f.endsWith(".json") && !f.endsWith("_upload.json"));

let totalMissing = 0;
const report = [];

for (const file of namespaceFiles) {
    const sourcePath = path.join(localesDir, SOURCE_LOCALE, file);
    const source = JSON.parse(fs.readFileSync(sourcePath, "utf-8"));
    const sourceKeys = flattenKeys(source);

    for (const locale of TARGET_LOCALES) {
        const targetPath = path.join(localesDir, locale, file);
        if (!fs.existsSync(targetPath)) {
            report.push(`${locale}/${file}: entire file is missing`);
            totalMissing += sourceKeys.length;
            continue;
        }

        const target = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
        const missing = sourceKeys.filter((k) => getByPath(target, k) === undefined);

        if (missing.length > 0) {
            totalMissing += missing.length;
            report.push(`${locale}/${file}: ${missing.length} missing key(s)`);
            for (const k of missing) {
                report.push(`  - ${k}`);
            }
        }
    }
}

if (totalMissing > 0) {
    console.error(`i18n coverage check failed: ${totalMissing} missing translation(s) vs. ${SOURCE_LOCALE}\n`);
    console.error(report.join("\n"));
    process.exit(1);
} else {
    console.log(`i18n coverage check passed: every ${SOURCE_LOCALE} key exists in ${TARGET_LOCALES.join(", ")}`);
}
