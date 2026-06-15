import { useEffect } from 'react';
import { useTourStore } from './tourStore';
import type { TourStep } from './types';

export function usePageTour(steps: TourStep[]) {
  const registerPageTour = useTourStore((s) => s.registerPageTour);
  const unregisterPageTour = useTourStore((s) => s.unregisterPageTour);

  useEffect(() => {
    registerPageTour(steps);
    return () => unregisterPageTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
