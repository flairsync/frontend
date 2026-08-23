// One-off migration script: pushes public/locales/<lng>/<ns>.json content into Tolgee via its
// REST API, setting the "namespace" field explicitly per key instead of relying on the import
// screen's namespace UI (which wasn't reliably assigning it).
//
// Uses POST /v2/projects/{projectId}/translations ("Create key or update translations" —
// upserts: creates the key if missing, and *updates* its translations if it already exists).
// This replaced an earlier version that used the bulk /keys/import endpoint, which only creates
// new keys and silently no-ops on existing ones — that meant re-running after fixing the locale
// tags never filled in translations for keys a previous (broken) run had already created.
//
// Requires a Tolgee API key with the TRANSLATIONS_EDIT scope (NOT the read-only client key from
// .env's VITE_TOLGEE_API_KEY — that one is scoped to translations.view only, on purpose, since
// it ships in the browser bundle). Create a separate key for this one-time run, and delete it
// once you're done.
//
// Run:
//   TOLGEE_API_URL=https://translations.flairsync.com \
//   TOLGEE_PROJECT_ID=2 \
//   TOLGEE_API_KEY=tgpak_xxx \
//   node scripts/import-to-tolgee.js
//
// Set VERBOSE=0 to silence the per-key log lines and only print per-namespace/final summaries.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "..", "public", "locales");

const API_URL = "https://translations.flairsync.com";
const PROJECT_ID = 2;
const API_KEY = "tgpak_gjpts2ldov2xcnbqgu4wgzzrnbstg5ddmj3dm3dbmzwa";
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 1);
const REQUEST_DELAY_MS = Number(process.env.REQUEST_DELAY_MS ?? 150);
const VERBOSE = process.env.VERBOSE !== "0";

if (!API_URL || !PROJECT_ID || !API_KEY) {
  console.error(
    "Missing TOLGEE_API_URL, TOLGEE_PROJECT_ID, or TOLGEE_API_KEY env vars.",
  );
  process.exit(1);
}

function flatten(obj, prefix = "") {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const flatKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object") {
      Object.assign(result, flatten(value, flatKey));
    } else {
      result[flatKey] = String(value);
    }
  }
  return result;
}

// Local locale folder names must match the language tags configured in Tolgee exactly
// (verify via GET /v2/projects/{id}/languages if imports start 404ing with language_not_found).
const toTolgeeTag = (locale) => locale;

const locales = fs
  .readdirSync(localesDir)
  .filter((entry) => fs.statSync(path.join(localesDir, entry)).isDirectory());
const namespaces = fs
  .readdirSync(path.join(localesDir, locales[0]))
  .filter((f) => f.endsWith(".json") && !f.endsWith("_upload.json"))
  .map((f) => path.basename(f, ".json"));

console.log(`Locales: ${locales.join(", ")}`);
console.log(`Namespaces: ${namespaces.join(", ")}\n`);

function collectKeysForNamespace(namespace) {
  // key name (flattened) -> { lang -> text }
  const merged = {};
  for (const locale of locales) {
    const filePath = path.join(localesDir, locale, `${namespace}.json`);
    if (!fs.existsSync(filePath)) continue;
    const flat = flatten(JSON.parse(fs.readFileSync(filePath, "utf-8")));
    for (const [key, text] of Object.entries(flat)) {
      merged[key] ??= {};
      merged[key][toTolgeeTag(locale)] = text;
    }
  }
  return Object.entries(merged).map(([name, translations]) => ({
    name,
    translations,
  }));
}

async function upsertKey(namespace, name, translations, attempt = 1) {
  const res = await fetch(`${API_URL}/v2/projects/${PROJECT_ID}/translations`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key: name, namespace, translations }),
  });

  if (res.status === 429 && attempt <= 3) {
    const wait = attempt * 1000;
    if (VERBOSE)
      console.log(
        `  [${namespace}] ${name}: rate limited, retrying in ${wait}ms`,
      );
    await new Promise((r) => setTimeout(r, wait));
    return upsertKey(namespace, name, translations, attempt + 1);
  }

  if (!res.ok) {
    const body = await res.text();
    console.error(`  [${namespace}] ${name}: FAILED ${res.status} ${body}`);
    return { ok: false };
  }

  const data = await res.json();
  const setLangs = Object.keys(data.translations ?? {});
  const requestedLangs = Object.keys(translations);
  const missingLangs = requestedLangs.filter((l) => !setLangs.includes(l));

  if (VERBOSE) {
    console.log(
      `  [${namespace}] ${name}: ok — set [${setLangs.join(", ")}]${missingLangs.length ? ` — MISSING [${missingLangs.join(", ")}]` : ""}`,
    );
  } else if (missingLangs.length) {
    console.log(
      `  [${namespace}] ${name}: set [${setLangs.join(", ")}] — MISSING [${missingLangs.join(", ")}]`,
    );
  }

  return { ok: true, missingLangs };
}

async function runPool(items, worker, concurrency) {
  const results = [];
  let i = 0;
  async function next() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
      if (REQUEST_DELAY_MS > 0)
        await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS));
    }
  }
  await Promise.all(Array.from({ length: concurrency }, next));
  return results;
}

async function importNamespace(namespace) {
  const keys = collectKeysForNamespace(namespace);
  console.log(`${namespace}: ${keys.length} keys`);

  const results = await runPool(
    keys,
    (k) => upsertKey(namespace, k.name, k.translations),
    CONCURRENCY,
  );

  const succeeded = results.filter((r) => r.ok).length;
  const failed = results.length - succeeded;
  const withMissingLangs = results.filter(
    (r) => r.ok && r.missingLangs.length > 0,
  ).length;

  console.log(
    `${namespace}: done — ${succeeded}/${keys.length} ok, ${failed} failed, ${withMissingLangs} had missing languages\n`,
  );
  return { namespace, total: keys.length, succeeded, failed, withMissingLangs };
}

const summary = [];
for (const namespace of namespaces) {
  summary.push(await importNamespace(namespace));
}

console.log("=== Summary ===");
for (const s of summary) {
  console.log(
    `${s.namespace}: ${s.succeeded}/${s.total} ok, ${s.failed} failed, ${s.withMissingLangs} missing langs`,
  );
}
console.log("\nDone.");
