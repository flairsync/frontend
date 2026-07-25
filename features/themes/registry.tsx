import { ComponentType } from "react";
import { DiscoveryBusinessProfile } from "@/models/discovery/DiscoveryBusinessProfile";
import { BusinessMenu } from "@/models/business/menu/BusinessMenu";
import { ModernMinimalTheme } from "./components/ModernMinimal";
import { DefaultTheme } from "./components/DefaultTheme";

export interface ThemeComponentProps {
  profile: DiscoveryBusinessProfile;
  menu: BusinessMenu | null;
}

// Maps a Theme.key (see backend src/themes/entities/theme.entity.ts) to the
// TSX component that renders that theme's full public page. Same
// registry-by-string-key convention the old site-builder used for its
// component tree — just one level instead of nested sections/components.
//
// Only "modern-minimal" has a real component below; the other seeded catalog
// keys ("classic", "warm-bistro") intentionally fall back to DefaultTheme
// until their visual designs are built — that's separate follow-up design
// work, not part of this backend/scaffold pass.
export const THEME_REGISTRY: Record<string, ComponentType<ThemeComponentProps>> = {
  "modern-minimal": ModernMinimalTheme,
};

export const resolveThemeComponent = (
  themeKey: string | null | undefined,
): ComponentType<ThemeComponentProps> => {
  if (themeKey && THEME_REGISTRY[themeKey]) return THEME_REGISTRY[themeKey];
  return DefaultTheme;
};
