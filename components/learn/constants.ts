import React from "react";
import { useTranslation } from "react-i18next";
import {
  LogIn,
  Store,
  Users,
  Calendar,
  Clock,
  UtensilsCrossed,
  LayoutGrid,
  ShoppingBag,
  Monitor,
  CalendarCheck,
  Package,
  Bell,
  BarChart3,
  Tablet,
  Compass,
  CreditCard,
  ClipboardList,
  Briefcase,
  ShoppingCart,
  HelpCircle,
  Lock,
} from "lucide-react";

// ─── Shared types/constants for the Learn (tutorials) page ────────────────────

export type TFn = ReturnType<typeof useTranslation<"tutorials">>["t"];

export const PART_ICONS: Record<number, React.ElementType> = {
  1: LogIn,
  2: Store,
  3: Users,
  4: Calendar,
  5: Clock,
  6: UtensilsCrossed,
  7: LayoutGrid,
  8: ShoppingBag,
  9: Monitor,
  10: CalendarCheck,
  11: Package,
  12: Bell,
  13: BarChart3,
  14: Tablet,
  15: Compass,
  16: CreditCard,
  17: ClipboardList,
  18: Briefcase,
  19: ShoppingCart,
  20: HelpCircle,
  21: Lock,
};
