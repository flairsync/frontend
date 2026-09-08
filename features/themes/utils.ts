import { OpeningHours, OpeningPeriod } from "@/models/business/MyBusinessFullDetails";
import { BusinessMedia } from "@/models/business/BusinessMedia";
import { BusinessMenu } from "@/models/business/menu/BusinessMenu";

// Shared width/padding for the sections every theme reuses as-is (Menu,
// Reservation, InfoCards, Reviews) so those line up consistently across all
// three themes, even though each theme's own hero/gallery/footer keeps its
// own distinct layout.
export const SECTION_CONTAINER = "max-w-5xl mx-auto px-6 md:px-10";

const DAY_ORDER: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

// Same day-ordering convention as BusinessDetailsTiming.tsx — returns a new
// array, doesn't mutate the profile's openingHours.
export function sortOpeningHours(hours: OpeningHours[]): OpeningHours[] {
  return [...hours].sort((a, b) => {
    const da = DAY_ORDER[a.day.toLowerCase()] ?? 99;
    const db = DAY_ORDER[b.day.toLowerCase()] ?? 99;
    return da - db;
  });
}

// OpeningPeriod.open/close are bare 'HH:MM:SS' wall-clock strings (no date,
// no timezone) — anchor them to an arbitrary date just to format the time
// portion via the viewer's own locale hour-cycle.
export function formatOpeningPeriod(period: OpeningPeriod): string {
  const format = (time: string) =>
    new Date(`2000-01-01T${time}`).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  return `${format(period.open)} – ${format(period.close)}`;
}

// BusinessMedia.parseApiArrayResponse doesn't sort by .order itself.
export function getOrderedMedia(media: BusinessMedia[]): BusinessMedia[] {
  return [...media].sort((a, b) => a.order - b.order);
}

export interface SignatureMenuItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

// Picks up to `limit` menu items to feature in a theme's "signature dishes"
// spotlight. There's no owner-curation flag on MenuItem, so this deliberately
// stays simple: the first items (in menu order) that the owner has actually
// photographed — a cheap proxy for "the dishes worth showing off" without
// inventing a new field.
export function getSignatureMenuItems(menu: BusinessMenu | null, limit = 4): SignatureMenuItem[] {
  if (!menu) return [];
  const items: SignatureMenuItem[] = [];
  for (const category of menu.getOrderedCategories()) {
    for (const item of category.items ?? []) {
      const imageUrl = item.media?.[0]?.url;
      if (!imageUrl) continue;
      items.push({ id: item.id, name: item.name, price: item.price, imageUrl });
      if (items.length >= limit) return items;
    }
  }
  return items;
}
