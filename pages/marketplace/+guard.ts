import { redirect } from "vike/abort";
import { FEATURE_FLAGS } from "@/lib/featureFlags";

// Marketplace is disabled for launch — code stays, route is blocked. Flip
// NEXT_PUBLIC_FEATURE_MARKETPLACE to bring it back.
export const guard = () => {
  if (!FEATURE_FLAGS.marketplace) {
    throw redirect("/");
  }
};
