import { redirect } from "vike/abort";
import { PageContext } from "vike/types";

// The bare /diner/:businessId root always forwards to the menu — redirecting
// here (server-side on first hit, before React ever mounts) avoids the blank
// white screen a client-side useEffect redirect used to show until hydration.
export const guard = (pageContext: PageContext) => {
  const { businessId } = pageContext.routeParams as { businessId: string };
  const { pathname, searchOriginal } = pageContext.urlParsed;

  // This guard also applies to every nested page (menu/, order/, loyalty/) —
  // only redirect the bare root, otherwise /diner/:businessId/menu redirects
  // to itself forever.
  if (pathname !== `/diner/${businessId}`) return;

  throw redirect(`/diner/${businessId}/menu${searchOriginal ?? ""}`);
};
