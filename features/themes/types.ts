export type ThemeCategory = "basic" | "premium";

// A catalog entry as returned by GET businesses/:businessId/themes — the base
// Theme row plus per-business `owned`/`applied` flags computed server-side.
export interface ThemeCatalogItem {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: ThemeCategory;
  price: number;
  currency: string;
  previewImageUrl: string | null;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  owned: boolean;
  applied: boolean;
}
