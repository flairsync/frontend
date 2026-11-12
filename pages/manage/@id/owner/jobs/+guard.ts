import { redirect } from "vike/abort";
import { PageContext } from "vike/types";
import { FEATURE_FLAGS } from "@/lib/featureFlags";

// Hiring is disabled for launch — code stays, route is blocked. Flip
// NEXT_PUBLIC_FEATURE_HIRING to bring it back.
export const guard = (pageContext: PageContext) => {
  if (!FEATURE_FLAGS.hiring) {
    const { id } = pageContext.routeParams as { id: string };
    throw redirect(`/manage/${id}/owner/dashboard`);
  }
};
