import { redirect } from "vike/abort";
import { PageContext } from "vike/types";

// The bare /diner/:businessId root always forwards to the menu — redirecting
// here (server-side on first hit, before React ever mounts) avoids the blank
// white screen a client-side useEffect redirect used to show until hydration.
export const guard = (pageContext: PageContext) => {
  const { businessId } = pageContext.routeParams as { businessId: string };
  const search = pageContext.urlParsed.searchOriginal ?? "";

  throw redirect(`/diner/${businessId}/menu${search}`);
};
