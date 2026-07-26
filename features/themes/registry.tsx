import { ComponentType } from "react";
import { DiscoveryBusinessProfile } from "@/models/discovery/DiscoveryBusinessProfile";
import { BusinessMenu } from "@/models/business/menu/BusinessMenu";
import { ClassicTheme } from "./components/ClassicTheme";
import { ModernMinimalTheme } from "./components/ModernMinimal";
import { WarmBistroTheme } from "./components/WarmBistro";
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
// DefaultTheme is reserved purely as the fallback for a null/unregistered
// key (e.g. a business with no theme applied yet) — it is never one of the
// selectable catalog themes itself.
export const THEME_REGISTRY: Record<string, ComponentType<ThemeComponentProps>> = {
  "classic": ClassicTheme,
  "modern-minimal": ModernMinimalTheme,
  "warm-bistro": WarmBistroTheme,
};

export const resolveThemeComponent = (
  themeKey: string | null | undefined,
): ComponentType<ThemeComponentProps> => {
  if (themeKey && THEME_REGISTRY[themeKey]) return THEME_REGISTRY[themeKey];
  return DefaultTheme;
};
