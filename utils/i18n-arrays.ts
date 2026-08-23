// Tolgee flattens array-of-objects/strings content on export into sibling keys named
// "<field>[0]", "<field>[1]", ... (recursively, at every nested level) instead of a real
// JSON array — while the local static-JSON fallback (used only when Tolgee is unreachable)
// still has real arrays. `t(path, { returnObjects: true })` returns whichever shape the
// active backend actually loaded, so components can't just assume a real array. This walks
// the returned value and reconstructs real arrays from either shape, recursively.
const BRACKET_INDEX = /^(.+)\[(\d+)\]$/;

export function resolveTolgeeArrays<T = unknown>(value: unknown): T {
  if (Array.isArray(value)) {
    return value.map((item) => resolveTolgeeArrays(item)) as unknown as T;
  }
  if (value === null || typeof value !== "object") {
    return value as T;
  }

  const groups = new Map<string, { index: number; value: unknown }[]>();
  const result: Record<string, unknown> = {};

  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const resolved = resolveTolgeeArrays(raw);
    const match = key.match(BRACKET_INDEX);
    if (match) {
      const [, base, indexStr] = match;
      const list = groups.get(base) ?? [];
      list.push({ index: Number(indexStr), value: resolved });
      groups.set(base, list);
    } else {
      result[key] = resolved;
    }
  }

  for (const [base, entries] of groups) {
    result[base] = entries
      .sort((a, b) => a.index - b.index)
      .map((entry) => entry.value);
  }

  return result as T;
}
