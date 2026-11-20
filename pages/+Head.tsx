// https://vike.dev/Head

import { usePageContext } from "vike-react/usePageContext";
import { normalizeLang } from "../translations/supportedLanguages.js";

const SITE_URL = "https://flairsync.com";

export default function HeadDefault() {
  const { urlPathname, langCookie } = usePageContext();
  const canonicalUrl = `${SITE_URL}${urlPathname}`;
  // P1-8 (QA, 2026-11-18): Google's own "Sign in with Google" button text/UI was always
  // English — the Google Identity Services script takes the locale via its own `hl` query
  // param, read once at script-load time, not something it exposes to pass per-call later.
  const googleHl = normalizeLang(langCookie ?? "en").split("-")[0];

  return <>
    <link rel="icon" href="/fs_logo.svg" type="image/svg+xml" />
    <link rel="canonical" href={canonicalUrl} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="FlairSync" />
    <meta property="og:url" content={canonicalUrl} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>
    <script id="gsi-client-script" src={`https://accounts.google.com/gsi/client?hl=${googleHl}`} async defer></script>

  </>
}
