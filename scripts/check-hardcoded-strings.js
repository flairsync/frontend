// P1-16 (QA round 6, 2026-11-20): regression guard for the OTHER half of the i18n bug
// class check-i18n-coverage.js guards against — a string that never became a translation
// key at all, just typed straight into JSX or a toast call, so it shows in English no
// matter the viewer's language (several of this round's QA findings were exactly this:
// "Alerts & Warnings", "Please select a country first", "per month", ...).
//
// This is a heuristic regex scan, not a real JSX/TS parser, so it only catches the
// clearest cases on purpose (plain multi-word JSX text, and toast(...) calls with a
// string-literal argument) — good enough to stop new ones, not a rewrite of every
// existing violation. This codebase has plenty of pre-existing hardcoded strings
// already; rather than fail CI on all of them (impossible to land) or ignore new ones
// forever, this ratchets: violations present in the baseline file are allowed, anything
// NEW fails CI. Run with --write-baseline after fixing (or deliberately accepting) a
// violation to update the baseline.
//
// Run: node scripts/check-hardcoded-strings.js [--write-baseline]
// Exits non-zero on failure, so it can gate CI.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const baselinePath = path.join(__dirname, "hardcoded-strings-baseline.json");

const SCAN_DIRS = ["pages", "components", "features"];
const EXCLUDE_SEGMENTS = ["node_modules", "tutorials", "__tests__", ".test."];

// Plain JSX text between tags: >Some Words Here< — requires 2+ words starting with a
// capital letter, so single-word labels (often intentional, e.g. a brand/code name) and
// expressions (`{...}`) don't trip it. Deliberately misses text broken across multiple
// JSX expressions/lines — a known gap of a regex-only check, not a parser.
const JSX_TEXT_RE = />\s*([A-Z][a-zA-Z''-]*(?:\s+[A-Za-z''-]+){1,})\s*</g;

// toast(...) / toast.success(...) / toast.error(...) / toast.info(...) / toast.warning(...)
// called with a plain string literal (not a template literal with interpolation, and not
// a function call like t(...) or a variable).
const TOAST_LITERAL_RE = /\btoast(?:\.(?:success|error|info|warning|loading))?\(\s*(['"])((?:(?!\1).)+)\1/g;

function listFiles(dir) {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (EXCLUDE_SEGMENTS.some((seg) => entry.name.includes(seg))) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...listFiles(full));
        else if (entry.name.endsWith(".tsx")) out.push(full);
    }
    return out;
}

function relLine(filePath, index, src) {
    return src.slice(0, index).split("\n").length;
}

function scanFile(filePath) {
    const src = fs.readFileSync(filePath, "utf-8");
    const rel = path.relative(root, filePath);
    const violations = [];

    for (const match of src.matchAll(JSX_TEXT_RE)) {
        const text = match[1].trim();
        // Skip things that look like code/paths/placeholders rather than prose:
        // all-caps tokens, things with slashes or braces, pure numbers.
        if (/^[A-Z0-9_./-]+$/.test(text)) continue;
        violations.push({
            file: rel,
            line: relLine(filePath, match.index, src),
            kind: "jsx-text",
            snippet: text,
        });
    }

    for (const match of src.matchAll(TOAST_LITERAL_RE)) {
        const text = match[2].trim();
        if (!text) continue;
        violations.push({
            file: rel,
            line: relLine(filePath, match.index, src),
            kind: "toast-literal",
            snippet: text,
        });
    }

    return violations;
}

// Deliberately excludes line number: an unrelated edit earlier in the same file shifts
// every later line down, which would otherwise make the baseline think an untouched
// violation is new just because its line moved.
function violationKey(v) {
    return `${v.file}:${v.kind}:${v.snippet}`;
}

const allFiles = SCAN_DIRS.flatMap((dir) => listFiles(path.join(root, dir)));
const allViolations = allFiles.flatMap(scanFile);

const writeBaseline = process.argv.includes("--write-baseline");

if (writeBaseline) {
    const baseline = allViolations.map(violationKey).sort();
    fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + "\n");
    console.log(`Wrote ${baseline.length} violation(s) to ${path.relative(root, baselinePath)}`);
    process.exit(0);
}

let baseline = new Set();
if (fs.existsSync(baselinePath)) {
    baseline = new Set(JSON.parse(fs.readFileSync(baselinePath, "utf-8")));
}

const newViolations = allViolations.filter((v) => !baseline.has(violationKey(v)));

if (newViolations.length > 0) {
    console.error(
        `hardcoded-string check failed: ${newViolations.length} new hardcoded user-facing string(s) not in the baseline.\n` +
            `If this is a real violation, translate it via i18next's t() instead. If it's a false positive ` +
            `(e.g. a brand name, a technical label) or an intentional exception, run ` +
            `"node scripts/check-hardcoded-strings.js --write-baseline" to accept it.\n`,
    );
    for (const v of newViolations) {
        console.error(`  ${v.file}:${v.line} [${v.kind}] ${JSON.stringify(v.snippet)}`);
    }
    process.exit(1);
}

console.log(
    `hardcoded-string check passed (${allViolations.length} known pre-existing violation(s) in baseline, 0 new).`,
);
