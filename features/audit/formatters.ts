export const formatFieldName = (field: string): string =>
  field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();

export const renderAuditValue = (val: unknown): string => {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "number") return String(val);
  if (typeof val === "string") return val === "" ? '""' : val;
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if (obj.type === "Point" && Array.isArray(obj.coordinates)) {
      const [lng, lat] = obj.coordinates as number[];
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
    return JSON.stringify(val);
  }
  return String(val);
};
