import { OpeningHours, OpeningPeriod } from "@/models/business/MyBusinessFullDetails";
import { BusinessMedia } from "@/models/business/BusinessMedia";
import { formatCurrency } from "@/lib/formatCurrency";
import { toIsoCurrencyCode } from "@/utils/currency";

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

// profile.currency can be a legacy symbol string, not just an ISO code —
// Intl.NumberFormat throws on non-ISO codes, so always normalize first.
export function formatMenuPrice(amount: number, currency: string | undefined | null): string {
  return formatCurrency(amount, toIsoCurrencyCode(currency));
}

// BusinessMedia.parseApiArrayResponse doesn't sort by .order itself.
export function getOrderedMedia(media: BusinessMedia[]): BusinessMedia[] {
  return [...media].sort((a, b) => a.order - b.order);
}
