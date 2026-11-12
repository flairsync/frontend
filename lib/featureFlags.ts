// Mirrors the backend's src/common/feature-flags.ts. Code for these features
// stays in the repo but is hidden from nav and blocked at the route level
// while disabled — flip the env vars to bring a feature back, no code changes.
export const FEATURE_FLAGS = {
  hiring: process.env.NEXT_PUBLIC_FEATURE_HIRING === "true",
  marketplace: process.env.NEXT_PUBLIC_FEATURE_MARKETPLACE === "true",
};
