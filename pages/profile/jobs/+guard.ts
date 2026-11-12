import { redirect } from "vike/abort";
import { FEATURE_FLAGS } from "@/lib/featureFlags";

// Hiring is disabled for launch — code stays, route is blocked. Flip
// NEXT_PUBLIC_FEATURE_HIRING to bring it back.
export const guard = () => {
  if (!FEATURE_FLAGS.hiring) {
    throw redirect("/");
  }
};
