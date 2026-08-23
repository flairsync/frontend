// JS config (not .tolgeerc.json) because we need to build push.files ourselves:
// each locale dir also contains stale "<namespace>_upload.json" artifacts from an old
// manual-import attempt that must NOT be treated as their own namespace, which a
// {namespace}.json filesTemplate would do (it has no way to exclude a suffix).
const fs = require("fs");
const path = require("path");

const localesDir = path.join(__dirname, "public", "locales");

const files = fs
  .readdirSync(localesDir)
  .filter((entry) => fs.statSync(path.join(localesDir, entry)).isDirectory())
  .flatMap((language) => {
    const dir = path.join(localesDir, language);
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json") && !f.endsWith("_upload.json"))
      .map((f) => ({
        path: `./public/locales/${language}/${f}`,
        language,
        namespace: f.replace(/\.json$/, ""),
      }));
  });

module.exports = {
  // Self-hosted instance — without this the CLI defaults to app.tolgee.io and
  // auth fails against the wrong host. Same host the app itself pulls from.
  apiUrl: process.env.VITE_TOLGEE_API_URL,
  projectId: "2",
  push: {
    files,
    // Local files are the source of truth here: new + changed keys are pushed,
    // keys identical to what's already on Tolgee are left untouched (no needless
    // overwrite of translator edits/reviewed state on unrelated content).
    forceMode: "OVERRIDE",
  },
};
