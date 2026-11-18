// Mirrors the backend's src/common/feature-flags.ts. Code for these features
// stays in the repo but is hidden from nav and blocked at the route level
// while disabled — flip the env vars to bring a feature back, no code changes.
export const FEATURE_FLAGS = {
  hiring: import.meta.env.VITE_FEATURE_HIRING === "true",
  marketplace: import.meta.env.VITE_FEATURE_MARKETPLACE === "true",
};
