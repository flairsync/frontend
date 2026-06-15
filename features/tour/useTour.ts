import { useTourStore } from './tourStore';
import type { TourStep } from './types';

export function useTour() {
  const startTour = useTourStore((s) => s.startTour);
  const endTour = useTourStore((s) => s.endTour);
  const isActive = useTourStore((s) => s.isActive);
  return { startTour, endTour, isActive };
}

export type { TourStep };
