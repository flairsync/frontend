export type PermissionFlags = {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export type FlatPermissionGrant = PermissionFlags & { key: string };

// Mirrors PERMISSION_DEPENDENCIES in flairsync-api's src/roles/permission.types.ts —
// keep the two in sync if the backend map changes. The backend enforces this
// unconditionally on save; this copy only drives the UI hint/lock so admins
// understand why a permission got auto-checked instead of being surprised by it
// after a refetch.
export const PERMISSION_DEPENDENCIES: Record<string, string[]> = {
  ORDERS: ["MENU"],
  TASKS: ["STAFF"],
  COMMUNICATIONS: ["STAFF"],
  JOBS: ["STAFF"],
  NFC: ["STAFF"],
  PAYROLL: ["STAFF"],
  THEMES: ["BUSINESS_SETTINGS"],
};

const PERMISSION_DEPENDENTS: Record<string, string[]> = Object.entries(
  PERMISSION_DEPENDENCIES
).reduce((acc, [key, deps]) => {
  deps.forEach(dep => {
    acc[dep] = [...(acc[dep] ?? []), key];
  });
  return acc;
}, {} as Record<string, string[]>);

function isGranted(flags: PermissionFlags): boolean {
  return flags.canRead || flags.canCreate || flags.canUpdate || flags.canDelete;
}

/**
 * Widens a permission grant list so every granted permission also carries read
 * access to what it depends on (e.g. ORDERS -> MENU:read). Only ever adds or
 * widens a grant, never removes/downgrades one — matches the backend's
 * withPermissionDependencies so local state doesn't drift from what gets saved.
 */
export function applyPermissionDependencies(
  grants: FlatPermissionGrant[]
): FlatPermissionGrant[] {
  const byKey = new Map(grants.map(g => [g.key, { ...g }]));

  let changed = true;
  while (changed) {
    changed = false;
    for (const grant of Array.from(byKey.values())) {
      if (!isGranted(grant)) continue;

      for (const depKey of PERMISSION_DEPENDENCIES[grant.key] ?? []) {
        const existing = byKey.get(depKey);
        if (!existing) {
          byKey.set(depKey, {
            key: depKey,
            canRead: true,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
          });
          changed = true;
        } else if (!existing.canRead) {
          existing.canRead = true;
          changed = true;
        }
      }
    }
  }

  return Array.from(byKey.values());
}

/** Which currently-granted permission keys require read access to `key`. */
export function getRequiredByKeys(
  key: string,
  grants: FlatPermissionGrant[]
): string[] {
  const dependents = PERMISSION_DEPENDENTS[key];
  if (!dependents?.length) return [];

  const grantedKeys = new Set(grants.filter(isGranted).map(g => g.key));
  return dependents.filter(dep => grantedKeys.has(dep));
}
