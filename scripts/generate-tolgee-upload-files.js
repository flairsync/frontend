// One-off helper for the Tolgee migration: Tolgee's namespace field on import isn't reliably
// prefixing keys, so this wraps each public/locales/<lng>/<ns>.json file's content under a
// top-level "<ns>" key and writes it to a sibling <ns>_upload.json — importing that file lets
// the namespace come from the JSON structure itself instead of the (unreliable) UI field.
// Run: node scripts/generate-tolgee-upload-files.js
// Safe to re-run; only ever writes *_upload.json files, never touches the source locale files.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "..", "public", "locales");

const locales = fs.readdirSync(localesDir).filter((entry) => fs.statSync(path.join(localesDir, entry)).isDirectory());

let count = 0;

for (const locale of locales) {
  const localeDir = path.join(localesDir, locale);
  const files = fs.readdirSync(localeDir).filter((f) => f.endsWith(".json") && !f.endsWith("_upload.json"));

  for (const file of files) {
    const namespace = path.basename(file, ".json");
    const sourcePath = path.join(localeDir, file);
    const content = JSON.parse(fs.readFileSync(sourcePath, "utf-8"));

    const wrapped = { [namespace]: content };
    const outPath = path.join(localeDir, `${namespace}_upload.json`);
    fs.writeFileSync(outPath, JSON.stringify(wrapped, null, 2) + "\n");
    count++;
    console.log(`${locale}/${namespace}.json -> ${locale}/${namespace}_upload.json`);
  }
}

console.log(`\nDone — wrote ${count} upload file(s).`);
