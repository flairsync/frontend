// One-off migration script: pushes public/locales/<lng>/<ns>.json content into Tolgee via its
// REST bulk-import API, setting the "namespace" field explicitly per key instead of relying on
// the import screen's namespace UI (which wasn't reliably assigning it).
//
// Docs: POST /v2/projects/{projectId}/keys/import
//   "Imports new keys with translations. If key already exists, its translations and tags are
//   not updated." — safe to re-run, won't clobber anything already fixed by hand in Tolgee.
//
// Requires a Tolgee API key with the KEYS_CREATE scope (NOT the read-only client key from
// .env's VITE_TOLGEE_API_KEY — that one is scoped to translations.view only, on purpose,
// since it ships in the browser bundle). Create a separate key for this one-time run.
//
// Run:
//   TOLGEE_API_URL=https://translations.flairsync.com \
//   TOLGEE_PROJECT_ID=2 \
//   TOLGEE_API_KEY=tgpak_xxx \
//   node scripts/import-to-tolgee.js

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "..", "public", "locales");

const API_URL = "https://translations.flairsync.com";
const PROJECT_ID = 2;
const API_KEY = "tgpak_gjptk4zshfsti3thhf3dc2legb2w64lqoj3gq2drgizdg";
const BATCH_SIZE = 300;

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

const locales = fs
  .readdirSync(localesDir)
  .filter((entry) => fs.statSync(path.join(localesDir, entry)).isDirectory());
const namespaces = fs
  .readdirSync(path.join(localesDir, locales[0]))
  .filter((f) => f.endsWith(".json") && !f.endsWith("_upload.json"))
  .map((f) => path.basename(f, ".json"));

async function importNamespace(namespace) {
  // key name (flattened) -> { lang -> text }
  const merged = {};

  for (const locale of locales) {
    const filePath = path.join(localesDir, locale, `${namespace}.json`);
    if (!fs.existsSync(filePath)) continue;
    const flat = flatten(JSON.parse(fs.readFileSync(filePath, "utf-8")));
    for (const [key, text] of Object.entries(flat)) {
      merged[key] ??= {};
      merged[key][locale] = text;
    }
  }

  const keys = Object.entries(merged).map(([name, translations]) => ({
    name,
    namespace,
    translations,
  }));

  let created = 0;
  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const batch = keys.slice(i, i + BATCH_SIZE);
    const res = await fetch(
      `${API_URL}/v2/projects/${PROJECT_ID}/keys/import`,
      {
        method: "POST",
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keys: batch }),
      },
    );
    if (!res.ok) {
      console.error(
        `  batch ${i}-${i + batch.length} failed: ${res.status} ${await res.text()}`,
      );
      continue;
    }
    created += batch.length;
  }
  console.log(`${namespace}: imported ${created}/${keys.length} keys`);
}

for (const namespace of namespaces) {
  await importNamespace(namespace);
}

console.log("\nDone.");
