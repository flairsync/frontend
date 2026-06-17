// https://vike.dev/Head

import { usePageContext } from "vike-react/usePageContext";

const SITE_URL = "https://flairsync.com";

export default function HeadDefault() {
  const { urlPathname } = usePageContext();
  const canonicalUrl = `${SITE_URL}${urlPathname}`;

  return <>
    <link rel="icon" href="/fs_logo.svg" type="image/svg+xml" />
    <link rel="canonical" href={canonicalUrl} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="FlairSync" />
    <meta property="og:url" content={canonicalUrl} />
    <script src="https://app.lemonsqueezy.com/js/lemon.js"></script>
    <script src="https://accounts.google.com/gsi/client" async defer></script>

  </>
}
