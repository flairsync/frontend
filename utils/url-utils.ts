// Accepts "https://instagram.com/x", "www.instagram.com/x", or bare "instagram.com/x"
export const LENIENT_URL_REGEX = /^(https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/[^\s]*)?$/i;

export function normalizeUrl(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
